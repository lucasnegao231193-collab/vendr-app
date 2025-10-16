/**
 * API Route: Enviar Notificação
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sendEmail } from '@/lib/notifications/email';
import { sendPushNotification } from '@/lib/notifications/push';

export async function POST(request: NextRequest) {
  try {
    const { userId, type, title, message, channels, data } = await request.json();

    // Verificar autenticação
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    // Buscar usuário
    const { data: user } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const results: any = {
      inApp: false,
      email: false,
      push: false,
    };

    // 1. Notificação In-App (sempre criar)
    if (!channels || channels.includes('in-app')) {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type: type || 'info',
          read: false,
          action_url: data?.url,
        });

      results.inApp = !error;
    }

    // 2. Email
    if (channels?.includes('email') && user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: title,
          html: `
            <h2>${title}</h2>
            <p>${message}</p>
            ${data?.url ? `<a href="${data.url}">Ver mais</a>` : ''}
          `,
        });
        results.email = true;
      } catch (error) {
        console.error('Erro ao enviar email:', error);
      }
    }

    // 3. Push Notification
    if (channels?.includes('push')) {
      try {
        // Buscar subscriptions do usuário
        const { data: subscriptions } = await supabase
          .from('push_subscriptions')
          .select('subscription')
          .eq('user_id', userId)
          .eq('active', true);

        if (subscriptions && subscriptions.length > 0) {
          for (const sub of subscriptions) {
            try {
              await sendPushNotification(sub.subscription, {
                title,
                body: message,
                data,
              });
              results.push = true;
            } catch (error: any) {
              // Se a subscription expirou, desativar
              if (error.expired) {
                await supabase
                  .from('push_subscriptions')
                  .update({ active: false })
                  .eq('subscription', sub.subscription);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao enviar push:', error);
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });

  } catch (error: any) {
    console.error('Erro ao enviar notificação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao enviar notificação' },
      { status: 500 }
    );
  }
}

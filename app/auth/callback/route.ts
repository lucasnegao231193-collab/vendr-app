import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type') || 'empresa';
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  // Se houve erro no OAuth
  if (error) {
    console.error('OAuth Error:', error, error_description);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error_description || error)}`);
  }

  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.set({ name, value: '', ...options });
            },
          },
        }
      );
      
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        console.error('Session Exchange Error:', sessionError);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`);
      }

      if (!sessionData.user) {
        console.error('No user after session exchange');
        return NextResponse.redirect(`${requestUrl.origin}/login?error=no_user`);
      }

      // Buscar perfil do usuário
      const { data: perfil, error: perfilError } = await supabase
        .from('perfis')
        .select('role, empresa_id')
        .eq('user_id', sessionData.user.id)
        .single();

      if (perfilError && perfilError.code !== 'PGRST116') {
        console.error('Profile Fetch Error:', perfilError);
      }

      if (!perfil) {
        // Novo usuário -> redirecionar para onboarding
        const origin = requestUrl.origin;
        console.log('New user, redirecting to onboarding. Type:', type);
        if (type === 'autonomo') {
          return NextResponse.redirect(`${origin}/onboarding/solo`);
        } else {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      // Verificar se é empresa Solo
      const { data: empresa } = await supabase
        .from('empresas')
        .select('is_solo')
        .eq('id', perfil.empresa_id)
        .single();

      // Redirecionar baseado no role e tipo de empresa
      const origin = requestUrl.origin;
      if (perfil.role === 'owner') {
        if (empresa?.is_solo) {
          return NextResponse.redirect(`${origin}/solo`);
        } else {
          return NextResponse.redirect(`${origin}/dashboard`);
        }
      } else if (perfil.role === 'seller') {
        return NextResponse.redirect(`${origin}/vendedor`);
      }
    } catch (error) {
      console.error('Callback Error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=callback_failed`);
    }
  }

  // Fallback - sem code
  console.log('No code provided, redirecting to login');
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}

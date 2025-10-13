import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type') || 'empresa';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    await supabase.auth.exchangeCodeForSession(code);

    // Buscar perfil do usuário
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: perfil } = await supabase
        .from('perfis')
        .select('role, empresa_id')
        .eq('user_id', user.id)
        .single();

      if (!perfil) {
        // Novo usuário -> redirecionar para onboarding
        if (type === 'autonomo') {
          return NextResponse.redirect(new URL('/onboarding/solo', request.url));
        } else {
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }
      }

      // Verificar se é empresa Solo
      const { data: empresa } = await supabase
        .from('empresas')
        .select('is_solo')
        .eq('id', perfil.empresa_id)
        .single();

      // Redirecionar baseado no role e tipo de empresa
      if (perfil.role === 'owner') {
        if (empresa?.is_solo) {
          return NextResponse.redirect(new URL('/solo', request.url));
        } else {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } else if (perfil.role === 'seller') {
        return NextResponse.redirect(new URL('/vendedor', request.url));
      }
    }
  }

  // Fallback
  return NextResponse.redirect(new URL('/login', request.url));
}

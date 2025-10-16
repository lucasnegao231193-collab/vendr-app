import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type') || 'empresa';

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
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
        const origin = requestUrl.origin;
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
    }
  }

  // Fallback
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}

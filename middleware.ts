/**
 * Middleware para proteger rotas e gerenciar auth
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Verificar acesso às áreas protegidas
  const path = request.nextUrl.pathname;
  
  console.log('🛡️ Middleware:', { path, userId: user?.id });
  
  if (user) {
    // PRIMEIRO: Verificar se é admin (admins não têm perfil/empresa)
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    console.log('👮 Middleware - Verificação de admin:', { adminData, adminError });
    
    // Se é admin, permitir acesso sem verificar perfil
    if (adminData) {
      console.log('✅ Middleware - É admin, permitindo acesso');
      return response;
    }
    
    console.log('ℹ️ Middleware - Não é admin, verificando perfil...');
    
    // Buscar tipo de empresa do usuário (apenas para não-admins)
    const { data: perfil } = await supabase
      .from('perfis')
      .select('empresa_id')
      .eq('user_id', user.id)
      .single();
    
    if (perfil) {
      const { data: empresa } = await supabase
        .from('empresas')
        .select('is_solo')
        .eq('id', perfil.empresa_id)
        .single();
      
      // Se é Solo (Autônomo) tentando acessar área de Empresa
      if (empresa?.is_solo && path.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/solo', request.url));
      }
      
      // Se é Empresa tentando acessar área Solo
      if (empresa && !empresa.is_solo && path.startsWith('/solo')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

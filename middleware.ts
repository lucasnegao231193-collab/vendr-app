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
  
  if (user) {
    // Buscar tipo de empresa do usuário
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

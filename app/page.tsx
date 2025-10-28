import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export default async function HomePage() {
  const supabase = await createClient();
  
  console.log('🏠 Home Page - Iniciando verificações');
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log('❌ Home Page - Sem usuário, redirecionando para /login');
    redirect("/login");
  }

  console.log('✅ Home Page - Usuário logado:', user.id);

  // PRIMEIRO: Verificar se é admin
  const { data: adminData, error: adminError } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .single();

  console.log('👤 Home Page - Verificação de admin:', { adminData, adminError });

  if (adminData) {
    // É admin -> redirecionar para painel admin
    console.log('✅ Home Page - É admin, redirecionando para /admin');
    redirect("/admin");
  }
  
  console.log('ℹ️ Home Page - Não é admin, verificando perfil...');

  // Verificar perfil (apenas para não-admins)
  const { data: perfil } = await supabase
    .from("perfis")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!perfil) {
    redirect("/onboarding");
  }

  // Redirecionar conforme role
  if (perfil.role === "owner") {
    redirect("/dashboard");
  } else {
    redirect("/vendedor");
  }
}

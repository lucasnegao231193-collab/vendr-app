import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export default async function HomePage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verificar perfil
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

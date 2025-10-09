/**
 * Helpers de autenticação e autorização
 */
import { createClient as createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export type UserRole = "owner" | "seller";

export interface UserProfile {
  userId: string;
  empresaId: string;
  role: UserRole;
  email: string;
}

/**
 * Obtém o usuário logado ou redireciona para login
 */
export async function requireAuth(): Promise<UserProfile> {
  const supabase = await createServerClient();
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Buscar perfil
  const { data: perfil, error: perfilError } = await supabase
    .from("perfis")
    .select("empresa_id, role")
    .eq("user_id", user.id)
    .single();

  if (perfilError || !perfil) {
    // Usuário sem perfil, redirecionar para onboarding
    redirect("/onboarding");
  }

  return {
    userId: user.id,
    empresaId: perfil.empresa_id,
    role: perfil.role,
    email: user.email || "",
  };
}

/**
 * Verifica se o usuário tem role owner
 */
export async function requireOwner(): Promise<UserProfile> {
  const profile = await requireAuth();
  
  if (profile.role !== "owner") {
    redirect("/vendedor");
  }

  return profile;
}

/**
 * Verifica se o usuário tem role seller
 */
export async function requireSeller(): Promise<UserProfile> {
  const profile = await requireAuth();
  
  if (profile.role !== "seller") {
    redirect("/dashboard");
  }

  return profile;
}

/**
 * Obtém empresa_id do usuário ou null
 */
export async function getEmpresaId(): Promise<string | null> {
  const supabase = await createServerClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from("perfis")
    .select("empresa_id")
    .eq("user_id", user.id)
    .single();

  return perfil?.empresa_id || null;
}

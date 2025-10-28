/**
 * API para deletar produto do estoque
 * Usa Service Role para bypass RLS
 */

import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(request: Request) {
  try {
    // Cliente com Service Role (bypassa RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Cliente normal para verificar autenticação
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {},
          remove(name: string, options: CookieOptions) {},
        },
      }
    );

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar se é owner
    const { data: perfil, error: perfilError } = await supabase
      .from("perfis")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (perfilError || !perfil || perfil.role !== "owner") {
      return NextResponse.json(
        { error: "Apenas owners podem deletar produtos" },
        { status: 403 }
      );
    }

    // Pegar ID do estoque da query
    const { searchParams } = new URL(request.url);
    const estoqueId = searchParams.get("id");

    if (!estoqueId) {
      return NextResponse.json(
        { error: "ID do estoque obrigatório" },
        { status: 400 }
      );
    }

    // Deletar do estoque usando admin client
    const { error: deleteError } = await supabaseAdmin
      .from("estoques")
      .delete()
      .eq("id", estoqueId);

    if (deleteError) {
      console.error("Erro ao deletar estoque:", deleteError);
      throw deleteError;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Produto removido do estoque com sucesso",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro na API delete-product:", error);
    return NextResponse.json(
      {
        error: "Erro ao deletar produto",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

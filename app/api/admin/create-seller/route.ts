/**
 * API para criar vendedor com email e senha
 * Usa Service Role Key (server-only) para criar usuário no Supabase Auth
 */

import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";

const createSellerSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  telefone: z.string().optional(),
  documento: z.string().optional(),
  comissao_padrao: z.number().min(0).max(100).default(10),
});

export async function POST(request: Request) {
  try {
    // 1) Criar cliente Supabase com Service Role (server-only)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Variável de ambiente SERVER ONLY
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 2) Criar cliente normal para verificar quem está fazendo a request
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
            // Not needed for this route
          },
          remove(name: string, options: CookieOptions) {
            // Not needed for this route
          },
        },
      }
    );

    // 3) Verificar autenticação do owner
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // 4) Buscar perfil e verificar se é owner
    const { data: perfil, error: perfilError } = await supabase
      .from("perfis")
      .select("role, empresa_id")
      .eq("user_id", user.id)
      .single();

    if (perfilError || !perfil || perfil.role !== "owner") {
      return NextResponse.json(
        { error: "Apenas owners podem criar vendedores" },
        { status: 403 }
      );
    }

    const empresaId = perfil.empresa_id;

    // 5) Validar body
    const body = await request.json();
    const validated = createSellerSchema.parse(body);

    // 6) Verificar limite do plano
    const { data: empresa, error: empresaError } = await supabase
      .from("empresas")
      .select("plano")
      .eq("id", empresaId)
      .single();

    if (empresaError || !empresa) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    // Calcular limite
    const limites: Record<string, number> = {
      plano1: 3,
      plano2: 5,
      plano3: 10,
    };
    const limite = limites[empresa.plano] || 3;

    // Contar vendedores ativos
    const { count: atual, error: countError } = await supabase
      .from("vendedores")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId)
      .eq("ativo", true);

    if (countError) {
      return NextResponse.json(
        { error: "Erro ao verificar limite" },
        { status: 500 }
      );
    }

    if ((atual || 0) >= limite) {
      return NextResponse.json(
        {
          error: "Limite de vendedores atingido",
          message: `Seu plano permite até ${limite} vendedores. Você já possui ${atual}. Faça upgrade para adicionar mais.`,
          plano: empresa.plano,
          limite,
          atual,
        },
        { status: 422 }
      );
    }

    // 7) Criar usuário no Supabase Auth usando Service Role
    const { data: authData, error: createAuthError } =
      await supabaseAdmin.auth.admin.createUser({
        email: validated.email,
        password: validated.senha,
        email_confirm: true, // Auto-confirmar email
      });

    if (createAuthError || !authData.user) {
      console.error("Erro ao criar usuário:", createAuthError);
      return NextResponse.json(
        {
          error: "Erro ao criar usuário",
          details: createAuthError?.message,
        },
        { status: 500 }
      );
    }

    // 8) Criar vendedor na tabela vendedores
    const { data: vendedor, error: vendedorError } = await supabase
      .from("vendedores")
      .insert({
        nome: validated.nome,
        email: validated.email,
        telefone: validated.telefone || null,
        documento: validated.documento || null,
        comissao_padrao: validated.comissao_padrao / 100, // Converter para decimal
        empresa_id: empresaId,
        user_id: authData.user.id,
        ativo: true,
      })
      .select()
      .single();

    if (vendedorError) {
      console.error("Erro ao criar vendedor:", vendedorError);
      
      // Rollback: deletar usuário criado
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { error: "Erro ao criar vendedor", details: vendedorError.message },
        { status: 500 }
      );
    }

    // 9) Criar perfil com role='seller'
    const { error: perfilVendedorError } = await supabase
      .from("perfis")
      .insert({
        user_id: authData.user.id,
        empresa_id: empresaId,
        role: "seller",
        nome: validated.nome,
      });

    if (perfilVendedorError) {
      console.error("Erro ao criar perfil:", perfilVendedorError);
      
      // Rollback
      await supabase.from("vendedores").delete().eq("id", vendedor.id);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { error: "Erro ao criar perfil", details: perfilVendedorError.message },
        { status: 500 }
      );
    }

    // 10) Log de auditoria
    await supabase.from("audit_logs").insert({
      empresa_id: empresaId,
      user_id: user.id,
      acao: "criar_vendedor",
      entidade: "vendedores",
      entidade_id: vendedor.id,
      detalhes: {
        vendedor_nome: validated.nome,
        vendedor_email: validated.email,
      },
    });

    // 11) Retornar sucesso
    return NextResponse.json(
      {
        success: true,
        vendedor: {
          id: vendedor.id,
          nome: vendedor.nome,
          email: vendedor.email,
          user_id: authData.user.id,
        },
        message: "Vendedor criado com sucesso! Ele já pode fazer login com o email e senha cadastrados.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro na API create-seller:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

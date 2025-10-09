/**
 * API: Criar vendedor com validação de limites do plano
 * POST /api/vendedores
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";

const createVendedorSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  telefone: z.string().optional(),
  doc: z.string().optional(),
  comissao_padrao: z.number().min(0).max(1).default(0.1),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar perfil (empresa_id)
    const { data: perfil, error: perfilError } = await supabase
      .from("perfis")
      .select("empresa_id, role")
      .eq("user_id", user.id)
      .single();

    if (perfilError || !perfil || perfil.role !== "owner") {
      return NextResponse.json(
        { error: "Apenas owners podem criar vendedores" },
        { status: 403 }
      );
    }

    const empresaId = perfil.empresa_id;

    // Parse body
    const body = await request.json();
    const validated = createVendedorSchema.parse(body);

    // ======================================================================
    // VALIDAÇÃO CRÍTICA: Verificar limite de vendedores do plano
    // ======================================================================
    
    // 1. Buscar plano da empresa
    const { data: empresa, error: empresaError } = await supabase
      .from("empresas")
      .select("plano")
      .eq("id", empresaId)
      .single();

    if (empresaError || !empresa) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    // 2. Obter limite do plano
    const limites: Record<string, number> = {
      plano1: 3,
      plano2: 5,
      plano3: 10,
    };
    const limite = limites[empresa.plano] || 3;

    // 3. Contar vendedores ativos
    const { data: vendedoresAtivos, error: countError } = await supabase
      .from("vendedores")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId)
      .eq("ativo", true);

    if (countError) {
      return NextResponse.json({ error: "Erro ao contar vendedores" }, { status: 500 });
    }

    const atual = vendedoresAtivos?.length || 0;

    // 4. Bloquear se atingiu limite
    if (atual >= limite) {
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

    // ======================================================================
    // CRIAR VENDEDOR
    // ======================================================================
    const { data: vendedor, error: insertError } = await supabase
      .from("vendedores")
      .insert({
        nome: validated.nome,
        telefone: validated.telefone,
        doc: validated.doc,
        comissao_padrao: validated.comissao_padrao,
        empresa_id: empresaId,
        ativo: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erro ao criar vendedor:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      vendedor,
      info: {
        plano: empresa.plano,
        limite,
        vendedores_atuais: atual + 1,
        vagas_restantes: limite - atual - 1,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro em POST /api/vendedores:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar empresa_id
    const { data: perfil } = await supabase
      .from("perfis")
      .select("empresa_id")
      .eq("user_id", user.id)
      .single();

    if (!perfil) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    // Buscar vendedores da empresa
    const { data: vendedores, error } = await supabase
      .from("vendedores")
      .select("*")
      .eq("empresa_id", perfil.empresa_id)
      .order("nome");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Buscar plano e limite
    const { data: empresa } = await supabase
      .from("empresas")
      .select("plano")
      .eq("id", perfil.empresa_id)
      .single();

    const limites: Record<string, number> = {
      plano1: 3,
      plano2: 5,
      plano3: 10,
    };
    const limite = empresa ? limites[empresa.plano] || 3 : 3;
    const ativos = vendedores?.filter((v) => v.ativo).length || 0;

    return NextResponse.json({
      vendedores,
      plano: empresa?.plano || "plano1",
      limite,
      ativos,
      pode_criar: ativos < limite,
    });
  } catch (error: any) {
    console.error("Erro em GET /api/vendedores:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

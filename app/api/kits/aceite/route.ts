/**
 * API: Vendedor aceitar ou recusar kit
 * POST /api/kits/aceite
 * CRÍTICO: Grava accepted_at quando aceitar
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";

const aceiteSchema = z.object({
  kit_id: z.string().uuid(),
  acao: z.enum(["aceitar", "recusar"]),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar perfil (deve ser seller)
    const { data: perfil } = await supabase
      .from("perfis")
      .select("empresa_id, role")
      .eq("user_id", user.id)
      .single();

    if (!perfil || perfil.role !== "seller") {
      return NextResponse.json(
        { error: "Apenas vendedores podem aceitar/recusar kits" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = aceiteSchema.parse(body);

    // Buscar vendedor vinculado ao usuário
    // (Assumindo que existe relação, aqui simplificado - buscar primeiro vendedor da empresa)
    const { data: vendedor } = await supabase
      .from("vendedores")
      .select("id")
      .eq("empresa_id", perfil.empresa_id)
      .limit(1)
      .single();

    if (!vendedor) {
      return NextResponse.json({ error: "Vendedor não encontrado" }, { status: 404 });
    }

    // Buscar kit para verificar se pertence ao vendedor
    const { data: kit, error: kitError } = await supabase
      .from("kits")
      .select("id, status, vendedor_id")
      .eq("id", validated.kit_id)
      .eq("vendedor_id", vendedor.id)
      .single();

    if (kitError || !kit) {
      return NextResponse.json({ error: "Kit não encontrado" }, { status: 404 });
    }

    if (kit.status !== "pendente") {
      return NextResponse.json(
        { error: `Kit já foi ${kit.status}` },
        { status: 400 }
      );
    }

    // ======================================================================
    // CRÍTICO: Atualizar status e accepted_at
    // ======================================================================
    const novoStatus = validated.acao === "aceitar" ? "aceito" : "recusado";
    const updateData: any = {
      status: novoStatus,
    };

    // Se aceitar, gravar accepted_at=now()
    if (validated.acao === "aceitar") {
      updateData.accepted_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("kits")
      .update(updateData)
      .eq("id", validated.kit_id);

    if (updateError) {
      console.error("Erro ao atualizar kit:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message:
        validated.acao === "aceitar"
          ? "Estoque aceito com sucesso!"
          : "Estoque recusado",
      status: novoStatus,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro em /api/kits/aceite:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar aceite" },
      { status: 500 }
    );
  }
}

/**
 * GET: Buscar kit pendente do vendedor logado (se houver)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: perfil } = await supabase
      .from("perfis")
      .select("empresa_id")
      .eq("user_id", user.id)
      .single();

    if (!perfil) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    // Buscar vendedor
    const { data: vendedor } = await supabase
      .from("vendedores")
      .select("id")
      .eq("empresa_id", perfil.empresa_id)
      .limit(1)
      .single();

    if (!vendedor) {
      return NextResponse.json({ kits: [] });
    }

    // Buscar kits pendentes do dia
    const hoje = new Date().toISOString().split("T")[0];
    const { data: kits, error } = await supabase
      .from("kits")
      .select(
        `
        *,
        kit_itens (
          *,
          produtos (nome, unidade)
        )
      `
      )
      .eq("vendedor_id", vendedor.id)
      .eq("status", "pendente")
      .gte("data", hoje)
      .order("assigned_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar kits pendentes:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ kits: kits || [] });
  } catch (error: any) {
    console.error("Erro em GET /api/kits/aceite:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

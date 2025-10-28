/**
 * API Route: Atribuir estoque (kit) ao vendedor
 * CRÍTICO: Grava assigned_at, status='pendente', valor_unit_atribuido (snapshot do preço)
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";

const kitSchema = z.object({
  vendedor_id: z.string().uuid(),
  data: z.string().optional(),
  comissao_percent: z.number().min(0).max(1),
  itens: z.array(
    z.object({
      produto_id: z.string().uuid(),
      qtd_atribuida: z.number().min(1),
    })
  ),
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

    // Buscar perfil
    const { data: perfil } = await supabase
      .from("perfis")
      .select("empresa_id, role")
      .eq("user_id", user.id)
      .single();

    if (!perfil || perfil.role !== "owner") {
      return NextResponse.json(
        { error: "Apenas owners podem atribuir estoque" },
        { status: 403 }
      );
    }

    const empresaId = perfil.empresa_id;

    const body = await request.json();
    const validated = kitSchema.parse(body);

    // Verificar se vendedor pertence à empresa
    const { data: vendedor, error: vendedorError } = await supabase
      .from("vendedores")
      .select("id, empresa_id")
      .eq("id", validated.vendedor_id)
      .eq("empresa_id", empresaId)
      .single();

    if (vendedorError || !vendedor) {
      return NextResponse.json({ error: "Vendedor não encontrado" }, { status: 404 });
    }

    // ======================================================================
    // CRÍTICO: Buscar preços dos produtos (snapshot no momento da atribuição)
    // ======================================================================
    const produtoIds = validated.itens.map((i) => i.produto_id);
    const { data: produtos, error: prodError } = await supabase
      .from("produtos")
      .select("id, preco")
      .in("id", produtoIds);

    if (prodError || !produtos) {
      return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
    }

    const precoMap = new Map(produtos.map((p) => [p.id, p.preco]));

    // ======================================================================
    // Criar kit com status='pendente' e assigned_at=now() (default no DB)
    // ======================================================================
    const { data: kit, error: kitError } = await supabase
      .from("kits")
      .insert({
        vendedor_id: validated.vendedor_id,
        empresa_id: empresaId,
        data: validated.data || new Date().toISOString().split("T")[0],
        comissao_percent: validated.comissao_percent,
        status: "pendente", // Aguardando aceite do vendedor
        // assigned_at é default now() no DB
      })
      .select()
      .single();

    if (kitError) {
      console.error("Erro ao criar kit:", kitError);
      return NextResponse.json({ error: kitError.message }, { status: 400 });
    }

    // ======================================================================
    // Criar itens do kit COM valor_unit_atribuido (snapshot do preço)
    // ======================================================================
    const kitItens = validated.itens.map((item) => ({
      kit_id: kit.id,
      produto_id: item.produto_id,
      qtd_atribuida: item.qtd_atribuida,
      valor_unit_atribuido: precoMap.get(item.produto_id) || 0, // CRÍTICO: snapshot
    }));

    const { error: itensError } = await supabase.from("kit_itens").insert(kitItens);

    if (itensError) {
      console.error("Erro ao criar kit_itens:", itensError);
      // Rollback: deletar kit
      await supabase.from("kits").delete().eq("id", kit.id);
      return NextResponse.json({ error: itensError.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        kit,
        message: "Estoque atribuído! Aguardando aceite do vendedor.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao criar kit:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar kit" },
      { status: 500 }
    );
  }
}

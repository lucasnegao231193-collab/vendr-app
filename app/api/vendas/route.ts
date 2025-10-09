/**
 * API Route: POST /api/vendas
 * Registra nova venda
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { vendaSchema } from "@/lib/validation";
import { getEmpresaId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const empresaId = await getEmpresaId();

    if (!empresaId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validated = vendaSchema.parse(body);

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

    // Verificar se produto pertence à empresa
    const { data: produto, error: produtoError } = await supabase
      .from("produtos")
      .select("id, empresa_id")
      .eq("id", validated.produto_id)
      .eq("empresa_id", empresaId)
      .single();

    if (produtoError || !produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    // Criar venda
    const { data: venda, error: vendaError } = await supabase
      .from("vendas")
      .insert({
        vendedor_id: validated.vendedor_id,
        produto_id: validated.produto_id,
        qtd: validated.qtd,
        valor_unit: validated.valor_unit,
        meio_pagamento: validated.meio_pagamento,
        status: validated.status,
        empresa_id: empresaId,
      })
      .select()
      .single();

    if (vendaError) {
      return NextResponse.json({ error: vendaError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, venda }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao registrar venda:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao registrar venda" },
      { status: 500 }
    );
  }
}

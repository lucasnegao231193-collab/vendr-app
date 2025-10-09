/**
 * API Route: POST /api/fechamento
 * Fecha o dia do vendedor, calculando totais e comissão
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { fechamentoSchema } from "@/lib/validation";
import { getEmpresaId } from "@/lib/auth";
import { calcularTotaisVendedor, buscarKitVendedor } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const empresaId = await getEmpresaId();

    if (!empresaId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validated = fechamentoSchema.parse(body);

    // Verificar se vendedor pertence à empresa
    const { data: vendedor, error: vendedorError } = await supabase
      .from("vendedores")
      .select("id, empresa_id, comissao_padrao")
      .eq("id", validated.vendedor_id)
      .eq("empresa_id", empresaId)
      .single();

    if (vendedorError || !vendedor) {
      return NextResponse.json({ error: "Vendedor não encontrado" }, { status: 404 });
    }

    // Calcular totais de vendas do dia
    const totais = await calcularTotaisVendedor(validated.vendedor_id, validated.data, true);

    // Buscar kit do dia para pegar % comissão
    const kit = await buscarKitVendedor(validated.vendedor_id, validated.data, true);
    const comissaoPercent = kit?.comissao_percent || vendedor.comissao_padrao;

    // Calcular comissão
    const comissaoCalculada = totais.total * comissaoPercent;

    // Verificar se já existe fechamento
    const { data: existente } = await supabase
      .from("fechamentos")
      .select("id")
      .eq("vendedor_id", validated.vendedor_id)
      .eq("data", validated.data)
      .single();

    let result;

    if (existente) {
      // Atualizar fechamento existente
      const { data, error } = await supabase
        .from("fechamentos")
        .update({
          total: totais.total,
          total_pix: totais.total_pix,
          total_cartao: totais.total_cartao,
          total_dinheiro: totais.total_dinheiro,
          comissao_calculada: comissaoCalculada,
        })
        .eq("id", existente.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Criar novo fechamento
      const { data, error } = await supabase
        .from("fechamentos")
        .insert({
          vendedor_id: validated.vendedor_id,
          data: validated.data,
          total: totais.total,
          total_pix: totais.total_pix,
          total_cartao: totais.total_cartao,
          total_dinheiro: totais.total_dinheiro,
          comissao_calculada: comissaoCalculada,
          empresa_id: empresaId,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json(
      {
        success: true,
        fechamento: result,
        totais,
        comissao_percent: comissaoPercent,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao fechar dia:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao fechar dia" },
      { status: 500 }
    );
  }
}

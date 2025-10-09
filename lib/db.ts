/**
 * Helpers de banco de dados e queries comuns
 */
import { createClient as createBrowserClient } from "@/lib/supabase-browser";

export type MeioPagamento = "pix" | "cartao" | "dinheiro";

/**
 * Calcula totais de vendas por vendedor no dia
 */
export async function calcularTotaisVendedor(
  vendedorId: string,
  data: string,
  isServer = false
) {
  const supabase = createBrowserClient();

  const { data: vendas, error } = await supabase
    .from("vendas")
    .select("qtd, valor_unit, meio_pagamento")
    .eq("vendedor_id", vendedorId)
    .gte("data_hora", `${data}T00:00:00`)
    .lte("data_hora", `${data}T23:59:59`)
    .eq("status", "confirmado");

  if (error) throw error;

  const totais = {
    total: 0,
    total_pix: 0,
    total_cartao: 0,
    total_dinheiro: 0,
    qtd_vendas: vendas?.length || 0,
  };

  vendas?.forEach((venda) => {
    const valor = venda.qtd * venda.valor_unit;
    totais.total += valor;

    if (venda.meio_pagamento === "pix") totais.total_pix += valor;
    else if (venda.meio_pagamento === "cartao") totais.total_cartao += valor;
    else if (venda.meio_pagamento === "dinheiro") totais.total_dinheiro += valor;
  });

  return totais;
}

/**
 * Busca kit do vendedor no dia
 */
export async function buscarKitVendedor(vendedorId: string, data: string, isServer = false) {
  const supabase = createBrowserClient();

  const { data: kit, error } = await supabase
    .from("kits")
    .select(
      `
      id,
      data,
      comissao_percent,
      kit_itens (
        id,
        qtd_atribuida,
        produto_id,
        produtos (
          id,
          nome,
          preco,
          unidade
        )
      )
    `
    )
    .eq("vendedor_id", vendedorId)
    .eq("data", data)
    .single();

  if (error) return null;
  return kit;
}

/**
 * Busca produtos ativos da empresa
 */
export async function buscarProdutosAtivos(empresaId: string, isServer = false) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("ativo", true)
    .order("nome");

  if (error) throw error;
  return data || [];
}

/**
 * Busca vendedores ativos da empresa
 */
export async function buscarVendedoresAtivos(empresaId: string, isServer = false) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("vendedores")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("ativo", true)
    .order("nome");

  if (error) throw error;
  return data || [];
}

/**
 * Calcula quantidades vendidas de cada produto do kit
 */
export async function calcularQtdVendidas(
  vendedorId: string,
  data: string,
  produtoIds: string[],
  isServer = false
) {
  const supabase = createBrowserClient();

  const { data: vendas, error } = await supabase
    .from("vendas")
    .select("produto_id, qtd")
    .eq("vendedor_id", vendedorId)
    .gte("data_hora", `${data}T00:00:00`)
    .lte("data_hora", `${data}T23:59:59`)
    .in("produto_id", produtoIds)
    .eq("status", "confirmado");

  if (error) throw error;

  const qtdMap: Record<string, number> = {};
  produtoIds.forEach((id) => (qtdMap[id] = 0));

  vendas?.forEach((venda: any) => {
    qtdMap[venda.produto_id] = (qtdMap[venda.produto_id] || 0) + venda.qtd;
  });

  return qtdMap;
}

/**
 * Busca vendas do dia para uma empresa
 */
export async function buscarVendasDia(empresaId: string, data: string, isServer = false) {
  const supabase = createBrowserClient();

  const { data: vendas, error } = await supabase
    .from("vendas")
    .select(
      `
      *,
      vendedores (nome),
      produtos (nome)
    `
    )
    .eq("empresa_id", empresaId)
    .gte("data_hora", `${data}T00:00:00`)
    .lte("data_hora", `${data}T23:59:59`)
    .order("data_hora", { ascending: false });

  if (error) throw error;
  return vendas || [];
}

/**
 * Exporta vendas para CSV
 */
export function exportarVendasCSV(
  vendas: Array<{
    data_hora: string;
    vendedores: { nome: string } | null;
    produtos: { nome: string } | null;
    qtd: number;
    valor_unit: number;
    meio_pagamento: string;
  }>
): string {
  const headers = ["Data/Hora", "Vendedor", "Produto", "Qtd", "Valor Unit", "Meio Pagamento", "Total"];
  const rows = vendas.map((v) => [
    new Date(v.data_hora).toLocaleString("pt-BR"),
    v.vendedores?.nome || "-",
    v.produtos?.nome || "-",
    v.qtd,
    v.valor_unit,
    v.meio_pagamento,
    (v.qtd * v.valor_unit).toFixed(2),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  return csv;
}

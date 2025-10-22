import { createClient } from '@/lib/supabase-browser';
import { ResumoPessoal, TransacaoPessoal } from '@/types/venlo-mode';

const supabase = createClient();

/**
 * Busca o resumo financeiro pessoal do mês
 */
export async function getResumoPessoal(
  userId: string,
  ano: number,
  mes: number
): Promise<ResumoPessoal> {
  try {
    // Data início e fim do mês
    const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(ano, mes, 0).getDate();
    const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${ultimoDia}`;

    // Buscar transações do mês
    const { data: transacoes, error: transacoesError } = await supabase
      .from('financas_pessoais')
      .select('*')
      .eq('user_id', userId)
      .gte('data', dataInicio)
      .lte('data', dataFim)
      .order('data', { ascending: false });

    if (transacoesError) {
      console.error('Erro ao buscar transações:', transacoesError);
      throw transacoesError;
    }

    // Buscar meta do mês
    const { data: metaData } = await supabase
      .from('metas_pessoais')
      .select('meta_economia')
      .eq('user_id', userId)
      .eq('ano', ano)
      .eq('mes', mes)
      .single();

    const meta = metaData?.meta_economia || 0;

    // Calcular totais
    const entradas = transacoes
      ?.filter(t => t.tipo === 'entrada')
      .reduce((sum, t) => sum + Number(t.valor), 0) || 0;

    const saidas = transacoes
      ?.filter(t => t.tipo === 'saida')
      .reduce((sum, t) => sum + Number(t.valor), 0) || 0;

    const saldo = entradas - saidas;
    const percentualMeta = meta > 0 ? (saldo / meta) * 100 : 0;

    return {
      entradas,
      saidas,
      saldo,
      meta,
      percentualMeta,
      transacoes: transacoes || [],
    };
  } catch (error) {
    console.error('Erro ao buscar resumo pessoal:', error);
    throw error;
  }
}

/**
 * Busca transações com filtros
 */
export async function listTransacoes(
  userId: string,
  filters?: {
    tipo?: 'entrada' | 'saida';
    categoria?: string;
    dataInicio?: string;
    dataFim?: string;
    limit?: number;
  }
): Promise<TransacaoPessoal[]> {
  try {
    let query = supabase
      .from('financas_pessoais')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters?.tipo) {
      query = query.eq('tipo', filters.tipo);
    }

    if (filters?.categoria) {
      query = query.eq('categoria', filters.categoria);
    }

    if (filters?.dataInicio) {
      query = query.gte('data', filters.dataInicio);
    }

    if (filters?.dataFim) {
      query = query.lte('data', filters.dataFim);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao listar transações:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    throw error;
  }
}

/**
 * Busca gastos por categoria para gráfico
 */
export async function getGastosPorCategoria(
  userId: string,
  ano: number,
  mes: number
): Promise<{ categoria: string; total: number }[]> {
  try {
    const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(ano, mes, 0).getDate();
    const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${ultimoDia}`;

    const { data, error } = await supabase
      .from('financas_pessoais')
      .select('categoria, valor')
      .eq('user_id', userId)
      .eq('tipo', 'saida')
      .gte('data', dataInicio)
      .lte('data', dataFim);

    if (error) {
      console.error('Erro ao buscar gastos por categoria:', error);
      throw error;
    }

    // Agrupar por categoria
    const grouped = (data || []).reduce((acc, item) => {
      const categoria = item.categoria;
      if (!acc[categoria]) {
        acc[categoria] = 0;
      }
      acc[categoria] += Number(item.valor);
      return acc;
    }, {} as Record<string, number>);

    // Converter para array e ordenar
    return Object.entries(grouped)
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total);
  } catch (error) {
    console.error('Erro ao buscar gastos por categoria:', error);
    throw error;
  }
}

/**
 * Busca evolução mensal (últimos 6 meses)
 */
export async function getEvolucaoMensal(
  userId: string
): Promise<{ mes: string; entradas: number; saidas: number }[]> {
  try {
    const hoje = new Date();
    const meses = [];

    // Últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const ano = data.getFullYear();
      const mes = data.getMonth() + 1;
      
      const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
      const ultimoDia = new Date(ano, mes, 0).getDate();
      const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${ultimoDia}`;

      const { data: transacoes } = await supabase
        .from('financas_pessoais')
        .select('tipo, valor')
        .eq('user_id', userId)
        .gte('data', dataInicio)
        .lte('data', dataFim);

      const entradas = transacoes
        ?.filter(t => t.tipo === 'entrada')
        .reduce((sum, t) => sum + Number(t.valor), 0) || 0;

      const saidas = transacoes
        ?.filter(t => t.tipo === 'saida')
        .reduce((sum, t) => sum + Number(t.valor), 0) || 0;

      meses.push({
        mes: data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        entradas,
        saidas,
      });
    }

    return meses;
  } catch (error) {
    console.error('Erro ao buscar evolução mensal:', error);
    throw error;
  }
}

/**
 * Funções Helper para Vendr Solo
 * Lógica de cotas, limites e validações
 */
import { createClient } from '@/lib/supabase-server';
import { SoloCota, SoloLimite, PlanoType } from '@/types/solo';

/**
 * Obtém a cota atual do mês para uma empresa Solo
 */
export async function getSoloCotaAtual(empresaId: string): Promise<{
  anoMes: string;
  vendasMes: number;
  limite: number;
  plano: PlanoType;
  limiteAtingido: boolean;
}> {
  const supabase = await createClient();
  
  const anoMes = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  
  // Buscar empresa e cota
  const { data: empresa } = await supabase
    .from('empresas')
    .select('plano, is_solo')
    .eq('id', empresaId)
    .single();
  
  if (!empresa || !empresa.is_solo) {
    throw new Error('Empresa não é Solo');
  }
  
  const { data: cota } = await supabase
    .from('solo_cotas')
    .select('*')
    .eq('empresa_id', empresaId)
    .eq('ano_mes', anoMes)
    .single();
  
  const vendasMes = cota?.vendas_mes || 0;
  const limite = empresa.plano === 'solo_free' ? 30 : 999999;
  const limiteAtingido = empresa.plano === 'solo_free' && vendasMes >= 30;
  
  return {
    anoMes,
    vendasMes,
    limite,
    plano: empresa.plano as PlanoType,
    limiteAtingido,
  };
}

/**
 * Verifica se pode criar nova venda (checa limite)
 */
export async function podeRegistrarVenda(empresaId: string): Promise<{
  pode: boolean;
  motivo?: string;
}> {
  try {
    const cota = await getSoloCotaAtual(empresaId);
    
    if (cota.limiteAtingido) {
      return {
        pode: false,
        motivo: 'Limite mensal atingido. Faça upgrade para o Solo Pro.',
      };
    }
    
    return { pode: true };
  } catch (error) {
    return {
      pode: false,
      motivo: 'Erro ao verificar limite',
    };
  }
}

/**
 * Incrementa a cota de vendas do mês
 */
export async function incrementarCota(empresaId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const anoMes = new Date().toISOString().slice(0, 7);
  
  // Usar função SQL que já verifica limite
  const { data, error } = await supabase.rpc('increment_solo_cota', {
    p_empresa_id: empresaId,
  });
  
  if (error) {
    console.error('Erro ao incrementar cota:', error);
    return false;
  }
  
  return data === true;
}

/**
 * Obtém estatísticas do dashboard Solo
 */
export async function getSoloStats(empresaId: string): Promise<{
  vendasHoje: number;
  lucroEstimado: number;
  produtosAtivos: number;
  estoqueTotal: number;
  vendasMes: number;
  limiteVendas: number;
  plano: PlanoType;
}> {
  const supabase = await createClient();
  
  const hoje = new Date().toISOString().split('T')[0];
  
  // Vendas hoje
  const { count: vendasHoje } = await supabase
    .from('vendas')
    .select('*', { count: 'exact', head: true })
    .eq('empresa_id', empresaId)
    .gte('data_hora', `${hoje}T00:00:00`)
    .lte('data_hora', `${hoje}T23:59:59`)
    .eq('status', 'confirmado');
  
  // Lucro estimado (soma dos valores)
  const { data: vendas } = await supabase
    .from('vendas')
    .select('qtd, valor_unit')
    .eq('empresa_id', empresaId)
    .gte('data_hora', `${hoje}T00:00:00`)
    .lte('data_hora', `${hoje}T23:59:59`)
    .eq('status', 'confirmado');
  
  const lucroEstimado = (vendas || []).reduce(
    (sum, v) => sum + (v.qtd * v.valor_unit),
    0
  );
  
  // Produtos ativos
  const { count: produtosAtivos } = await supabase
    .from('produtos')
    .select('*', { count: 'exact', head: true })
    .eq('empresa_id', empresaId)
    .eq('ativo', true);
  
  // Estoque total (soma de unidades)
  const { data: estoques } = await supabase
    .from('produtos')
    .select('estoque_atual')
    .eq('empresa_id', empresaId)
    .eq('ativo', true);
  
  const estoqueTotal = (estoques || []).reduce(
    (sum, e) => sum + (e.estoque_atual || 0),
    0
  );
  
  // Cota do mês
  const cota = await getSoloCotaAtual(empresaId);
  
  return {
    vendasHoje: vendasHoje || 0,
    lucroEstimado,
    produtosAtivos: produtosAtivos || 0,
    estoqueTotal,
    vendasMes: cota.vendasMes,
    limiteVendas: cota.limite,
    plano: cota.plano,
  };
}

/**
 * Verifica se usuário tem acesso ao modo Solo
 */
export async function isSoloUser(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('user_id', userId)
    .single();
  
  if (!perfil) return false;
  
  const { data: empresa } = await supabase
    .from('empresas')
    .select('is_solo')
    .eq('id', perfil.empresa_id)
    .single();
  
  return empresa?.is_solo === true;
}

/**
 * Obtém ID da empresa do usuário
 */
export async function getEmpresaIdByUser(userId: string): Promise<string | null> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('user_id', userId)
    .single();
  
  return data?.empresa_id || null;
}

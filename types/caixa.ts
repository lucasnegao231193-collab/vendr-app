/**
 * Tipos para Módulo de Caixa
 */

export type EscopoCaixa = 'empresa' | 'vendedor' | 'solo';
export type StatusCaixa = 'Aberto' | 'Fechado';
export type TipoMovimentacao = 'Entrada' | 'Saida';
export type MetodoPagamento = 'Dinheiro' | 'PIX' | 'Debito' | 'Credito' | 'Outros';

export interface Caixa {
  id: string;
  escopo: EscopoCaixa;
  empresa_id?: string;
  vendedor_id?: string;
  user_id?: string;
  responsavel_id: string;
  saldo_inicial: number;
  saldo_fechamento?: number;
  status: StatusCaixa;
  data_abertura: string;
  data_fechamento?: string;
  observacao?: string;
  created_at: string;
  updated_at: string;
}

export interface CaixaMovimentacao {
  id: string;
  caixa_id: string;
  tipo: TipoMovimentacao;
  metodo_pagamento: MetodoPagamento;
  valor: number;
  venda_id?: string;
  solo_servico_id?: string;
  devolucao_id?: string;
  transferencia_id?: string;
  descricao: string;
  data_hora: string;
  criado_por: string;
  created_at: string;
}

export interface CaixaInput {
  escopo: EscopoCaixa;
  empresa_id?: string;
  vendedor_id?: string;
  user_id?: string;
  saldo_inicial: number;
  observacao?: string;
}

export interface MovimentacaoInput {
  caixa_id: string;
  tipo: TipoMovimentacao;
  metodo_pagamento: MetodoPagamento;
  valor: number;
  venda_id?: string;
  solo_servico_id?: string;
  devolucao_id?: string;
  transferencia_id?: string;
  descricao: string;
}

export interface CaixaFechamentoInput {
  caixa_id: string;
  saldo_fechamento: number;
}

export interface CaixaResumo {
  caixa: Caixa;
  total_entradas: number;
  total_saidas: number;
  saldo_teorico: number;
  diferenca?: number;
  movimentacoes_por_metodo: {
    metodo: MetodoPagamento;
    entradas: number;
    saidas: number;
    total: number;
  }[];
  total_movimentacoes: number;
}

export interface CaixaStats {
  caixas_abertos: number;
  caixas_fechados_mes: number;
  total_entradas_mes: number;
  total_saidas_mes: number;
  saldo_medio: number;
}

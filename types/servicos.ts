/**
 * Tipos para Módulo de Serviços (Solo)
 */

export type CategoriaServico = 'Limpeza' | 'Beleza' | 'Construção' | 'Transporte' | 'Outros';
export type StatusVendaServico = 'Pendente' | 'Concluído' | 'Cancelado';
export type MetodoPagamento = 'Dinheiro' | 'PIX' | 'Debito' | 'Credito' | 'Outros';

// Catálogo de serviços oferecidos
export interface ServicoCatalogo {
  id: string;
  user_id: string;
  nome: string;
  categoria: CategoriaServico;
  descricao?: string;
  valor_unitario: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServicoCatalogoInput {
  nome: string;
  categoria: CategoriaServico;
  descricao?: string;
  valor_unitario: number;
  ativo?: boolean;
}

// Venda de serviço
export interface VendaServico {
  id: string;
  user_id: string;
  servico_id: string;
  cliente_nome?: string;
  cliente_telefone?: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  metodo_pagamento: MetodoPagamento;
  status: StatusVendaServico;
  data_venda: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Dados do serviço (join)
  servico?: ServicoCatalogo;
}

export interface VendaServicoInput {
  servico_id: string;
  cliente_nome?: string;
  cliente_telefone?: string;
  quantidade: number;
  valor_unitario: number;
  metodo_pagamento: MetodoPagamento;
  status?: StatusVendaServico;
  observacoes?: string;
}

export interface ServicosStats {
  total_vendas: number;
  faturamento_total: number;
  servico_mais_vendido?: string;
  total_mes_atual: number;
}

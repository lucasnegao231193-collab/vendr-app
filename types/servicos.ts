/**
 * Tipos para Módulo de Serviços (Solo)
 */

export type CategoriaServico = 'Limpeza' | 'Beleza' | 'Construção' | 'Transporte' | 'Outros';
export type StatusServico = 'Pendente' | 'Concluído' | 'Pago';

export interface SoloServico {
  id: string;
  user_id: string;
  nome: string;
  categoria: CategoriaServico;
  descricao?: string;
  valor_unitario: number;
  quantidade: number;
  status: StatusServico;
  data: string; // ISO date string
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface SoloServicoInput {
  nome: string;
  categoria: CategoriaServico;
  descricao?: string;
  valor_unitario: number;
  quantidade: number;
  status: StatusServico;
  data: string;
  observacoes?: string;
}

export interface ServicoStats {
  total_servicos: number;
  total_recebido: number;
  total_pendente: number;
  total_concluido: number;
}

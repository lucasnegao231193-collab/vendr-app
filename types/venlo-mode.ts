import { z } from 'zod';

// Tipo do modo Venlo
export type VenloMode = 'PROFISSIONAL' | 'PESSOAL';

// Tipo de transação pessoal
export type TipoTransacao = 'entrada' | 'saida';

// Interface de transação pessoal
export interface TransacaoPessoal {
  id: string;
  user_id: string;
  tipo: TipoTransacao;
  categoria: string;
  descricao?: string;
  valor: number;
  data: string;
  created_at: string;
  updated_at: string;
}

// Interface de meta pessoal
export interface MetaPessoal {
  id: string;
  user_id: string;
  ano: number;
  mes: number;
  meta_economia: number;
  created_at: string;
  updated_at: string;
}

// Schema de validação para transação pessoal
export const transacaoPessoalSchema = z.object({
  tipo: z.enum(['entrada', 'saida'], {
    required_error: 'Tipo é obrigatório',
    invalid_type_error: 'Tipo deve ser entrada ou saida',
  }),
  categoria: z.string().min(2, 'Categoria deve ter no mínimo 2 caracteres'),
  descricao: z.string().optional(),
  valor: z.number().nonnegative('Valor deve ser maior ou igual a zero'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
});

// Schema de validação para meta pessoal
export const metaPessoalSchema = z.object({
  ano: z.number().int().min(2020).max(2100),
  mes: z.number().int().min(1).max(12),
  meta_economia: z.number().nonnegative('Meta deve ser maior ou igual a zero'),
});

// Tipo inferido do schema
export type TransacaoPessoalInput = z.infer<typeof transacaoPessoalSchema>;
export type MetaPessoalInput = z.infer<typeof metaPessoalSchema>;

// Categorias predefinidas
export const CATEGORIAS_ENTRADA = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Presente',
  'Reembolso',
  'Outros',
] as const;

export const CATEGORIAS_SAIDA = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Compras',
  'Contas',
  'Investimentos',
  'Outros',
] as const;

// Resumo financeiro
export interface ResumoPessoal {
  entradas: number;
  saidas: number;
  saldo: number;
  meta: number;
  percentualMeta: number;
  transacoes: TransacaoPessoal[];
}

// Filtros para listagem
export interface FiltrosTransacoes {
  tipo?: TipoTransacao;
  categoria?: string;
  dataInicio?: string;
  dataFim?: string;
  limit?: number;
  offset?: number;
}

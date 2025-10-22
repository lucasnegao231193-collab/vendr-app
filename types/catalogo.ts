import { z } from 'zod';

// Tipos principais
export interface Estabelecimento {
  id: string;
  user_id: string;
  nome: string;
  categoria: string;
  descricao?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  site?: string;
  instagram?: string;
  imagens?: string[];
  aprovado: boolean;
  destaque: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface Avaliacao {
  id: string;
  estabelecimento_id: string;
  user_id: string;
  nota: number;
  comentario?: string;
  criado_em: string;
}

export interface EstabelecimentoComStats extends Estabelecimento {
  total_avaliacoes: number;
  nota_media: number;
}

// Schemas de validação
export const estabelecimentoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  descricao: z.string().max(1000).optional(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().max(200).optional(),
  cidade: z.string().max(100).optional(),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres').optional().or(z.literal('')),
  site: z.string().url('URL inválida').optional().or(z.literal('')),
  instagram: z.string().optional(),
  imagens: z.array(z.string()).max(5, 'Máximo de 5 imagens').optional(),
});

export const avaliacaoSchema = z.object({
  estabelecimento_id: z.string().uuid(),
  nota: z.number().int().min(1).max(5),
  comentario: z.string().max(500).optional(),
});

// Categorias disponíveis
export const CATEGORIAS = [
  'Alimentação',
  'Beleza e Estética',
  'Construção e Reformas',
  'Educação',
  'Saúde e Bem-estar',
  'Serviços Automotivos',
  'Serviços Domésticos',
  'Tecnologia',
  'Transporte',
  'Vestuário e Moda',
  'Outros',
] as const;

export type Categoria = typeof CATEGORIAS[number];

// Estados brasileiros
export const ESTADOS = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
] as const;

// Filtros de busca
export interface FiltrosCatalogo {
  busca?: string;
  categoria?: string;
  cidade?: string;
  estado?: string;
  destaque?: boolean;
  page?: number;
  limit?: number;
}

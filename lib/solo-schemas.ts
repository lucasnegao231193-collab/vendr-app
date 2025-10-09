/**
 * Schemas Zod para validação - Vendr Solo
 */
import { z } from 'zod';

// Schema para criação de venda Solo
export const soloVendaSchema = z.object({
  itens: z.array(
    z.object({
      produto_id: z.string().uuid('ID do produto inválido'),
      qtd: z.number().int().positive('Quantidade deve ser positiva'),
    })
  ).min(1, 'Adicione pelo menos um produto'),
  metodo_pagamento: z.enum(['pix', 'cartao', 'dinheiro'], {
    required_error: 'Selecione um método de pagamento',
  }),
});

// Schema para onboarding Solo
export const soloOnboardingSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  nome_negocio: z.string().min(2, 'Nome do negócio muito curto').optional(),
});

// Schema para upgrade de plano
export const soloUpgradeSchema = z.object({
  plano: z.enum(['solo_pro'], {
    required_error: 'Plano inválido',
  }),
});

// Schema para movimentação de estoque Solo
export const soloEstoqueMovimentoSchema = z.object({
  produto_id: z.string().uuid('ID do produto inválido'),
  tipo: z.enum(['entrada', 'saida'], {
    required_error: 'Tipo de movimentação inválido',
  }),
  qtd: z.number().int().positive('Quantidade deve ser positiva'),
  motivo: z.string().min(3, 'Motivo muito curto').optional(),
});

// Schema para criar produto Solo
export const soloProdutoSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto'),
  marca: z.string().optional(),
  preco: z.number().positive('Preço deve ser positivo'),
  unidade: z.string().default('UN'),
  estoque_inicial: z.number().int().nonnegative('Estoque deve ser positivo').default(0),
  ativo: z.boolean().default(true),
});

// Type inference
export type SoloVendaInput = z.infer<typeof soloVendaSchema>;
export type SoloOnboardingInput = z.infer<typeof soloOnboardingSchema>;
export type SoloUpgradeInput = z.infer<typeof soloUpgradeSchema>;
export type SoloEstoqueMovimentoInput = z.infer<typeof soloEstoqueMovimentoSchema>;
export type SoloProdutoInput = z.infer<typeof soloProdutoSchema>;

/**
 * Schemas Zod para validação de dados
 */
import { z } from "zod";

// ============================================
// EMPRESA
// ============================================
export const empresaSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cnpj_cpf: z.string().optional(),
  chave_pix: z.string().optional(),
});

export type EmpresaInput = z.infer<typeof empresaSchema>;

// ============================================
// PRODUTO
// ============================================
export const produtoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  preco: z.number().positive("Preço deve ser maior que zero"),
  unidade: z.string().default("un"),
  ativo: z.boolean().default(true),
});

export type ProdutoInput = z.infer<typeof produtoSchema>;

// ============================================
// VENDEDOR
// ============================================
export const vendedorSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  telefone: z.string().optional(),
  doc: z.string().optional(),
  comissao_padrao: z.number().min(0).max(1, "Comissão deve estar entre 0 e 1"),
  ativo: z.boolean().default(true),
});

export type VendedorInput = z.infer<typeof vendedorSchema>;

// ============================================
// KIT
// ============================================
export const kitItemSchema = z.object({
  produto_id: z.string().uuid("ID de produto inválido"),
  qtd_atribuida: z.number().int().positive("Quantidade deve ser maior que zero"),
});

export const kitSchema = z.object({
  vendedor_id: z.string().uuid("ID de vendedor inválido"),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (formato YYYY-MM-DD)"),
  comissao_percent: z.number().min(0).max(1, "Comissão deve estar entre 0 e 1"),
  itens: z.array(kitItemSchema).min(1, "Kit deve ter pelo menos 1 item"),
});

export type KitInput = z.infer<typeof kitSchema>;

// ============================================
// VENDA
// ============================================
export const vendaSchema = z.object({
  vendedor_id: z.string().uuid("ID de vendedor inválido"),
  produto_id: z.string().uuid("ID de produto inválido"),
  qtd: z.number().int().positive("Quantidade deve ser maior que zero"),
  valor_unit: z.number().nonnegative("Valor unitário não pode ser negativo"),
  meio_pagamento: z.enum(["pix", "cartao", "dinheiro"], {
    errorMap: () => ({ message: "Meio de pagamento inválido" }),
  }),
  status: z.enum(["pendente", "confirmado", "cancelado"]).default("confirmado"),
});

export type VendaInput = z.infer<typeof vendaSchema>;

// ============================================
// FECHAMENTO
// ============================================
export const fechamentoSchema = z.object({
  vendedor_id: z.string().uuid("ID de vendedor inválido"),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (formato YYYY-MM-DD)"),
});

export type FechamentoInput = z.infer<typeof fechamentoSchema>;

// ============================================
// FILTROS DE RELATÓRIO
// ============================================
export const relatorioFilterSchema = z.object({
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  vendedor_id: z.string().uuid().optional(),
  produto_id: z.string().uuid().optional(),
  meio_pagamento: z.enum(["pix", "cartao", "dinheiro"]).optional(),
});

export type RelatorioFilter = z.infer<typeof relatorioFilterSchema>;

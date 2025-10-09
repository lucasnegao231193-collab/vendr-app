/**
 * Tipos TypeScript para Vendr Solo
 * Modo Autônomo
 */

export type PlanoType = 'solo_free' | 'solo_pro' | 'plano1' | 'plano2' | 'plano3';

export interface SoloCota {
  id: string;
  empresa_id: string;
  ano_mes: string; // 'YYYY-MM'
  vendas_mes: number;
  created_at: string;
  updated_at: string;
}

export interface SoloLimite {
  empresa_id: string;
  empresa_nome: string;
  is_solo: boolean;
  plano: PlanoType;
  ano_mes_atual: string;
  vendas_mes: number;
  limite_vendas: number;
  limite_atingido: boolean;
}

export interface SoloVenda {
  itens: Array<{
    produto_id: string;
    qtd: number;
  }>;
  metodo_pagamento: 'pix' | 'cartao' | 'dinheiro';
  valor_total: number;
}

export interface SoloStats {
  vendas_hoje: number;
  lucro_estimado: number;
  produtos_ativos: number;
  estoque_total: number;
  vendas_mes: number;
  limite_vendas: number;
  plano: PlanoType;
}

export interface SoloPlanoInfo {
  nome: string;
  preco: number;
  limite_vendas: number | 'ilimitado';
  features: string[];
  recomendado?: boolean;
}

export const PLANOS_SOLO: Record<'solo_free' | 'solo_pro', SoloPlanoInfo> = {
  solo_free: {
    nome: 'Solo Free',
    preco: 0,
    limite_vendas: 30,
    features: [
      'Até 30 vendas por mês',
      'Gestão básica de estoque',
      'Relatório simples',
      'Suporte por email',
    ],
  },
  solo_pro: {
    nome: 'Solo Pro',
    preco: 29.90,
    limite_vendas: 'ilimitado',
    features: [
      'Vendas ilimitadas',
      'Exportação PDF/CSV',
      'Relatórios avançados',
      'Gráficos e insights',
      'Suporte prioritário',
      'Backup automático',
    ],
    recomendado: true,
  },
};

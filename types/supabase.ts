/**
 * Tipos TypeScript gerados do schema do Supabase
 * Em produção, gere com: npx supabase gen types typescript --local > types/supabase.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string;
          owner_id: string;
          nome: string;
          cnpj_cpf: string | null;
          chave_pix: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          nome: string;
          cnpj_cpf?: string | null;
          chave_pix?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          nome?: string;
          cnpj_cpf?: string | null;
          chave_pix?: string | null;
          created_at?: string;
        };
      };
      perfis: {
        Row: {
          user_id: string;
          empresa_id: string;
          role: "owner" | "seller";
          created_at: string;
        };
        Insert: {
          user_id: string;
          empresa_id: string;
          role?: "owner" | "seller";
          created_at?: string;
        };
        Update: {
          user_id?: string;
          empresa_id?: string;
          role?: "owner" | "seller";
          created_at?: string;
        };
      };
      vendedores: {
        Row: {
          id: string;
          empresa_id: string;
          nome: string;
          telefone: string | null;
          doc: string | null;
          comissao_padrao: number;
          ativo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          nome: string;
          telefone?: string | null;
          doc?: string | null;
          comissao_padrao?: number;
          ativo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          empresa_id?: string;
          nome?: string;
          telefone?: string | null;
          doc?: string | null;
          comissao_padrao?: number;
          ativo?: boolean;
          created_at?: string;
        };
      };
      produtos: {
        Row: {
          id: string;
          empresa_id: string;
          nome: string;
          preco: number;
          unidade: string;
          ativo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          nome: string;
          preco: number;
          unidade?: string;
          ativo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          empresa_id?: string;
          nome?: string;
          preco?: number;
          unidade?: string;
          ativo?: boolean;
          created_at?: string;
        };
      };
      kits: {
        Row: {
          id: string;
          vendedor_id: string;
          data: string;
          comissao_percent: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          vendedor_id: string;
          data: string;
          comissao_percent?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          vendedor_id?: string;
          data?: string;
          comissao_percent?: number;
          created_at?: string;
        };
      };
      kit_itens: {
        Row: {
          id: string;
          kit_id: string;
          produto_id: string;
          qtd_atribuida: number;
        };
        Insert: {
          id?: string;
          kit_id: string;
          produto_id: string;
          qtd_atribuida: number;
        };
        Update: {
          id?: string;
          kit_id?: string;
          produto_id?: string;
          qtd_atribuida?: number;
        };
      };
      vendas: {
        Row: {
          id: string;
          vendedor_id: string;
          produto_id: string;
          qtd: number;
          valor_unit: number;
          meio_pagamento: "pix" | "cartao" | "dinheiro";
          data_hora: string;
          status: "pendente" | "confirmado" | "cancelado";
          empresa_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          vendedor_id: string;
          produto_id: string;
          qtd: number;
          valor_unit: number;
          meio_pagamento: "pix" | "cartao" | "dinheiro";
          data_hora?: string;
          status?: "pendente" | "confirmado" | "cancelado";
          empresa_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          vendedor_id?: string;
          produto_id?: string;
          qtd?: number;
          valor_unit?: number;
          meio_pagamento?: "pix" | "cartao" | "dinheiro";
          data_hora?: string;
          status?: "pendente" | "confirmado" | "cancelado";
          empresa_id?: string;
          created_at?: string;
        };
      };
      fechamentos: {
        Row: {
          id: string;
          vendedor_id: string;
          data: string;
          total: number;
          total_pix: number;
          total_cartao: number;
          total_dinheiro: number;
          comissao_calculada: number;
          conferido: boolean;
          empresa_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          vendedor_id: string;
          data: string;
          total?: number;
          total_pix?: number;
          total_cartao?: number;
          total_dinheiro?: number;
          comissao_calculada?: number;
          conferido?: boolean;
          empresa_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          vendedor_id?: string;
          data?: string;
          total?: number;
          total_pix?: number;
          total_cartao?: number;
          total_dinheiro?: number;
          comissao_calculada?: number;
          conferido?: boolean;
          empresa_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      vw_vendas_dia_produto: {
        Row: {
          dia: string;
          produto_id: string;
          empresa_id: string;
          qtd_total: number;
          valor_total: number;
        };
      };
    };
    Functions: {
      empresa_id_for_user: {
        Args: { u: string };
        Returns: string;
      };
      role_for_user: {
        Args: { u: string };
        Returns: string;
      };
    };
  };
}

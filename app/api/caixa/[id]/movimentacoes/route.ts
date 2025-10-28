/**
 * API: Movimentações do caixa
 * GET: Listar movimentações
 * POST: Adicionar movimentação
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('caixa_movimentacoes')
      .select('*')
      .eq('caixa_id', id)
      .order('data_hora', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ movimentacoes: data || [] });
  } catch (error: any) {
    console.error('Erro ao buscar movimentações:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: caixa_id } = params;
    const body = await request.json();
    const {
      user_id,
      tipo,
      metodo_pagamento,
      valor,
      descricao,
      venda_id,
      venda_servico_id,
    } = body;

    // Validações
    if (!tipo || !metodo_pagamento || !valor || !descricao) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    if (valor <= 0) {
      return NextResponse.json(
        { error: 'Valor deve ser maior que zero' },
        { status: 400 }
      );
    }

    // Verificar se caixa está aberto
    const { data: caixa } = await supabase
      .from('caixas')
      .select('status')
      .eq('id', caixa_id)
      .single();

    if (caixa?.status !== 'Aberto') {
      return NextResponse.json(
        { error: 'Caixa não está aberto' },
        { status: 400 }
      );
    }

    // Criar movimentação
    const { data: movimentacao, error } = await supabase
      .from('caixa_movimentacoes')
      .insert({
        caixa_id,
        tipo,
        metodo_pagamento,
        valor,
        descricao,
        venda_id,
        venda_servico_id,
        criado_por: user_id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(movimentacao, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar movimentação:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

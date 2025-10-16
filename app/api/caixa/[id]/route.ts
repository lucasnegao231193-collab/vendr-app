/**
 * API: Operações em caixa específico
 * GET: Buscar caixa por ID com movimentações
 * PUT: Atualizar caixa
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

    // Buscar caixa
    const { data: caixa, error: caixaError } = await supabase
      .from('caixas')
      .select('*')
      .eq('id', id)
      .single();

    if (caixaError) throw caixaError;

    if (!caixa) {
      return NextResponse.json(
        { error: 'Caixa não encontrado' },
        { status: 404 }
      );
    }

    // Buscar movimentações
    const { data: movimentacoes, error: movError } = await supabase
      .from('caixa_movimentacoes')
      .select('*')
      .eq('caixa_id', id)
      .order('data_hora', { ascending: false });

    if (movError) throw movError;

    // Calcular totais
    const entradas = (movimentacoes || [])
      .filter(m => m.tipo === 'Entrada')
      .reduce((sum, m) => sum + m.valor, 0);

    const saidas = (movimentacoes || [])
      .filter(m => m.tipo === 'Saida')
      .reduce((sum, m) => sum + m.valor, 0);

    const saldo_teorico = caixa.saldo_inicial + entradas - saidas;

    // Agrupar por método de pagamento
    const porMetodo = (movimentacoes || []).reduce((acc: any, m) => {
      if (!acc[m.metodo_pagamento]) {
        acc[m.metodo_pagamento] = { entradas: 0, saidas: 0 };
      }
      if (m.tipo === 'Entrada') {
        acc[m.metodo_pagamento].entradas += m.valor;
      } else {
        acc[m.metodo_pagamento].saidas += m.valor;
      }
      return acc;
    }, {});

    return NextResponse.json({
      caixa,
      movimentacoes: movimentacoes || [],
      resumo: {
        saldo_inicial: caixa.saldo_inicial,
        total_entradas: entradas,
        total_saidas: saidas,
        saldo_teorico,
        saldo_fechamento: caixa.saldo_fechamento,
        diferenca: caixa.saldo_fechamento ? caixa.saldo_fechamento - saldo_teorico : null,
        por_metodo: porMetodo,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar caixa:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { observacao } = body;

    const updateData: any = {};
    if (observacao !== undefined) updateData.observacao = observacao;

    const { data: caixa, error } = await supabase
      .from('caixas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(caixa);
  } catch (error: any) {
    console.error('Erro ao atualizar caixa:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

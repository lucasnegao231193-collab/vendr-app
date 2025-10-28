/**
 * API: Fechar caixa
 * POST: Fechar caixa com saldo de fechamento
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { saldo_fechamento } = body;

    // Validações
    if (saldo_fechamento === undefined || saldo_fechamento < 0) {
      return NextResponse.json(
        { error: 'Saldo de fechamento inválido' },
        { status: 400 }
      );
    }

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

    if (caixa.status === 'Fechado') {
      return NextResponse.json(
        { error: 'Caixa já está fechado' },
        { status: 400 }
      );
    }

    // Fechar caixa
    const { data: caixaFechado, error: updateError } = await supabase
      .from('caixas')
      .update({
        status: 'Fechado',
        saldo_fechamento,
        data_fechamento: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(caixaFechado);
  } catch (error: any) {
    console.error('Erro ao fechar caixa:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * API: Operações em venda de serviço específica
 * GET: Buscar venda por ID
 * PUT: Atualizar venda
 * DELETE: Deletar venda
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
      .from('vendas_servicos')
      .select(`
        *,
        servico:solo_servicos_catalogo(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Venda não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro ao buscar venda:', error);
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
    const {
      status,
      observacoes,
    } = body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (observacoes !== undefined) updateData.observacoes = observacoes;

    const { data: venda, error } = await supabase
      .from('vendas_servicos')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        servico:solo_servicos_catalogo(*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(venda);
  } catch (error: any) {
    console.error('Erro ao atualizar venda:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from('vendas_servicos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao deletar venda:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

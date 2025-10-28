/**
 * API: Operações em serviço específico
 * GET: Buscar serviço por ID
 * PUT: Atualizar serviço
 * DELETE: Deletar serviço
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
      .from('solo_servicos_catalogo')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro ao buscar serviço:', error);
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
      nome,
      categoria,
      descricao,
      valor_unitario,
      ativo,
    } = body;

    // Validações
    if (valor_unitario !== undefined && valor_unitario < 0) {
      return NextResponse.json(
        { error: 'Valor unitário deve ser positivo' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (nome !== undefined) updateData.nome = nome;
    if (categoria !== undefined) updateData.categoria = categoria;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (valor_unitario !== undefined) updateData.valor_unitario = valor_unitario;
    if (ativo !== undefined) updateData.ativo = ativo;

    const { data: servico, error } = await supabase
      .from('solo_servicos_catalogo')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(servico);
  } catch (error: any) {
    console.error('Erro ao atualizar serviço:', error);
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
      .from('solo_servicos_catalogo')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao deletar serviço:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

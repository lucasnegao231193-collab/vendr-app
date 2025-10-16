/**
 * API: CRUD de Catálogo de Serviços (Modo Solo)
 * GET: Listar serviços do catálogo
 * POST: Criar novo serviço no catálogo
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const categoria = searchParams.get('categoria');
    const ativo = searchParams.get('ativo');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('solo_servicos_catalogo')
      .select('*')
      .eq('user_id', user_id)
      .order('nome', { ascending: true });

    // Aplicar filtros
    if (categoria) {
      query = query.eq('categoria', categoria);
    }
    if (ativo !== null && ativo !== undefined) {
      query = query.eq('ativo', ativo === 'true');
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ servicos: data || [] });
  } catch (error: any) {
    console.error('Erro ao buscar serviços:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      nome,
      categoria,
      descricao,
      valor_unitario,
      ativo = true,
    } = body;

    // Validações
    if (!user_id || !nome || !categoria || valor_unitario === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    if (valor_unitario < 0) {
      return NextResponse.json(
        { error: 'Valor unitário deve ser positivo' },
        { status: 400 }
      );
    }

    const { data: servico, error } = await supabase
      .from('solo_servicos_catalogo')
      .insert({
        user_id,
        nome,
        categoria,
        descricao,
        valor_unitario,
        ativo,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(servico, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar serviço:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

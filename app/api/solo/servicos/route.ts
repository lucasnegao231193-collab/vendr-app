/**
 * API: CRUD de Serviços (Modo Solo)
 * GET: Listar serviços do usuário
 * POST: Criar novo serviço
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
    const status = searchParams.get('status');
    const categoria = searchParams.get('categoria');
    const data_inicio = searchParams.get('data_inicio');
    const data_fim = searchParams.get('data_fim');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('solo_servicos')
      .select('*')
      .eq('user_id', user_id)
      .order('data', { ascending: false });

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status);
    }
    if (categoria) {
      query = query.eq('categoria', categoria);
    }
    if (data_inicio) {
      query = query.gte('data', data_inicio);
    }
    if (data_fim) {
      query = query.lte('data', data_fim);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calcular estatísticas
    const stats = {
      total_servicos: data?.length || 0,
      total_recebido: data
        ?.filter(s => s.status === 'Pago')
        .reduce((sum, s) => sum + (s.valor_unitario * s.quantidade), 0) || 0,
      total_pendente: data
        ?.filter(s => s.status === 'Pendente')
        .reduce((sum, s) => sum + (s.valor_unitario * s.quantidade), 0) || 0,
      total_concluido: data
        ?.filter(s => s.status === 'Concluído')
        .reduce((sum, s) => sum + (s.valor_unitario * s.quantidade), 0) || 0,
    };

    return NextResponse.json({ servicos: data, stats });
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
      quantidade,
      status,
      data,
      observacoes,
    } = body;

    // Validações
    if (!user_id || !nome || !categoria || !valor_unitario || !quantidade || !status || !data) {
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

    if (quantidade <= 0) {
      return NextResponse.json(
        { error: 'Quantidade deve ser maior que zero' },
        { status: 400 }
      );
    }

    const { data: servico, error } = await supabase
      .from('solo_servicos')
      .insert({
        user_id,
        nome,
        categoria,
        descricao,
        valor_unitario,
        quantidade,
        status,
        data,
        observacoes,
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

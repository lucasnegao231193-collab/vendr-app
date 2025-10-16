/**
 * API: Vendas de Serviços (Modo Solo)
 * GET: Listar vendas de serviços
 * POST: Registrar nova venda de serviço
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
    const data_inicio = searchParams.get('data_inicio');
    const data_fim = searchParams.get('data_fim');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('vendas_servicos')
      .select(`
        *,
        servico:solo_servicos_catalogo(*)
      `)
      .eq('user_id', user_id)
      .order('data_venda', { ascending: false });

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status);
    }
    if (data_inicio) {
      query = query.gte('data_venda', data_inicio);
    }
    if (data_fim) {
      query = query.lte('data_venda', data_fim);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Buscar estatísticas
    const { data: stats } = await supabase
      .rpc('get_servicos_stats', { p_user_id: user_id });

    return NextResponse.json({ 
      vendas: data || [],
      stats: stats?.[0] || {
        total_vendas: 0,
        faturamento_total: 0,
        servico_mais_vendido: null,
        total_mes_atual: 0,
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar vendas de serviços:', error);
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
      servico_id,
      cliente_nome,
      cliente_telefone,
      quantidade,
      valor_unitario,
      metodo_pagamento,
      status = 'Concluído',
      observacoes,
    } = body;

    // Validações
    if (!user_id || !servico_id || !quantidade || !valor_unitario || !metodo_pagamento) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    if (quantidade <= 0) {
      return NextResponse.json(
        { error: 'Quantidade deve ser maior que zero' },
        { status: 400 }
      );
    }

    if (valor_unitario < 0) {
      return NextResponse.json(
        { error: 'Valor unitário deve ser positivo' },
        { status: 400 }
      );
    }

    const valor_total = quantidade * valor_unitario;

    const { data: venda, error } = await supabase
      .from('vendas_servicos')
      .insert({
        user_id,
        servico_id,
        cliente_nome,
        cliente_telefone,
        quantidade,
        valor_unitario,
        valor_total,
        metodo_pagamento,
        status,
        observacoes,
      })
      .select(`
        *,
        servico:solo_servicos_catalogo(*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(venda, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar venda de serviço:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

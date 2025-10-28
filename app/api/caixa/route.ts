/**
 * API: Caixa
 * GET: Listar caixas do usuário
 * POST: Abrir novo caixa
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
    const escopo = searchParams.get('escopo') || 'solo';
    const status = searchParams.get('status');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('caixas')
      .select('*')
      .eq('escopo', escopo)
      .order('data_abertura', { ascending: false });

    if (escopo === 'solo') {
      query = query.eq('user_id', user_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ caixas: data || [] });
  } catch (error: any) {
    console.error('Erro ao buscar caixas:', error);
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
      escopo = 'solo',
      saldo_inicial,
      observacao,
    } = body;

    // Validações
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      );
    }

    if (saldo_inicial === undefined || saldo_inicial < 0) {
      return NextResponse.json(
        { error: 'Saldo inicial deve ser maior ou igual a zero' },
        { status: 400 }
      );
    }

    // Verificar se já existe caixa aberto hoje
    const hoje = new Date().toISOString().split('T')[0];
    const { data: caixaAberto } = await supabase
      .from('caixas')
      .select('id')
      .eq('user_id', user_id)
      .eq('escopo', escopo)
      .eq('status', 'Aberto')
      .gte('data_abertura', `${hoje}T00:00:00`)
      .lte('data_abertura', `${hoje}T23:59:59`)
      .single();

    if (caixaAberto) {
      return NextResponse.json(
        { error: 'Já existe um caixa aberto hoje' },
        { status: 400 }
      );
    }

    // Criar novo caixa
    const { data: caixa, error } = await supabase
      .from('caixas')
      .insert({
        escopo,
        user_id,
        responsavel_id: user_id,
        saldo_inicial,
        status: 'Aberto',
        observacao,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(caixa, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao abrir caixa:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

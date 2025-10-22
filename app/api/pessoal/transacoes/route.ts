import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { transacaoPessoalSchema } from '@/types/venlo-mode';

// GET - Listar transações
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Parâmetros de filtro
    const searchParams = request.nextUrl.searchParams;
    const tipo = searchParams.get('tipo');
    const categoria = searchParams.get('categoria');
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query base
    let query = supabase
      .from('financas_pessoais')
      .select('*')
      .eq('user_id', session.user.id)
      .order('data', { ascending: false })
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (tipo) query = query.eq('tipo', tipo);
    if (categoria) query = query.eq('categoria', categoria);
    if (dataInicio) query = query.gte('data', dataInicio);
    if (dataFim) query = query.lte('data', dataFim);

    // Paginação
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar transações:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar transações', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar transação
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Validar body
    const body = await request.json();
    const validation = transacaoPessoalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { tipo, categoria, descricao, valor, data } = validation.data;

    // Inserir no banco
    const { data: newTransacao, error } = await supabase
      .from('financas_pessoais')
      .insert({
        user_id: session.user.id,
        tipo,
        categoria,
        descricao,
        valor,
        data,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar transação:', error);
      return NextResponse.json(
        { error: 'Erro ao criar transação', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(newTransacao, { status: 201 });
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

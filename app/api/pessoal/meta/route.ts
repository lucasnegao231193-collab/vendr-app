import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { metaPessoalSchema } from '@/types/venlo-mode';

// GET - Buscar meta do mês
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

    // Parâmetros
    const searchParams = request.nextUrl.searchParams;
    const ano = parseInt(searchParams.get('ano') || new Date().getFullYear().toString());
    const mes = parseInt(searchParams.get('mes') || (new Date().getMonth() + 1).toString());

    // Buscar meta
    const { data, error } = await supabase
      .from('metas_pessoais')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('ano', ano)
      .eq('mes', mes)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Não encontrado
        return NextResponse.json(
          { error: 'Meta não encontrada' },
          { status: 404 }
        );
      }
      console.error('Erro ao buscar meta:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar meta', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Criar ou atualizar meta
export async function PUT(request: NextRequest) {
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
    const validation = metaPessoalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { ano, mes, meta_economia } = validation.data;

    // Upsert (insert ou update)
    const { data: meta, error } = await supabase
      .from('metas_pessoais')
      .upsert(
        {
          user_id: session.user.id,
          ano,
          mes,
          meta_economia,
        },
        {
          onConflict: 'user_id,ano,mes',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar meta:', error);
      return NextResponse.json(
        { error: 'Erro ao salvar meta', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(meta);
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

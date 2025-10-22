import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { avaliacaoSchema } from '@/types/catalogo';

// POST - Criar avaliação
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validar dados
    const validatedData = avaliacaoSchema.parse(body);

    // Verificar se o estabelecimento existe
    const { data: estabelecimento, error: estError } = await supabase
      .from('catalogo_estabelecimentos')
      .select('id')
      .eq('id', validatedData.estabelecimento_id)
      .single();

    if (estError || !estabelecimento) {
      return NextResponse.json(
        { error: 'Estabelecimento não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário já avaliou este estabelecimento
    const { data: avaliacaoExistente } = await supabase
      .from('catalogo_avaliacoes')
      .select('id')
      .eq('estabelecimento_id', validatedData.estabelecimento_id)
      .eq('user_id', user.id)
      .single();

    if (avaliacaoExistente) {
      return NextResponse.json(
        { error: 'Você já avaliou este estabelecimento' },
        { status: 400 }
      );
    }

    // Criar avaliação
    const { data, error } = await supabase
      .from('catalogo_avaliacoes')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar avaliação:', error);
      return NextResponse.json(
        { error: 'Erro ao criar avaliação' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Erro na API de avaliação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

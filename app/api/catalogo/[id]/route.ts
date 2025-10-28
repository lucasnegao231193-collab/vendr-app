import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { estabelecimentoSchema } from '@/types/catalogo';

// GET - Buscar estabelecimento por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    const { data, error } = await supabase
      .from('catalogo_estabelecimentos')
      .select(`
        *,
        avaliacoes:catalogo_avaliacoes(
          id,
          nota,
          comentario,
          criado_em,
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar estabelecimento:', error);
      return NextResponse.json(
        { error: 'Estabelecimento não encontrado' },
        { status: 404 }
      );
    }

    // Calcular estatísticas
    const avaliacoes = data.avaliacoes || [];
    const total_avaliacoes = avaliacoes.length;
    const nota_media = total_avaliacoes > 0
      ? avaliacoes.reduce((sum: number, av: any) => sum + av.nota, 0) / total_avaliacoes
      : 0;

    return NextResponse.json({
      ...data,
      total_avaliacoes,
      nota_media: Math.round(nota_media * 10) / 10,
    });
  } catch (error) {
    console.error('Erro na API de catálogo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar estabelecimento
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é o dono
    const { data: estabelecimento, error: fetchError } = await supabase
      .from('catalogo_estabelecimentos')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !estabelecimento) {
      return NextResponse.json(
        { error: 'Estabelecimento não encontrado' },
        { status: 404 }
      );
    }

    if (estabelecimento.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Sem permissão para editar este estabelecimento' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validar dados
    const validatedData = estabelecimentoSchema.parse(body);

    // Atualizar estabelecimento
    const { data, error } = await supabase
      .from('catalogo_estabelecimentos')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar estabelecimento:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar estabelecimento' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Erro na API de catálogo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar estabelecimento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é o dono
    const { data: estabelecimento, error: fetchError } = await supabase
      .from('catalogo_estabelecimentos')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !estabelecimento) {
      return NextResponse.json(
        { error: 'Estabelecimento não encontrado' },
        { status: 404 }
      );
    }

    if (estabelecimento.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar este estabelecimento' },
        { status: 403 }
      );
    }

    // Deletar estabelecimento
    const { error } = await supabase
      .from('catalogo_estabelecimentos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar estabelecimento:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar estabelecimento' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Estabelecimento deletado com sucesso' });
  } catch (error) {
    console.error('Erro na API de catálogo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

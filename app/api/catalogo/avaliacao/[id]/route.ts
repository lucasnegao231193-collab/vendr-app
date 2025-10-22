import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET - Listar avaliações de um estabelecimento
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    const { data, error } = await supabase
      .from('catalogo_avaliacoes')
      .select('*')
      .eq('estabelecimento_id', id)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar avaliações:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar avaliações' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na API de avaliação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

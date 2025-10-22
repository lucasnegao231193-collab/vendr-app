import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { estabelecimentoSchema } from '@/types/catalogo';

// GET - Listar estabelecimentos com filtros
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const busca = searchParams.get('busca') || '';
    const categoria = searchParams.get('categoria') || '';
    const cidade = searchParams.get('cidade') || '';
    const estado = searchParams.get('estado') || '';
    const destaque = searchParams.get('destaque') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('catalogo_estabelecimentos')
      .select(`
        *,
        avaliacoes:catalogo_avaliacoes(nota)
      `, { count: 'exact' })
      .eq('aprovado', true);

    // Aplicar filtros
    if (busca) {
      query = query.or(`nome.ilike.%${busca}%,descricao.ilike.%${busca}%`);
    }
    
    if (categoria) {
      query = query.eq('categoria', categoria);
    }
    
    if (cidade) {
      query = query.ilike('cidade', `%${cidade}%`);
    }
    
    if (estado) {
      query = query.eq('estado', estado);
    }
    
    if (destaque) {
      query = query.eq('destaque', true);
    }

    // Ordenação: destaques primeiro, depois por data
    query = query
      .order('destaque', { ascending: false })
      .order('criado_em', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar estabelecimentos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar estabelecimentos' },
        { status: 500 }
      );
    }

    // Calcular média de avaliações para cada estabelecimento
    const estabelecimentosComStats = data?.map(est => {
      const avaliacoes = est.avaliacoes || [];
      const total_avaliacoes = avaliacoes.length;
      const nota_media = total_avaliacoes > 0
        ? avaliacoes.reduce((sum: number, av: any) => sum + av.nota, 0) / total_avaliacoes
        : 0;
      
      const { avaliacoes: _, ...estabelecimento } = est;
      
      return {
        ...estabelecimento,
        total_avaliacoes,
        nota_media: Math.round(nota_media * 10) / 10,
      };
    });

    return NextResponse.json({
      estabelecimentos: estabelecimentosComStats,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Erro na API de catálogo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar estabelecimento
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
    const validatedData = estabelecimentoSchema.parse(body);

    // Criar estabelecimento
    const { data, error } = await supabase
      .from('catalogo_estabelecimentos')
      .insert({
        ...validatedData,
        user_id: user.id,
        aprovado: false, // Requer aprovação
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar estabelecimento:', error);
      return NextResponse.json(
        { error: 'Erro ao criar estabelecimento' },
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
    
    console.error('Erro na API de catálogo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

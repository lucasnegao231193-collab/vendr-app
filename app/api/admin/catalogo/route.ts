import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET - Listar estabelecimentos para admin
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    console.log('🏪 API /admin/catalogo - Iniciando...');
    
    // Verificar se é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Não autenticado');
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    console.log('✅ Usuário autenticado:', user.id);

    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!adminData) {
      console.log('❌ Não é admin');
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    console.log('✅ Admin verificado');

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'pendentes';
    
    console.log('🔍 Filtro aplicado:', filter);

    let query = supabase
      .from('catalogo_estabelecimentos')
      .select(`
        *,
        avaliacoes:catalogo_avaliacoes(nota)
      `)
      .order('criado_em', { ascending: false });

    // Aplicar filtro
    if (filter === 'pendentes') {
      query = query.eq('aprovado', false);
      console.log('📋 Buscando estabelecimentos PENDENTES (aprovado = false)');
    } else if (filter === 'aprovados') {
      query = query.eq('aprovado', true);
      console.log('📋 Buscando estabelecimentos APROVADOS (aprovado = true)');
    } else {
      console.log('📋 Buscando TODOS os estabelecimentos');
    }

    const { data, error } = await query;
    
    console.log('📊 Resultado da query:', {
      total: data?.length || 0,
      erro: error,
      dados: data
    });

    if (error) {
      console.error('Erro ao buscar estabelecimentos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar estabelecimentos' },
        { status: 500 }
      );
    }

    // Calcular estatísticas
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

    return NextResponse.json(estabelecimentosComStats);
  } catch (error) {
    console.error('Erro na API de admin/catalogo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Verificar se é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se é admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!adminData) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Buscar perfis com empresas
    const { data: perfis } = await supabase
      .from('perfis')
      .select(`
        user_id,
        role,
        empresas(is_solo)
      `);

    // Buscar empresas
    const { data: empresas } = await supabase
      .from('empresas')
      .select('is_solo');

    // Buscar estabelecimentos
    const { data: estabelecimentos } = await supabase
      .from('catalogo_estabelecimentos')
      .select('aprovado');

    // Buscar avaliações
    const { data: avaliacoes } = await supabase
      .from('catalogo_avaliacoes')
      .select('id');

    // Calcular estatísticas
    const total_usuarios = perfis?.length || 0;
    const total_empresas = empresas?.length || 0;
    const total_solos = empresas?.filter(e => e.is_solo).length || 0;
    const total_empresas_normais = empresas?.filter(e => !e.is_solo).length || 0;
    const total_vendedores = perfis?.filter(p => p.role === 'seller').length || 0;
    const total_estabelecimentos = estabelecimentos?.length || 0;
    const estabelecimentos_aprovados = estabelecimentos?.filter(e => e.aprovado).length || 0;
    const estabelecimentos_pendentes = estabelecimentos?.filter(e => !e.aprovado).length || 0;
    const total_avaliacoes = avaliacoes?.length || 0;

    const stats = {
      total_usuarios,
      total_empresas,
      total_solos,
      total_empresas_normais,
      total_vendedores,
      total_estabelecimentos,
      estabelecimentos_aprovados,
      estabelecimentos_pendentes,
      total_avaliacoes
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro na API de stats:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

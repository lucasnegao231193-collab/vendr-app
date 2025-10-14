/**
 * GET /api/transferencias/vendedor
 * Lista transferências recebidas pelo vendedor (status aguardando_aceite)
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar vendedor_id
    const { data: vendedor } = await supabase
      .from('vendedores')
      .select('id, empresa_id')
      .eq('user_id', user.id)
      .single();

    if (!vendedor) {
      return NextResponse.json(
        { error: 'Vendedor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se deve buscar todas ou só pendentes
    const searchParams = request.nextUrl.searchParams;
    const all = searchParams.get('all') === 'true';

    // Buscar transferências
    let query = supabase
      .from('transferencias')
      .select(`
        *,
        empresa:empresas!empresa_id(id, nome),
        itens:transferencia_itens(
          id,
          produto_id,
          quantidade,
          preco_unit,
          produto:produtos(id, nome, preco)
        )
      `)
      .eq('vendedor_id', vendedor.id)
      .order('created_at', { ascending: false });

    // Se não for 'all', filtrar apenas pendentes
    if (!all) {
      query = query.eq('status', 'aguardando_aceite');
    }

    const { data: transferencias, error } = await query;

    if (error) {
      console.error('Erro ao buscar transferências:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar transferências' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transferencias: transferencias || [],
      count: transferencias?.length || 0,
    });
  } catch (error) {
    console.error('Erro na API transferencias/vendedor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/transferencias/empresa?status=&limit=20&offset=0
 * Lista transferências da empresa com filtros
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

    const { data: perfil } = await supabase
      .from('perfis')
      .select('empresa_id')
      .eq('user_id', user.id)
      .single();

    if (!perfil) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    // Params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query
    let query = supabase
      .from('transferencias')
      .select(`
        *,
        vendedor:vendedores!vendedor_id(id, nome, email),
        itens:transferencia_itens(
          id,
          produto_id,
          quantidade,
          preco_unit,
          produto:produtos(id, nome, sku)
        )
      `)
      .eq('empresa_id', perfil.empresa_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: transferencias, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar transferências:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar transferências' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transferencias: transferencias || [],
      pagination: {
        limit,
        offset,
        total: count || transferencias?.length || 0,
      },
    });
  } catch (error) {
    console.error('Erro na API transferencias/empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

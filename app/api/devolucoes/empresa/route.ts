/**
 * GET /api/devolucoes/empresa?status=
 * Lista solicitações de devolução recebidas pela empresa
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
      .select('empresa_id, role')
      .eq('user_id', user.id)
      .single();

    if (!perfil || !['owner', 'admin'].includes(perfil.role)) {
      return NextResponse.json(
        { error: 'Sem permissão' },
        { status: 403 }
      );
    }

    // Params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'aguardando_confirmacao';

    // Query
    const { data: devolucoes, error } = await supabase
      .from('devolucoes')
      .select(`
        *,
        vendedor:vendedores!vendedor_id(id, nome, email),
        itens:devolucao_itens(
          id,
          produto_id,
          quantidade,
          produto:produtos(id, nome, sku, preco)
        )
      `)
      .eq('empresa_id', perfil.empresa_id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar devoluções:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar devoluções' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      devolucoes: devolucoes || [],
      count: devolucoes?.length || 0,
    });
  } catch (error) {
    console.error('Erro na API devolucoes/empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

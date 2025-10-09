/**
 * POST /api/devolucoes/create
 * Vendedor solicita devolução de produtos à empresa
 * - Valida estoque do vendedor
 * - Cria devolução pendente
 * - Registra log
 * - Notifica empresa
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createDevolucaoSchema = z.object({
  itens: z.array(
    z.object({
      produtoId: z.string().uuid(),
      quantidade: z.number().int().positive(),
    })
  ).min(1, 'Deve haver pelo menos 1 item'),
  observacao: z.string().optional(),
});

export async function POST(request: NextRequest) {
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

    // Buscar vendedor
    const { data: vendedor } = await supabase
      .from('vendedores')
      .select('id, empresa_id, nome')
      .eq('user_id', user.id)
      .eq('ativo', true)
      .single();

    if (!vendedor) {
      return NextResponse.json(
        { error: 'Vendedor não encontrado' },
        { status: 404 }
      );
    }

    // Validar body
    const body = await request.json();
    const validated = createDevolucaoSchema.parse(body);

    // Verificar estoque do vendedor para cada produto
    const produtoIds = validated.itens.map((item) => item.produtoId);
    const { data: estoques, error: estoqueError } = await supabase
      .from('vendedor_estoque')
      .select('produto_id, quantidade')
      .eq('vendedor_id', vendedor.id)
      .in('produto_id', produtoIds);

    if (estoqueError) {
      return NextResponse.json(
        { error: 'Erro ao verificar estoque' },
        { status: 500 }
      );
    }

    // Mapear estoque disponível
    const estoqueMap = new Map(
      estoques?.map((e) => [e.produto_id, e.quantidade]) || []
    );

    // Validar disponibilidade
    const produtosInsuficientes = validated.itens.filter(
      (item) => (estoqueMap.get(item.produtoId) || 0) < item.quantidade
    );

    if (produtosInsuficientes.length > 0) {
      const { data: produtos } = await supabase
        .from('produtos')
        .select('id, nome')
        .in('id', produtosInsuficientes.map(p => p.produtoId));

      return NextResponse.json(
        {
          error: 'Estoque insuficiente para devolução',
          produtos: produtosInsuficientes.map((item) => ({
            produtoId: item.produtoId,
            nome: produtos?.find((p) => p.id === item.produtoId)?.nome,
            solicitado: item.quantidade,
            disponivel: estoqueMap.get(item.produtoId) || 0,
          })),
        },
        { status: 422 }
      );
    }

    // Criar devolução
    const { data: devolucao, error: devolucaoError } = await supabase
      .from('devolucoes')
      .insert({
        empresa_id: vendedor.empresa_id,
        vendedor_id: vendedor.id,
        criado_por: user.id,
        status: 'aguardando_confirmacao',
        total_itens: validated.itens.reduce((sum, item) => sum + item.quantidade, 0),
        observacao: validated.observacao || null,
      })
      .select()
      .single();

    if (devolucaoError || !devolucao) {
      console.error('Erro ao criar devolução:', devolucaoError);
      return NextResponse.json(
        { error: 'Erro ao criar devolução' },
        { status: 500 }
      );
    }

    // Criar itens da devolução
    const itensInsert = validated.itens.map((item) => ({
      devolucao_id: devolucao.id,
      produto_id: item.produtoId,
      quantidade: item.quantidade,
    }));

    const { error: itensError } = await supabase
      .from('devolucao_itens')
      .insert(itensInsert);

    if (itensError) {
      // Rollback
      await supabase.from('devolucoes').delete().eq('id', devolucao.id);
      return NextResponse.json(
        { error: 'Erro ao criar itens da devolução' },
        { status: 500 }
      );
    }

    // Registrar log
    await supabase.from('estoque_logs').insert({
      tipo: 'devolucao_solicitada',
      empresa_id: vendedor.empresa_id,
      vendedor_id: vendedor.id,
      devolucao_id: devolucao.id,
      quantidade: devolucao.total_itens,
      usuario_id: user.id,
      observacao: validated.observacao,
    });

    // Notificar empresa (via Realtime automático)

    return NextResponse.json(
      {
        success: true,
        devolucaoId: devolucao.id,
        status: devolucao.status,
        message: `Solicitação de devolução enviada! ${devolucao.total_itens} itens aguardando confirmação da empresa.`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro na API create devolucao:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

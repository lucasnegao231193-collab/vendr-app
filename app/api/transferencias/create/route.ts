/**
 * POST /api/transferencias/create
 * Empresa envia produtos para vendedor (cria transferência)
 * - Valida estoque disponível
 * - Debita estoque da empresa imediatamente
 * - Cria transferência + itens
 * - Registra log
 * - Notifica vendedor (Realtime)
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createTransferenciaSchema = z.object({
  vendedorId: z.string().uuid(),
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

    // 1. Autenticação e permissão
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: perfil } = await supabase
      .from('perfis')
      .select('role, empresa_id')
      .eq('user_id', user.id)
      .single();

    if (!perfil || !['owner', 'admin'].includes(perfil.role)) {
      return NextResponse.json(
        { error: 'Apenas owner/admin podem criar transferências' },
        { status: 403 }
      );
    }

    // 2. Validar body
    const body = await request.json();
    const validated = createTransferenciaSchema.parse(body);

    // 3. Verificar se vendedor pertence à empresa
    const { data: vendedor, error: vendedorError } = await supabase
      .from('vendedores')
      .select('id, empresa_id, nome')
      .eq('id', validated.vendedorId)
      .eq('empresa_id', perfil.empresa_id)
      .eq('ativo', true)
      .single();

    if (vendedorError || !vendedor) {
      return NextResponse.json(
        { error: 'Vendedor não encontrado ou inativo' },
        { status: 404 }
      );
    }

    // 4. Verificar estoque disponível para cada produto
    const produtoIds = validated.itens.map((item) => item.produtoId);
    const { data: produtosEstoque, error: estoqueError } = await supabase
      .from('produtos')
      .select('id, estoque_atual, preco, nome')
      .eq('empresa_id', perfil.empresa_id)
      .in('id', produtoIds);

    if (estoqueError) {
      return NextResponse.json(
        { error: 'Erro ao verificar estoque' },
        { status: 500 }
      );
    }

    // Mapear estoque disponível
    const estoqueMap = new Map(
      produtosEstoque?.map((p) => [p.id, p.estoque_atual]) || []
    );
    
    // Mapear preços
    const precoMap = new Map(produtosEstoque?.map((p) => [p.id, p.preco]) || []);

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
          error: 'Estoque insuficiente',
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

    // 6. TRANSAÇÃO: Criar transferência + debitar estoque
    // 6.1. Criar transferência
    const { data: transferencia, error: transferenciaError } = await supabase
      .from('transferencias')
      .insert({
        empresa_id: perfil.empresa_id,
        vendedor_id: validated.vendedorId,
        criado_por: user.id,
        status: 'aguardando_aceite',
        total_itens: validated.itens.reduce((sum, item) => sum + item.quantidade, 0),
        observacao: validated.observacao || null,
      })
      .select()
      .single();

    if (transferenciaError || !transferencia) {
      console.error('Erro ao criar transferência:', transferenciaError);
      return NextResponse.json(
        { error: 'Erro ao criar transferência' },
        { status: 500 }
      );
    }

    // 6.2. Criar itens da transferência
    const itensInsert = validated.itens.map((item) => ({
      transferencia_id: transferencia.id,
      produto_id: item.produtoId,
      quantidade: item.quantidade,
      preco_unit: precoMap.get(item.produtoId) || 0,
    }));

    const { error: itensError } = await supabase
      .from('transferencia_itens')
      .insert(itensInsert);

    if (itensError) {
      // Rollback: deletar transferência
      await supabase.from('transferencias').delete().eq('id', transferencia.id);
      return NextResponse.json(
        { error: 'Erro ao criar itens da transferência' },
        { status: 500 }
      );
    }

    // 6.3. Debitar estoque da empresa
    for (const item of validated.itens) {
      const estoqueAtual = estoqueMap.get(item.produtoId) || 0;
      const { error: updateError } = await supabase
        .from('produtos')
        .update({ estoque_atual: estoqueAtual - item.quantidade })
        .eq('empresa_id', perfil.empresa_id)
        .eq('id', item.produtoId);

      if (updateError) {
        // Rollback
        await supabase.from('transferencias').delete().eq('id', transferencia.id);
        return NextResponse.json(
          { error: 'Erro ao debitar estoque' },
          { status: 500 }
        );
      }

      // Criar movimento de estoque (se a tabela existir)
      await supabase.from('estoque_movs').insert({
        empresa_id: perfil.empresa_id,
        produto_id: item.produtoId,
        tipo: 'saida',
        qtd: item.quantidade,
        motivo: `Transferência para vendedor ${vendedor.nome}`,
        user_id: user.id,
      });
    }

    // 7. Registrar log
    await supabase.from('estoque_logs').insert({
      tipo: 'envio',
      empresa_id: perfil.empresa_id,
      vendedor_id: validated.vendedorId,
      transferencia_id: transferencia.id,
      quantidade: transferencia.total_itens,
      usuario_id: user.id,
      observacao: validated.observacao,
    });

    // 8. Notificar vendedor via Realtime (o frontend deve estar ouvindo)
    // O Supabase Realtime vai automaticamente notificar através do INSERT na tabela transferencias

    return NextResponse.json(
      {
        success: true,
        transferenciaId: transferencia.id,
        status: transferencia.status,
        message: `Transferência criada com sucesso! ${transferencia.total_itens} itens enviados para ${vendedor.nome}.`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro na API create transferencia:', error);

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

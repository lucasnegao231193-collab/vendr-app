/**
 * API: POST /api/solo/vendas
 * Criar nova venda no modo Solo com validação de cota
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { soloVendaSchema } from '@/lib/solo-schemas';
import { podeRegistrarVenda, incrementarCota, getEmpresaIdByUser } from '@/lib/solo-helpers';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 1. Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // 2. Obter empresa_id do usuário
    const empresaId = await getEmpresaIdByUser(user.id);
    if (!empresaId) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }
    
    // 3. Verificar se é empresa Solo
    const { data: empresa } = await supabase
      .from('empresas')
      .select('is_solo, plano')
      .eq('id', empresaId)
      .single();
    
    if (!empresa?.is_solo) {
      return NextResponse.json(
        { error: 'Acesso negado: não é empresa Solo' },
        { status: 403 }
      );
    }
    
    // 4. Validar body da requisição
    const body = await request.json();
    const validation = soloVendaSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.flatten() },
        { status: 400 }
      );
    }
    
    const { itens, metodo_pagamento } = validation.data;
    
    // 5. Verificar limite de vendas (se solo_free)
    const limitCheck = await podeRegistrarVenda(empresaId);
    if (!limitCheck.pode) {
      return NextResponse.json(
        { 
          error: 'Limite atingido',
          message: limitCheck.motivo,
          upgrade_required: true,
        },
        { status: 403 }
      );
    }
    
    // 6. Verificar se perfil existe
    const { data: perfil } = await supabase
      .from('perfis')
      .select('user_id')
      .eq('user_id', user.id)
      .single();
    
    if (!perfil) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }
    
    // 7. Buscar produtos e calcular valores
    const produtoIds = itens.map(item => item.produto_id);
    const { data: produtos } = await supabase
      .from('produtos')
      .select('id, nome, preco, estoque_atual')
      .in('id', produtoIds)
      .eq('empresa_id', empresaId);
    
    if (!produtos || produtos.length !== itens.length) {
      return NextResponse.json(
        { error: 'Alguns produtos não foram encontrados' },
        { status: 404 }
      );
    }
    
    // 7. Verificar estoque disponível
    for (const item of itens) {
      const produto = produtos.find(p => p.id === item.produto_id);
      if (!produto) continue;
      
      if (produto.estoque_atual < item.qtd) {
        return NextResponse.json(
          { 
            error: 'Estoque insuficiente',
            produto: produto.nome,
            disponivel: produto.estoque_atual,
          },
          { status: 400 }
        );
      }
    }
    
    // 8. Criar vendas (uma para cada item)
    const vendasCriadas = [];
    
    for (const item of itens) {
      const produto = produtos.find(p => p.id === item.produto_id);
      if (!produto) continue;
      
      // Inserir venda
      const { data: venda, error: vendaError } = await supabase
        .from('vendas')
        .insert({
          empresa_id: empresaId,
          vendedor_id: user.id, // user_id do perfil
          produto_id: item.produto_id,
          qtd: item.qtd,
          valor_unit: produto.preco,
          meio_pagamento: metodo_pagamento,
          status: 'confirmado',
          data_hora: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (vendaError) {
        console.error('Erro ao criar venda:', vendaError);
        return NextResponse.json(
          { 
            error: 'Erro ao criar venda',
            details: vendaError.message,
            code: vendaError.code 
          },
          { status: 500 }
        );
      }
      
      // Atualizar estoque
      const { error: estoqueError } = await supabase
        .from('produtos')
        .update({
          estoque_atual: produto.estoque_atual - item.qtd,
        })
        .eq('id', item.produto_id);
      
      if (estoqueError) {
        console.error('Erro ao atualizar estoque:', estoqueError);
      }
      
      vendasCriadas.push(venda);
    }
    
    // 9. Incrementar cota
    const incrementado = await incrementarCota(empresaId);
    if (!incrementado) {
      console.warn('Não foi possível incrementar cota');
    }
    
    // 10. Calcular totais
    const valorTotal = vendasCriadas.reduce(
      (sum, v) => sum + (v.qtd * v.valor_unit),
      0
    );
    
    return NextResponse.json({
      success: true,
      vendas: vendasCriadas,
      valor_total: valorTotal,
      itens_count: vendasCriadas.length,
    });
    
  } catch (error) {
    console.error('Erro ao criar venda Solo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET: Listar vendas do Solo
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const empresaId = await getEmpresaIdByUser(user.id);
    if (!empresaId) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }
    
    // Parâmetros de filtro
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('data_inicio');
    const dataFim = searchParams.get('data_fim');
    const metodoPagamento = searchParams.get('metodo_pagamento');
    
    let query = supabase
      .from('vendas')
      .select('*, produtos(nome, marca)')
      .eq('empresa_id', empresaId)
      .eq('status', 'confirmado')
      .order('data_hora', { ascending: false });
    
    if (dataInicio) {
      query = query.gte('data_hora', `${dataInicio}T00:00:00`);
    }
    
    if (dataFim) {
      query = query.lte('data_hora', `${dataFim}T23:59:59`);
    }
    
    if (metodoPagamento) {
      query = query.eq('meio_pagamento', metodoPagamento);
    }
    
    const { data: vendas, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ vendas });
    
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

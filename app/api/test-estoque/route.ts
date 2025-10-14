/**
 * Endpoint de TESTE para verificar se consegue inserir no estoque
 * DELETE ESTE ARQUIVO DEPOIS DO TESTE
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 TESTE: Iniciando teste de inserção no estoque');
    
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

    if (!perfil) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    console.log('✅ Usuário autenticado:', user.id);
    console.log('✅ Empresa ID:', perfil.empresa_id);

    // Buscar um produto (Coca Cola) - SEM filtrar por empresa_id primeiro
    const { data: produtos, error: produtoError } = await supabase
      .from('produtos')
      .select('id, nome, empresa_id')
      .ilike('nome', '%coca%');

    console.log('🔍 Produtos encontrados:', produtos);
    console.log('❌ Erro ao buscar produtos:', produtoError);

    if (!produtos || produtos.length === 0) {
      return NextResponse.json({ 
        error: 'Produto Coca Cola não encontrado',
        produtoError,
        empresa_id: perfil.empresa_id
      }, { status: 404 });
    }

    // Pegar o primeiro produto encontrado
    const produto = produtos[0];

    console.log('✅ Produto encontrado:', produto.nome, produto.id);

    // Tentar buscar estoque existente
    const { data: estoqueExistente, error: estoqueError } = await supabase
      .from('estoques')
      .select('id, qtd')
      .eq('empresa_id', perfil.empresa_id)
      .eq('produto_id', produto.id)
      .single();

    console.log('📦 Estoque existente:', estoqueExistente);
    console.log('❌ Erro ao buscar estoque:', estoqueError);

    let resultado: any = {};

    if (estoqueExistente) {
      // Atualizar
      console.log('🔄 Tentando ATUALIZAR estoque...');
      const novaQtd = estoqueExistente.qtd + 10;
      
      const { data: updated, error: updateError } = await supabase
        .from('estoques')
        .update({ qtd: novaQtd })
        .eq('id', estoqueExistente.id)
        .select();

      console.log('✅ Resultado UPDATE:', updated);
      console.log('❌ Erro UPDATE:', updateError);

      resultado.acao = 'UPDATE';
      resultado.qtdAnterior = estoqueExistente.qtd;
      resultado.qtdNova = novaQtd;
      resultado.sucesso = !updateError;
      resultado.erro = updateError;
    } else {
      // Inserir
      console.log('➕ Tentando INSERIR novo estoque...');
      
      const { data: inserted, error: insertError } = await supabase
        .from('estoques')
        .insert({
          empresa_id: perfil.empresa_id,
          produto_id: produto.id,
          qtd: 10,
        })
        .select();

      console.log('✅ Resultado INSERT:', inserted);
      console.log('❌ Erro INSERT:', insertError);

      resultado.acao = 'INSERT';
      resultado.qtdNova = 10;
      resultado.sucesso = !insertError;
      resultado.erro = insertError;
    }

    // Tentar inserir movimento
    console.log('📝 Tentando inserir movimento...');
    const { data: movimento, error: movError } = await supabase
      .from('estoque_movs')
      .insert({
        empresa_id: perfil.empresa_id,
        produto_id: produto.id,
        tipo: 'entrada',
        qtd: 10,
        motivo: 'TESTE de API',
        user_id: user.id,
      })
      .select();

    console.log('✅ Movimento criado:', movimento);
    console.log('❌ Erro movimento:', movError);

    resultado.movimento = {
      sucesso: !movError,
      erro: movError,
    };

    return NextResponse.json({
      message: 'Teste concluído',
      user_id: user.id,
      empresa_id: perfil.empresa_id,
      produto: produto.nome,
      produto_id: produto.id,
      resultado,
    });

  } catch (error: any) {
    console.error('💥 ERRO NO TESTE:', error);
    return NextResponse.json(
      { error: 'Erro no teste', details: error.message },
      { status: 500 }
    );
  }
}

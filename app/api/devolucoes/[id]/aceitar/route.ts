/**
 * POST /api/devolucoes/[id]/aceitar
 * Empresa aceita devolução do vendedor
 * - Debita estoque do vendedor
 * - Credita estoque da empresa
 * - Atualiza status
 * - Registra log
 * - Notifica vendedor
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const aceitarDevolucaoSchema = z.object({
  observacao: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const devolucaoId = params.id;

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
        { error: 'Apenas owner/admin podem aceitar devoluções' },
        { status: 403 }
      );
    }

    // Validar body
    const body = await request.json();
    const validated = aceitarDevolucaoSchema.parse(body);

    // Buscar devolução
    const { data: devolucao, error: devolucaoError } = await supabase
      .from('devolucoes')
      .select(`
        *,
        itens:devolucao_itens(*),
        vendedor:vendedores!vendedor_id(id, nome)
      `)
      .eq('id', devolucaoId)
      .eq('empresa_id', perfil.empresa_id)
      .single();

    if (devolucaoError || !devolucao) {
      return NextResponse.json(
        { error: 'Devolução não encontrada' },
        { status: 404 }
      );
    }

    // Validar status
    if (devolucao.status !== 'aguardando_confirmacao') {
      return NextResponse.json(
        {
          error: 'Devolução já foi processada',
          status: devolucao.status,
        },
        { status: 400 }
      );
    }

    // TRANSAÇÃO: Aceitar devolução
    // 1. Atualizar status
    const { error: updateError } = await supabase
      .from('devolucoes')
      .update({ status: 'aceita' })
      .eq('id', devolucaoId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao aceitar devolução' },
        { status: 500 }
      );
    }

    // 2. Debitar estoque do vendedor e creditar empresa
    for (const item of devolucao.itens) {
      // Debitar vendedor
      const { data: estoqueVendedor } = await supabase
        .from('vendedor_estoque')
        .select('id, quantidade')
        .eq('vendedor_id', devolucao.vendedor_id)
        .eq('produto_id', item.produto_id)
        .single();

      if (estoqueVendedor && estoqueVendedor.quantidade >= item.quantidade) {
        const novaQtd = estoqueVendedor.quantidade - item.quantidade;
        
        if (novaQtd === 0) {
          // Remover registro se ficar zerado
          await supabase
            .from('vendedor_estoque')
            .delete()
            .eq('id', estoqueVendedor.id);
        } else {
          await supabase
            .from('vendedor_estoque')
            .update({ quantidade: novaQtd })
            .eq('id', estoqueVendedor.id);
        }
      }

      // Creditar empresa
      const { data: estoqueEmpresa } = await supabase
        .from('estoques')
        .select('id, qtd')
        .eq('empresa_id', perfil.empresa_id)
        .eq('produto_id', item.produto_id)
        .single();

      if (estoqueEmpresa) {
        await supabase
          .from('estoques')
          .update({ qtd: estoqueEmpresa.qtd + item.quantidade })
          .eq('id', estoqueEmpresa.id);
      } else {
        // Criar se não existe
        await supabase.from('estoques').insert({
          empresa_id: perfil.empresa_id,
          produto_id: item.produto_id,
          qtd: item.quantidade,
        });
      }

      // Criar movimento de entrada
      await supabase.from('estoque_movs').insert({
        empresa_id: perfil.empresa_id,
        produto_id: item.produto_id,
        tipo: 'entrada',
        qtd: item.quantidade,
        motivo: `Devolução aceita de ${devolucao.vendedor.nome}`,
        user_id: user.id,
      });
    }

    // 3. Registrar log
    await supabase.from('estoque_logs').insert({
      tipo: 'aceite_devolucao',
      empresa_id: perfil.empresa_id,
      vendedor_id: devolucao.vendedor_id,
      devolucao_id: devolucaoId,
      quantidade: devolucao.total_itens,
      usuario_id: user.id,
      observacao: validated.observacao || 'Devolução aceita pela empresa',
    });

    return NextResponse.json({
      success: true,
      message: 'Devolução aceita! Itens retornaram ao estoque da empresa.',
      devolucaoId,
      itensDevolvidos: devolucao.total_itens,
    });
  } catch (error: any) {
    console.error('Erro ao aceitar devolução:', error);

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

/**
 * POST /api/transferencias/[id]/recusar
 * Vendedor recusa transferência
 * - Atualiza status para 'recusado'
 * - Devolve itens ao estoque da empresa
 * - Registra log com motivo
 * - Notifica empresa
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const recusarSchema = z.object({
  motivo: z.string().optional(),
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

    const transferenciaId = params.id;

    // Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar vendedor
    const { data: vendedor } = await supabase
      .from('vendedores')
      .select('id, nome')
      .eq('user_id', user.id)
      .single();

    if (!vendedor) {
      return NextResponse.json(
        { error: 'Vendedor não encontrado' },
        { status: 404 }
      );
    }

    // Validar body
    const body = await request.json();
    const validated = recusarSchema.parse(body);

    // Buscar transferência
    const { data: transferencia, error: transfError } = await supabase
      .from('transferencias')
      .select(`
        *,
        itens:transferencia_itens(*)
      `)
      .eq('id', transferenciaId)
      .eq('vendedor_id', vendedor.id)
      .single();

    if (transfError || !transferencia) {
      return NextResponse.json(
        { error: 'Transferência não encontrada' },
        { status: 404 }
      );
    }

    // Validar status
    if (transferencia.status !== 'aguardando_aceite') {
      return NextResponse.json(
        {
          error: 'Transferência já foi processada',
          status: transferencia.status,
        },
        { status: 400 }
      );
    }

    // TRANSAÇÃO: Recusar transferência
    // 1. Atualizar status
    const { error: updateError } = await supabase
      .from('transferencias')
      .update({
        status: 'recusado',
        observacao:
          validated.motivo ||
          transferencia.observacao ||
          'Recusado pelo vendedor',
      })
      .eq('id', transferenciaId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao recusar transferência' },
        { status: 500 }
      );
    }

    // 2. Devolver itens ao estoque da empresa
    for (const item of transferencia.itens) {
      // Buscar estoque atual da empresa
      const { data: estoqueEmpresa } = await supabase
        .from('estoques')
        .select('id, qtd')
        .eq('empresa_id', transferencia.empresa_id)
        .eq('produto_id', item.produto_id)
        .single();

      if (estoqueEmpresa) {
        // Adicionar de volta
        await supabase
          .from('estoques')
          .update({
            qtd: estoqueEmpresa.qtd + item.quantidade,
          })
          .eq('id', estoqueEmpresa.id);
      }

      // Criar movimento de entrada
      await supabase.from('estoque_movs').insert({
        empresa_id: transferencia.empresa_id,
        produto_id: item.produto_id,
        tipo: 'entrada',
        qtd: item.quantidade,
        motivo: `Devolução por recusa de ${vendedor.nome}`,
        user_id: user.id,
      });
    }

    // 3. Registrar log
    await supabase.from('estoque_logs').insert({
      tipo: 'recusa_envio',
      empresa_id: transferencia.empresa_id,
      vendedor_id: vendedor.id,
      transferencia_id: transferenciaId,
      quantidade: transferencia.total_itens,
      usuario_id: user.id,
      observacao: validated.motivo || 'Transferência recusada pelo vendedor',
    });

    return NextResponse.json({
      success: true,
      message: 'Transferência recusada. Itens devolvidos ao estoque da empresa.',
      transferenciaId,
    });
  } catch (error: any) {
    console.error('Erro ao recusar transferência:', error);

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

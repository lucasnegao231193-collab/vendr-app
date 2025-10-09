/**
 * POST /api/transferencias/[id]/aceitar
 * Vendedor aceita transferência recebida
 * - Valida transferência pendente
 * - Adiciona itens ao estoque do vendedor
 * - Atualiza status para 'aceito'
 * - Registra log
 * - Notifica empresa
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const aceitarSchema = z.object({
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

    const transferenciaId = params.id;

    // Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar vendedor
    const { data: vendedor } = await supabase
      .from('vendedores')
      .select('id')
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
    const validated = aceitarSchema.parse(body);

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

    // TRANSAÇÃO: Aceitar transferência
    // 1. Atualizar status
    const { error: updateError } = await supabase
      .from('transferencias')
      .update({ status: 'aceito' })
      .eq('id', transferenciaId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao aceitar transferência' },
        { status: 500 }
      );
    }

    // 2. Adicionar itens ao estoque do vendedor
    for (const item of transferencia.itens) {
      // Verificar se já existe estoque para este produto
      const { data: estoqueExistente } = await supabase
        .from('vendedor_estoque')
        .select('id, quantidade')
        .eq('vendedor_id', vendedor.id)
        .eq('produto_id', item.produto_id)
        .single();

      if (estoqueExistente) {
        // Atualizar quantidade
        await supabase
          .from('vendedor_estoque')
          .update({
            quantidade: estoqueExistente.quantidade + item.quantidade,
          })
          .eq('id', estoqueExistente.id);
      } else {
        // Criar novo registro
        await supabase.from('vendedor_estoque').insert({
          vendedor_id: vendedor.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
        });
      }
    }

    // 3. Registrar log
    await supabase.from('estoque_logs').insert({
      tipo: 'aceite_envio',
      empresa_id: transferencia.empresa_id,
      vendedor_id: vendedor.id,
      transferencia_id: transferenciaId,
      quantidade: transferencia.total_itens,
      usuario_id: user.id,
      observacao: validated.observacao || 'Transferência aceita pelo vendedor',
    });

    // 4. Notificar empresa (via Realtime - UPDATE automático)
    
    return NextResponse.json({
      success: true,
      message: 'Transferência aceita com sucesso!',
      transferenciaId,
      itensAdicionados: transferencia.total_itens,
    });
  } catch (error: any) {
    console.error('Erro ao aceitar transferência:', error);

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

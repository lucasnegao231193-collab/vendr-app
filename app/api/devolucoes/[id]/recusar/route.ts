/**
 * POST /api/devolucoes/[id]/recusar
 * Empresa recusa devolução do vendedor
 * - Atualiza status
 * - Registra log
 * - Notifica vendedor
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const recusarDevolucaoSchema = z.object({
  motivo: z.string().min(1, 'Motivo é obrigatório ao recusar'),
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
        { error: 'Apenas owner/admin podem recusar devoluções' },
        { status: 403 }
      );
    }

    // Validar body
    const body = await request.json();
    const validated = recusarDevolucaoSchema.parse(body);

    // Buscar devolução
    const { data: devolucao, error: devolucaoError } = await supabase
      .from('devolucoes')
      .select('*')
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

    // Atualizar status
    const { error: updateError } = await supabase
      .from('devolucoes')
      .update({
        status: 'recusada',
        observacao: validated.motivo,
      })
      .eq('id', devolucaoId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao recusar devolução' },
        { status: 500 }
      );
    }

    // Registrar log
    await supabase.from('estoque_logs').insert({
      tipo: 'recusa_devolucao',
      empresa_id: perfil.empresa_id,
      vendedor_id: devolucao.vendedor_id,
      devolucao_id: devolucaoId,
      quantidade: devolucao.total_itens,
      usuario_id: user.id,
      observacao: validated.motivo,
    });

    return NextResponse.json({
      success: true,
      message: 'Devolução recusada.',
      devolucaoId,
      motivo: validated.motivo,
    });
  } catch (error: any) {
    console.error('Erro ao recusar devolução:', error);

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

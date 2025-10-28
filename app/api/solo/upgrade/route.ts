/**
 * API: POST /api/solo/upgrade
 * Fazer upgrade para Solo Pro
 * (Stub - integração de pagamento futura)
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { soloUpgradeSchema } from '@/lib/solo-schemas';
import { getEmpresaIdByUser } from '@/lib/solo-helpers';

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
    
    // 2. Obter empresa_id
    const empresaId = await getEmpresaIdByUser(user.id);
    if (!empresaId) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }
    
    // 3. Verificar se é owner da empresa Solo
    const { data: perfil } = await supabase
      .from('perfis')
      .select('role')
      .eq('user_id', user.id)
      .eq('empresa_id', empresaId)
      .single();
    
    if (perfil?.role !== 'owner') {
      return NextResponse.json(
        { error: 'Apenas o proprietário pode fazer upgrade' },
        { status: 403 }
      );
    }
    
    // 4. Verificar se é empresa Solo
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
    
    // 5. Validar body
    const body = await request.json();
    const validation = soloUpgradeSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.flatten() },
        { status: 400 }
      );
    }
    
    // 6. Verificar se já é Pro
    if (empresa.plano === 'solo_pro') {
      return NextResponse.json(
        { error: 'Você já está no plano Solo Pro' },
        { status: 400 }
      );
    }
    
    // 7. STUB: Simulação de pagamento
    // TODO: Integrar com Stripe/Pagar.me
    // Por enquanto, apenas atualiza o plano
    
    // 8. Atualizar plano
    const { error: updateError } = await supabase
      .from('empresas')
      .update({ plano: 'solo_pro' })
      .eq('id', empresaId);
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao atualizar plano' },
        { status: 500 }
      );
    }
    
    // 9. Registrar log de upgrade (opcional)
    // Pode criar tabela de auditoria futuramente
    
    return NextResponse.json({
      success: true,
      message: 'Upgrade realizado com sucesso!',
      plano_anterior: empresa.plano,
      plano_novo: 'solo_pro',
    });
    
  } catch (error) {
    console.error('Erro ao fazer upgrade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

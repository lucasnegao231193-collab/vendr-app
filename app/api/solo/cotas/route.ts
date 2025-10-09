/**
 * API: GET /api/solo/cotas
 * Obter cota atual do mês
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getSoloCotaAtual, getEmpresaIdByUser } from '@/lib/solo-helpers';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Obter empresa_id
    const empresaId = await getEmpresaIdByUser(user.id);
    if (!empresaId) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }
    
    // Buscar cota atual
    const cota = await getSoloCotaAtual(empresaId);
    
    return NextResponse.json({
      ano_mes: cota.anoMes,
      vendas_mes: cota.vendasMes,
      limite: cota.limite,
      plano: cota.plano,
      limite_atingido: cota.limiteAtingido,
      percentual_usado: cota.limite > 0 
        ? Math.round((cota.vendasMes / cota.limite) * 100)
        : 0,
    });
    
  } catch (error) {
    console.error('Erro ao buscar cota:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

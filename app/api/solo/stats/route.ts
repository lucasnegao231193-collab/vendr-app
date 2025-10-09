/**
 * API: GET /api/solo/stats
 * Obter estatísticas do dashboard Solo
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getSoloStats, getEmpresaIdByUser } from '@/lib/solo-helpers';

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
    
    // Buscar estatísticas
    const stats = await getSoloStats(empresaId);
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

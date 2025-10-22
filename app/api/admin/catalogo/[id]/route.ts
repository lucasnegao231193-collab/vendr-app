import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// DELETE - Remover estabelecimento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Verificar se é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!adminData) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Deletar estabelecimento
    const { error } = await supabase
      .from('catalogo_estabelecimentos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar estabelecimento:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar estabelecimento' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro na API de deletar:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

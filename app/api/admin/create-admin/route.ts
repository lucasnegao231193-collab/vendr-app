import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { email, nome, super_admin } = await request.json();

    // Criar admin
    const { data, error } = await supabase
      .from('admins')
      .insert({
        user_id: user.id,
        email,
        nome,
        super_admin: super_admin || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar admin:', error);
      return NextResponse.json(
        { error: 'Erro ao criar admin' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na API de criar admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * API Route para criar conta Solo (Autônomo)
 * Usa service role key para contornar problemas de Auth e RLS
 */
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Verificar se as variáveis de ambiente existem
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL não configurada');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada');
}

// Cliente com service role (admin)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    const { email, senha, nomeNegocio } = await request.json();

    // Validar dados
    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    // 1. Criar usuário
    console.log('🔐 Criando usuário...');
    const { data: authData, error: authError} = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      console.error('❌ Erro ao criar usuário:', authError);
      return NextResponse.json(
        { error: `Erro ao criar usuário: ${authError?.message || 'Usuário não criado'}` },
        { status: 500 }
      );
    }

    console.log('✅ Usuário criado:', authData.user.id);

    // 2. Criar empresa Solo
    const { data: empresaData, error: empresaError } = await supabaseAdmin
      .from('empresas')
      .insert({
        nome: nomeNegocio || `${email.split('@')[0]} - Solo`,
        is_solo: true,
      })
      .select()
      .single();

    if (empresaError || !empresaData) {
      console.error('❌ Erro ao criar empresa:', empresaError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Erro ao criar empresa' },
        { status: 500 }
      );
    }

    console.log('✅ Empresa criada:', empresaData.id);

    // 3. Criar perfil
    const { error: perfilError } = await supabaseAdmin
      .from('perfis')
      .insert({
        user_id: authData.user.id,
        empresa_id: empresaData.id,
        role: 'owner',
      });

    if (perfilError) {
      console.error('❌ Erro ao criar perfil:', perfilError);
      await supabaseAdmin.from('empresas').delete().eq('id', empresaData.id);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Erro ao criar perfil' },
        { status: 500 }
      );
    }

    console.log('✅ Perfil criado!');

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      empresaId: empresaData.id,
    });

  } catch (error: any) {
    console.error('Erro no signup solo:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

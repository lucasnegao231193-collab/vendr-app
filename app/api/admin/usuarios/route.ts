import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET - Listar todos os usuários (apenas para admins)
export async function GET() {
  try {
    const supabase = await createClient();
    
    console.log('🔍 API /admin/usuarios - Iniciando...');
    
    // Verificar se é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Não autenticado');
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    console.log('✅ Usuário autenticado:', user.id);

    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!adminData) {
      console.log('❌ Não é admin');
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    console.log('✅ Admin verificado, buscando dados...');

    // Buscar perfis com empresas (LEFT JOIN para pegar todos)
    const { data: perfis, error: perfisError } = await supabase
      .from('perfis')
      .select(`
        user_id,
        nome,
        role,
        empresa_id,
        empresas(
          id,
          nome,
          is_solo
        )
      `);

    if (perfisError) {
      console.error('❌ Erro ao buscar perfis:', perfisError);
    }

    console.log('📋 Perfis encontrados:', perfis?.length || 0);
    if (perfis && perfis.length > 0) {
      console.log('📋 Exemplo de perfil completo:', JSON.stringify(perfis[0], null, 2));
      console.log('📋 Tipo de empresas:', typeof perfis[0]?.empresas);
      console.log('📋 É array?:', Array.isArray(perfis[0]?.empresas));
      console.log('📋 Empresas value:', perfis[0]?.empresas);
      console.log('📋 Perfis owner:', perfis.filter(p => p.role === 'owner').length);
      console.log('📋 Perfis seller:', perfis.filter(p => p.role === 'seller').length);
    }

    // Buscar admins
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('user_id, nome, email, criado_em');

    if (adminsError) {
      console.error('❌ Erro ao buscar admins:', adminsError);
    }

    console.log('👑 Admins encontrados:', admins?.length || 0);
    if (admins && admins.length > 0) {
      console.log('👑 Exemplo de admin:', admins[0]);
    }

    // Criar lista combinada de usuários
    const usuarios: any[] = [];

    // Adicionar perfis normais
    if (perfis) {
      perfis.forEach(perfil => {
        // Supabase retorna empresas como objeto (não array)
        let empresa = null;
        if (perfil.empresas) {
          // Se for objeto direto, usar ele
          if (typeof perfil.empresas === 'object' && !Array.isArray(perfil.empresas)) {
            empresa = perfil.empresas;
          }
          // Se for array, pegar primeiro item
          else if (Array.isArray(perfil.empresas) && perfil.empresas.length > 0) {
            empresa = perfil.empresas[0];
          }
        }
        
        usuarios.push({
          id: perfil.user_id,
          email: '', // Será preenchido depois se necessário
          created_at: new Date().toISOString(),
          perfil: {
            id: perfil.user_id,
            nome: perfil.nome,
            role: perfil.role,
            empresa: empresa
          },
          is_admin: false
        });
      });
    }

    // Adicionar admins
    if (admins) {
      admins.forEach(admin => {
        // Verificar se já existe na lista
        const existingIndex = usuarios.findIndex(u => u.id === admin.user_id);
        if (existingIndex >= 0) {
          usuarios[existingIndex].is_admin = true;
          usuarios[existingIndex].email = admin.email;
        } else {
          usuarios.push({
            id: admin.user_id,
            email: admin.email,
            created_at: admin.criado_em,
            perfil: {
              id: admin.user_id,
              nome: admin.nome,
              role: 'admin',
              empresa: null
            },
            is_admin: true
          });
        }
      });
    }

    console.log('✅ Total de usuários:', usuarios.length);

    // Ordenar por data de criação
    usuarios.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('❌ Erro na API de admin/usuarios:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

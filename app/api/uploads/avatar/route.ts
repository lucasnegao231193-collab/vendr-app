/**
 * API de Upload de Avatares
 * POST /api/uploads/avatar
 * Faz upload para Supabase Storage e atualiza banco de dados
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export async function POST(request: NextRequest) {
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

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Obter empresa_id do usuário
    const { data: perfil } = await supabase
      .from('perfis')
      .select('empresa_id, role')
      .eq('user_id', user.id)
      .single();

    if (!perfil) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entityType') as string;
    const entityId = formData.get('entityId') as string;

    if (!file || !entityType || !entityId) {
      return NextResponse.json(
        { error: 'Parâmetros faltando: file, entityType, entityId' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo não permitido. Use: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validar tamanho
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo: ${MAX_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validar permissão
    if (entityType === 'empresa' && entityId !== perfil.empresa_id) {
      return NextResponse.json(
        { error: 'Sem permissão para alterar esta empresa' },
        { status: 403 }
      );
    }

    // Gerar nome único do arquivo
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${entityType}-${entityId}-${timestamp}.${fileExt}`;
    const filePath = `${perfil.empresa_id}/${fileName}`;

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Erro ao fazer upload: ' + uploadError.message },
        { status: 500 }
      );
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const avatarUrl = publicUrlData.publicUrl;

    // Atualizar banco de dados
    let updateError = null;

    if (entityType === 'empresa') {
      const { error } = await supabase
        .from('empresas')
        .update({ avatar_url: avatarUrl })
        .eq('id', entityId);
      updateError = error;
    } else if (entityType === 'vendedor') {
      const { error } = await supabase
        .from('vendedores')
        .update({ avatar_url: avatarUrl })
        .eq('id', entityId);
      updateError = error;
    } else if (entityType === 'profile') {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          empresa_id: perfil.empresa_id,
          avatar_url: avatarUrl,
        });
      updateError = error;
    }

    if (updateError) {
      console.error('DB update error:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar banco de dados' },
        { status: 500 }
      );
    }

    // Registrar upload log
    await supabase.from('upload_logs').insert({
      empresa_id: perfil.empresa_id,
      user_id: user.id,
      entity_type: entityType,
      entity_id: entityId,
      file_type: 'avatar',
      file_url: avatarUrl,
      file_size: file.size,
      mime_type: file.type,
    });

    return NextResponse.json({
      success: true,
      url: avatarUrl,
      thumbUrl: avatarUrl, // TODO: gerar thumbnail com sharp
      message: 'Upload realizado com sucesso',
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET endpoint para preview (opcional)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');

  if (!entityType || !entityId) {
    return NextResponse.json(
      { error: 'Parâmetros faltando' },
      { status: 400 }
    );
  }

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

    let avatarUrl = null;

    if (entityType === 'empresa') {
      const { data } = await supabase
        .from('empresas')
        .select('avatar_url')
        .eq('id', entityId)
        .single();
      avatarUrl = data?.avatar_url;
    } else if (entityType === 'vendedor') {
      const { data } = await supabase
        .from('vendedores')
        .select('avatar_url')
        .eq('id', entityId)
        .single();
      avatarUrl = data?.avatar_url;
    }

    return NextResponse.json({ url: avatarUrl });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar avatar' },
      { status: 500 }
    );
  }
}

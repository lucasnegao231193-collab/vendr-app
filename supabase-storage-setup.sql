-- ============================================
-- VENDR - Configuração Supabase Storage
-- Bucket para avatares e uploads
-- ============================================

-- 1. Criar bucket 'avatars' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- público para CDN
  2097152, -- 2 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[];

-- 2. Políticas de Storage RLS para 'avatars'

-- Permitir leitura pública (CDN)
DROP POLICY IF EXISTS "Public avatars are publicly readable" ON storage.objects;
CREATE POLICY "Public avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Permitir upload apenas para usuários autenticados da própria empresa
DROP POLICY IF EXISTS "Users can upload their own company avatars" ON storage.objects;
CREATE POLICY "Users can upload their own company avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT empresa_id::text FROM perfis WHERE user_id = auth.uid()
    )
  );

-- Permitir atualização apenas dos próprios arquivos
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT empresa_id::text FROM perfis WHERE user_id = auth.uid()
    )
  );

-- Permitir deleção apenas dos próprios arquivos
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT empresa_id::text FROM perfis WHERE user_id = auth.uid()
    )
  );

-- 3. Criar bucket 'uploads' para outros arquivos (opcional)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'uploads',
  'uploads',
  false, -- privado
  10485760 -- 10 MB limit
)
ON CONFLICT (id) DO NOTHING;

-- 4. Função helper para gerar URL pública
CREATE OR REPLACE FUNCTION public.get_avatar_url(p_bucket text, p_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_base_url text;
BEGIN
  -- Obter URL base do Supabase
  SELECT 
    COALESCE(
      current_setting('app.settings.supabase_url', true),
      'https://seu-projeto.supabase.co'
    ) INTO v_base_url;
  
  RETURN v_base_url || '/storage/v1/object/public/' || p_bucket || '/' || p_path;
END;
$$;

-- 5. Comentários
COMMENT ON FUNCTION public.get_avatar_url IS 'Gera URL pública para avatar no Storage';

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================
-- 
-- 1. No Supabase Dashboard > Storage:
--    - Verificar se bucket 'avatars' foi criado
--    - Verificar políticas RLS
-- 
-- 2. Estrutura de pastas:
--    avatars/
--      ├── {empresa_id}/
--      │   ├── logo.webp
--      │   ├── logo-thumb.webp
--      │   └── favicon.webp
--      ├── {vendedor_id}/
--      │   ├── avatar.webp
--      │   └── avatar-thumb.webp
-- 
-- 3. Upload via API:
--    POST /api/uploads/avatar
--    - Autenticação: Supabase session
--    - Body: multipart/form-data
--    - Response: { url, thumbUrl }
-- 
-- ============================================

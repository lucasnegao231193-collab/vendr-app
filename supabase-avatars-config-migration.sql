-- ============================================
-- VENDR - Migração: Avatares e Configurações
-- Adiciona upload de fotos e settings
-- ============================================

-- 1. Adicionar campos de avatar nas tabelas existentes
ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS favicon_url TEXT,
  ADD COLUMN IF NOT EXISTS cor_primaria TEXT DEFAULT '#0057FF',
  ADD COLUMN IF NOT EXISTS horario_funcionamento JSONB DEFAULT '{"seg_sex": "08:00-18:00", "sab": "08:00-12:00", "dom": "fechado"}',
  ADD COLUMN IF NOT EXISTS endereco_completo TEXT;

ALTER TABLE public.vendedores
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Criar tabela de profiles unificada (se não existir)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  avatar_url TEXT,
  nome_completo TEXT,
  telefone TEXT,
  cargo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Criar tabela de configurações da empresa
CREATE TABLE IF NOT EXISTS public.empresa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  integracoes JSONB DEFAULT '{}',
  notificacoes JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
  seguranca JSONB DEFAULT '{"2fa_enabled": false, "session_timeout": 3600}',
  branding JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id)
);

-- 4. Criar tabela de histórico de uploads
CREATE TABLE IF NOT EXISTS public.upload_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('empresa', 'vendedor', 'profile', 'produto')),
  entity_id UUID NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('avatar', 'logo', 'favicon', 'produto_img')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Criar tabela de sessões ativas (para segurança)
CREATE TABLE IF NOT EXISTS public.active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_empresa_id ON public.profiles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresa_settings_empresa_id ON public.empresa_settings(empresa_id);
CREATE INDEX IF NOT EXISTS idx_upload_logs_empresa_id ON public.upload_logs(empresa_id);
CREATE INDEX IF NOT EXISTS idx_upload_logs_entity ON public.upload_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires ON public.active_sessions(expires_at);

-- 7. Habilitar RLS em todas as novas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS para profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 9. Políticas RLS para empresa_settings
DROP POLICY IF EXISTS "Owners can view empresa settings" ON public.empresa_settings;
DROP POLICY IF EXISTS "Owners can update empresa settings" ON public.empresa_settings;
DROP POLICY IF EXISTS "Owners can insert empresa settings" ON public.empresa_settings;

CREATE POLICY "Owners can view empresa settings"
  ON public.empresa_settings FOR SELECT
  USING (empresa_id IN (
    SELECT empresa_id FROM public.perfis WHERE user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Owners can update empresa settings"
  ON public.empresa_settings FOR UPDATE
  USING (empresa_id IN (
    SELECT empresa_id FROM public.perfis WHERE user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Owners can insert empresa settings"
  ON public.empresa_settings FOR INSERT
  WITH CHECK (empresa_id IN (
    SELECT empresa_id FROM public.perfis WHERE user_id = auth.uid() AND role = 'owner'
  ));

-- 10. Políticas RLS para upload_logs (somente leitura pela empresa)
DROP POLICY IF EXISTS "Users can view their empresa upload logs" ON public.upload_logs;

CREATE POLICY "Users can view their empresa upload logs"
  ON public.upload_logs FOR SELECT
  USING (empresa_id IN (
    SELECT empresa_id FROM public.perfis WHERE user_id = auth.uid()
  ));

-- 11. Políticas RLS para active_sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.active_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.active_sessions;

CREATE POLICY "Users can view their own sessions"
  ON public.active_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own sessions"
  ON public.active_sessions FOR DELETE
  USING (user_id = auth.uid());

-- 12. Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.active_sessions
  WHERE expires_at < NOW();
END;
$$;

-- 13. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 14. Triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_empresa_settings_updated_at ON public.empresa_settings;
CREATE TRIGGER update_empresa_settings_updated_at
  BEFORE UPDATE ON public.empresa_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Criar settings padrão para empresas existentes
INSERT INTO public.empresa_settings (empresa_id)
SELECT id FROM public.empresas
WHERE id NOT IN (SELECT empresa_id FROM public.empresa_settings)
ON CONFLICT (empresa_id) DO NOTHING;

-- 16. Comentários nas colunas
COMMENT ON COLUMN public.empresas.avatar_url IS 'URL do avatar/logo principal da empresa';
COMMENT ON COLUMN public.empresas.logo_url IS 'URL do logo oficial (desktop)';
COMMENT ON COLUMN public.empresas.favicon_url IS 'URL do favicon personalizado';
COMMENT ON COLUMN public.empresas.cor_primaria IS 'Cor primária do branding (hex)';
COMMENT ON COLUMN public.vendedores.avatar_url IS 'URL do avatar do vendedor';
COMMENT ON TABLE public.profiles IS 'Perfis unificados de usuários com avatar';
COMMENT ON TABLE public.empresa_settings IS 'Configurações e preferências da empresa';
COMMENT ON TABLE public.upload_logs IS 'Histórico de uploads de arquivos';
COMMENT ON TABLE public.active_sessions IS 'Sessões ativas para gerenciamento de segurança';

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================

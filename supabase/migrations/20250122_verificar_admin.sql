-- Script para diagnosticar e corrigir problemas com conta admin
-- Execute este script no SQL Editor do Supabase

-- ============================================================
-- PASSO 1: VERIFICAR STATUS ATUAL
-- ============================================================

-- Verificar se o admin existe
SELECT 
  'Admin registrado' as status,
  a.id,
  a.user_id,
  a.nome,
  a.email,
  a.super_admin,
  u.email as auth_email,
  u.email_confirmed_at
FROM admins a
JOIN auth.users u ON a.user_id = u.id
WHERE a.email = 'venloapp365@gmail.com';

-- Verificar se o admin também tem perfil (NÃO DEVERIA TER)
SELECT 
  'Perfil do admin (PROBLEMA!)' as alerta,
  p.user_id,
  p.role,
  p.empresa_id,
  e.nome as nome_empresa,
  e.is_solo
FROM perfis p
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE p.user_id IN (
  SELECT user_id FROM admins WHERE email = 'lucasnegao231192@gmail.com'
);

-- ============================================================
-- PASSO 2: CORRIGIR PROBLEMAS (SE ENCONTRADOS)
-- ============================================================

-- Se o admin tiver perfil e empresa, REMOVER (admin não deve ter empresa)
-- DESCOMENTE AS LINHAS ABAIXO APENAS SE O SELECT ACIMA ENCONTROU PROBLEMAS:

/*
-- Deletar perfil do admin (se existir)
DELETE FROM perfis 
WHERE user_id IN (
  SELECT user_id FROM admins WHERE email = 'lucasnegao231192@gmail.com'
);

-- Deletar empresa do admin (se existir E for Solo)
-- CUIDADO: Só deletar se for empresa Solo criada automaticamente
DELETE FROM empresas 
WHERE id IN (
  SELECT p.empresa_id 
  FROM perfis p 
  WHERE p.user_id IN (
    SELECT user_id FROM admins WHERE email = 'lucasnegao231192@gmail.com'
  )
) AND is_solo = true;
*/

-- ============================================================
-- PASSO 3: GARANTIR QUE ADMIN EXISTE
-- ============================================================

-- Criar/atualizar admin (idempotente)
INSERT INTO admins (user_id, nome, email, super_admin)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', 'Admin'),
  email,
  true
FROM auth.users
WHERE email = 'lucasnegao231192@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  super_admin = true,
  atualizado_em = now();

-- ============================================================
-- PASSO 4: VERIFICAÇÃO FINAL
-- ============================================================

-- Verificar status final
SELECT 
  '✅ Admin configurado corretamente' as status,
  a.id,
  a.user_id,
  a.nome,
  a.email,
  a.super_admin,
  CASE 
    WHEN p.user_id IS NOT NULL THEN '⚠️ TEM PERFIL (PROBLEMA!)'
    ELSE '✅ Sem perfil (correto)'
  END as status_perfil
FROM admins a
LEFT JOIN perfis p ON a.user_id = p.user_id
WHERE a.email = 'venloapp365@gmail.com';

-- Comentários
COMMENT ON TABLE admins IS 'Admin não deve ter empresa ou perfil - é uma conta pura';

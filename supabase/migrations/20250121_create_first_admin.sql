-- Script para criar o primeiro admin
-- IMPORTANTE: Execute este script APÓS criar sua conta no Venlo
-- Substitua 'SEU_EMAIL_AQUI' pelo seu email real

-- Inserir você como super admin
-- Primeiro, encontre seu user_id:
-- SELECT id, email FROM auth.users WHERE email = 'seu_email@exemplo.com';

-- Depois, insira como admin (substitua 'USER_ID_AQUI' pelo ID encontrado):
/*
INSERT INTO admins (user_id, nome, email, super_admin)
VALUES (
  'USER_ID_AQUI',  -- Substitua pelo seu user_id
  'Seu Nome',       -- Seu nome
  'seu@email.com',  -- Seu email
  true              -- Super admin
);
*/

-- OU use esta query que faz tudo automaticamente:
-- Substitua 'seu@email.com' pelo seu email real:

INSERT INTO admins (user_id, nome, email, super_admin)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', email),
  email,
  true
FROM auth.users
WHERE email = 'venloapp365@gmail.com'  -- Email do admin
ON CONFLICT (user_id) DO NOTHING;

-- Verificar se foi criado:
SELECT * FROM admins;

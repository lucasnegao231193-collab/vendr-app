-- Deletar contas de teste do Lucas
-- Esta migration remove todas as contas com nome ou email contendo "Lucas"

-- 1. Buscar e mostrar contas que serão deletadas
DO $$
DECLARE
    user_record RECORD;
BEGIN
    RAISE NOTICE '=== CONTAS QUE SERÃO DELETADAS ===';
    
    -- Listar perfis
    FOR user_record IN 
        SELECT user_id, nome, empresa_id 
        FROM perfis 
        WHERE nome ILIKE '%Lucas%'
    LOOP
        RAISE NOTICE 'Perfil: % (ID: %)', user_record.nome, user_record.user_id;
    END LOOP;
    
    -- Listar admins
    FOR user_record IN 
        SELECT user_id, nome, email 
        FROM admins 
        WHERE nome ILIKE '%Lucas%' OR email ILIKE '%Lucas%'
    LOOP
        RAISE NOTICE 'Admin: % - % (ID: %)', user_record.nome, user_record.email, user_record.user_id;
    END LOOP;
END $$;

-- 2. Deletar perfis do Lucas
DELETE FROM perfis 
WHERE nome ILIKE '%Lucas%';

-- 3. Deletar admins do Lucas
DELETE FROM admins 
WHERE nome ILIKE '%Lucas%' OR email ILIKE '%Lucas%';

-- 4. Deletar empresas do Lucas (se não tiver outros usuários)
DELETE FROM empresas 
WHERE nome ILIKE '%Lucas%' 
  AND id NOT IN (SELECT DISTINCT empresa_id FROM perfis WHERE empresa_id IS NOT NULL);

-- 5. Deletar usuários do auth.users (CASCADE vai deletar tudo relacionado)
-- NOTA: Isso deve ser feito por último pois tem CASCADE
DELETE FROM auth.users 
WHERE email ILIKE '%Lucas%';

-- Mostrar resultado
DO $$
DECLARE
    perfis_count INTEGER;
    admins_count INTEGER;
    empresas_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO perfis_count FROM perfis WHERE nome ILIKE '%Lucas%';
    SELECT COUNT(*) INTO admins_count FROM admins WHERE nome ILIKE '%Lucas%' OR email ILIKE '%Lucas%';
    SELECT COUNT(*) INTO empresas_count FROM empresas WHERE nome ILIKE '%Lucas%';
    
    RAISE NOTICE '=== RESULTADO ===';
    RAISE NOTICE 'Perfis restantes com Lucas: %', perfis_count;
    RAISE NOTICE 'Admins restantes com Lucas: %', admins_count;
    RAISE NOTICE 'Empresas restantes com Lucas: %', empresas_count;
    RAISE NOTICE 'Contas deletadas com sucesso!';
END $$;

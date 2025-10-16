-- Corrige o campo is_solo para empresas normais
-- Empresas criadas via /onboarding devem ter is_solo = false
-- Empresas criadas via /onboarding/solo devem ter is_solo = true

-- 1. Atualizar empresas que não têm is_solo definido
UPDATE empresas 
SET is_solo = false 
WHERE is_solo IS NULL;

-- 2. Garantir que o campo is_solo tenha valor padrão false
ALTER TABLE empresas 
ALTER COLUMN is_solo SET DEFAULT false;

-- 3. Garantir que is_solo não seja null
ALTER TABLE empresas 
ALTER COLUMN is_solo SET NOT NULL;

-- Comentário
COMMENT ON COLUMN empresas.is_solo IS 'Indica se é empresa autônoma (solo) ou empresa normal';

-- Adiciona coluna telefone na tabela empresas
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Comentário da coluna
COMMENT ON COLUMN empresas.telefone IS 'Telefone de contato da empresa';

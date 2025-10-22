-- Migration: Auto-criar empresa Solo e perfil quando usuário se cadastra
-- Isso resolve o problema de timing/confirmação de email

-- Função para criar empresa Solo automaticamente
create or replace function auto_create_solo_empresa()
returns trigger as $$
declare
  nova_empresa_id uuid;
  user_email text;
  user_name text;
begin
  -- Pegar email e nome do usuário
  user_email := new.email;
  user_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(user_email, '@', 1));

  -- Verificar se já existe empresa para este usuário
  if exists (select 1 from empresas where owner_id = new.id) then
    return new;
  end if;

  -- Criar empresa Solo
  insert into empresas (owner_id, nome, is_solo, plano)
  values (
    new.id,
    user_name,
    true,
    'solo_free'
  )
  returning id into nova_empresa_id;

  -- Criar perfil do usuário
  insert into perfis (user_id, empresa_id, nome, role)
  values (
    new.id,
    nova_empresa_id,
    user_name,
    'owner'
  );

  -- Criar cota inicial
  insert into solo_cotas (empresa_id, ano_mes, vendas_mes)
  values (
    nova_empresa_id,
    to_char(now(), 'YYYY-MM'),
    0
  )
  on conflict (empresa_id, ano_mes) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger que executa após criar usuário
-- IMPORTANTE: Só cria empresa Solo se o usuário não tiver metadata indicando outro tipo
create or replace function should_auto_create_solo()
returns trigger as $$
begin
  -- Só criar automaticamente se:
  -- 1. Usuário confirmou email OU confirmação está desabilitada
  -- 2. Não tem metadata indicando que é empresa normal
  if (new.email_confirmed_at is not null or new.confirmation_sent_at is null) and
     (new.raw_user_meta_data->>'account_type' is null or 
      new.raw_user_meta_data->>'account_type' = 'solo') then
    perform auto_create_solo_empresa();
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Criar trigger
drop trigger if exists on_auth_user_created_auto_solo on auth.users;
create trigger on_auth_user_created_auto_solo
  after insert on auth.users
  for each row
  execute function should_auto_create_solo();

-- Trigger para quando email é confirmado (se estava pendente)
drop trigger if exists on_auth_user_confirmed_auto_solo on auth.users;
create trigger on_auth_user_confirmed_auto_solo
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function should_auto_create_solo();

-- Comentários
comment on function auto_create_solo_empresa is 'Cria automaticamente empresa Solo, perfil e cota para novos usuários';
comment on function should_auto_create_solo is 'Verifica se deve criar empresa Solo automaticamente';

-- Migration: Corrigir trigger de auto-criação com tratamento de erros
-- Adiciona logs e tratamento adequado de erros

-- Função melhorada para criar empresa Solo automaticamente
create or replace function auto_create_solo_empresa()
returns trigger as $$
declare
  nova_empresa_id uuid;
  user_email text;
  user_name text;
  account_type_value text;
begin
  -- Pegar email e nome do usuário
  user_email := new.email;
  user_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(user_email, '@', 1));
  account_type_value := new.raw_user_meta_data->>'account_type';

  -- Log para debug
  raise notice 'Auto-create trigger: user_id=%, email=%, account_type=%', new.id, user_email, account_type_value;

  -- Verificar se já existe empresa para este usuário
  if exists (select 1 from empresas where owner_id = new.id) then
    raise notice 'Empresa já existe para user_id=%', new.id;
    return new;
  end if;

  -- Verificar se deve criar empresa Solo
  if account_type_value is not null and account_type_value != 'solo' then
    raise notice 'Não criando empresa Solo: account_type=%', account_type_value;
    return new;
  end if;

  -- Criar empresa Solo
  begin
    insert into empresas (owner_id, nome, is_solo, plano)
    values (
      new.id,
      user_name,
      true,
      'solo_free'
    )
    returning id into nova_empresa_id;

    raise notice 'Empresa Solo criada: id=%', nova_empresa_id;
  exception when others then
    raise warning 'Erro ao criar empresa Solo: %', SQLERRM;
    return new;
  end;

  -- Criar perfil do usuário
  begin
    insert into perfis (user_id, empresa_id, nome, role)
    values (
      new.id,
      nova_empresa_id,
      user_name,
      'owner'
    );

    raise notice 'Perfil criado para user_id=%', new.id;
  exception when others then
    raise warning 'Erro ao criar perfil: %', SQLERRM;
    return new;
  end;

  -- Criar cota inicial
  begin
    insert into solo_cotas (empresa_id, ano_mes, vendas_mes)
    values (
      nova_empresa_id,
      to_char(now(), 'YYYY-MM'),
      0
    )
    on conflict (empresa_id, ano_mes) do nothing;

    raise notice 'Cota criada para empresa_id=%', nova_empresa_id;
  exception when others then
    raise warning 'Erro ao criar cota: %', SQLERRM;
    -- Não retornar aqui, cota não é crítica
  end;

  return new;
exception when others then
  raise warning 'Erro geral no trigger auto_create_solo_empresa: %', SQLERRM;
  return new;
end;
$$ language plpgsql security definer;

-- Função melhorada para verificar se deve criar Solo
create or replace function should_auto_create_solo()
returns trigger as $$
declare
  account_type_value text;
begin
  account_type_value := new.raw_user_meta_data->>'account_type';
  
  -- Log para debug
  raise notice 'Should auto-create check: user_id=%, email_confirmed=%, account_type=%', 
    new.id, new.email_confirmed_at is not null, account_type_value;

  -- Só criar automaticamente se:
  -- 1. Usuário confirmou email OU confirmação está desabilitada
  -- 2. Não tem metadata indicando que é empresa normal ou admin
  if (new.email_confirmed_at is not null or new.confirmation_sent_at is null) and
     (account_type_value is null or account_type_value = 'solo') then
    perform auto_create_solo_empresa();
  else
    raise notice 'Não criando empresa Solo automaticamente';
  end if;
  
  return new;
exception when others then
  raise warning 'Erro no trigger should_auto_create_solo: %', SQLERRM;
  return new;
end;
$$ language plpgsql security definer;

-- Recriar triggers
drop trigger if exists on_auth_user_created_auto_solo on auth.users;
create trigger on_auth_user_created_auto_solo
  after insert on auth.users
  for each row
  execute function should_auto_create_solo();

drop trigger if exists on_auth_user_confirmed_auto_solo on auth.users;
create trigger on_auth_user_confirmed_auto_solo
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function should_auto_create_solo();

-- Comentários
comment on function auto_create_solo_empresa is 'Cria automaticamente empresa Solo, perfil e cota para novos usuários (com tratamento de erros)';
comment on function should_auto_create_solo is 'Verifica se deve criar empresa Solo automaticamente (com logs)';

-- Migration: Criar conta de admin pura (sem empresa/perfil)
-- Admin não precisa de empresa, vai direto para /admin

-- Modificar trigger para NÃO criar empresa Solo se for admin
create or replace function should_auto_create_solo()
returns trigger as $$
begin
  -- NÃO criar empresa Solo se:
  -- 1. Usuário já é admin
  -- 2. Metadata indica que é admin
  if exists (select 1 from admins where user_id = new.id) or
     new.raw_user_meta_data->>'account_type' = 'admin' then
    return new;
  end if;

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

-- Função para criar admin direto (sem empresa)
create or replace function create_admin_account(
  admin_email text,
  admin_name text,
  is_super_admin boolean default true
)
returns uuid as $$
declare
  user_id uuid;
begin
  -- Buscar user_id pelo email
  select id into user_id
  from auth.users
  where email = admin_email;

  if user_id is null then
    raise exception 'Usuário com email % não encontrado', admin_email;
  end if;

  -- Inserir como admin
  insert into admins (user_id, nome, email, super_admin)
  values (user_id, admin_name, admin_email, is_super_admin)
  on conflict (user_id) do update
  set nome = admin_name,
      super_admin = is_super_admin;

  return user_id;
end;
$$ language plpgsql security definer;

-- Comentários
comment on function create_admin_account is 'Cria conta de admin pura sem empresa/perfil';

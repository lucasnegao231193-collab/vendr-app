-- Migration: Sistema de Administração
-- Tabela para controlar quem é admin

-- Tabela de administradores
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  nome text not null,
  email text not null,
  super_admin boolean default false,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Índices
create index idx_admins_user_id on admins(user_id);
create index idx_admins_email on admins(email);

-- Trigger para atualizar updated_at
create or replace function update_admins_updated_at()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger admins_updated_at
  before update on admins
  for each row
  execute function update_admins_updated_at();

-- RLS
alter table admins enable row level security;

-- Apenas admins podem ver a tabela de admins
create policy "admins_can_view_admins" 
  on admins for select 
  using (
    exists (
      select 1 from admins 
      where user_id = auth.uid()
    )
  );

-- Apenas super admins podem criar novos admins
create policy "super_admins_can_create_admins" 
  on admins for insert 
  with check (
    exists (
      select 1 from admins 
      where user_id = auth.uid() and super_admin = true
    )
  );

-- Função helper para verificar se é admin
create or replace function is_admin(user_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from admins where user_id = user_uuid
  );
end;
$$ language plpgsql security definer;

-- Função helper para verificar se é super admin
create or replace function is_super_admin(user_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from admins where user_id = user_uuid and super_admin = true
  );
end;
$$ language plpgsql security definer;

-- View para estatísticas gerais (apenas para admins)
create or replace view admin_stats as
select
  (select count(*) from auth.users) as total_usuarios,
  (select count(*) from empresas) as total_empresas,
  (select count(*) from empresas where is_solo = true) as total_solos,
  (select count(*) from empresas where is_solo = false) as total_empresas_normais,
  (select count(*) from perfis where role = 'vendedor') as total_vendedores,
  (select count(*) from catalogo_estabelecimentos) as total_estabelecimentos,
  (select count(*) from catalogo_estabelecimentos where aprovado = true) as estabelecimentos_aprovados,
  (select count(*) from catalogo_estabelecimentos where aprovado = false) as estabelecimentos_pendentes,
  (select count(*) from catalogo_avaliacoes) as total_avaliacoes;

-- Comentários
comment on table admins is 'Tabela de administradores da plataforma';
comment on column admins.super_admin is 'Super admins podem criar outros admins';
comment on function is_admin is 'Verifica se um usuário é admin';
comment on function is_super_admin is 'Verifica se um usuário é super admin';

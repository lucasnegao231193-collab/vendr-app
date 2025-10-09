-- ============================================
-- VENDR - Schema SQL Completo + RLS
-- Execute no SQL Editor do Supabase
-- ============================================

-- Habilitar extensões necessárias
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ============================================
-- TABELAS
-- ============================================

-- EMPRESAS: cada owner tem uma empresa
create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  nome text not null,
  cnpj_cpf text,
  chave_pix text,
  created_at timestamptz default now()
);

-- PERFIS: vincula user_id (auth.users) à empresa e role
create table if not exists public.perfis (
  user_id uuid primary key references auth.users(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  role text check (role in ('owner','seller')) not null default 'owner',
  created_at timestamptz default now()
);

-- VENDEDORES: vendedores da empresa
create table if not exists public.vendedores (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome text not null,
  telefone text,
  doc text,
  comissao_padrao numeric default 0.1 check (comissao_padrao >= 0 and comissao_padrao <= 1),
  ativo boolean default true,
  created_at timestamptz default now()
);

-- PRODUTOS: produtos disponíveis
create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome text not null,
  preco numeric not null check (preco >= 0),
  unidade text default 'un',
  ativo boolean default true,
  created_at timestamptz default now()
);

-- KITS: atribuição diária de produtos aos vendedores
create table if not exists public.kits (
  id uuid primary key default gen_random_uuid(),
  vendedor_id uuid not null references public.vendedores(id) on delete cascade,
  data date not null,
  comissao_percent numeric default 0.1 check (comissao_percent >= 0 and comissao_percent <= 1),
  created_at timestamptz default now(),
  unique(vendedor_id, data) -- um kit por vendedor por dia
);

-- KIT_ITENS: itens do kit
create table if not exists public.kit_itens (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid not null references public.kits(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete restrict,
  qtd_atribuida int not null check (qtd_atribuida >= 0)
);

-- VENDAS: registro de vendas
create table if not exists public.vendas (
  id uuid primary key default gen_random_uuid(),
  vendedor_id uuid not null references public.vendedores(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete restrict,
  qtd int not null check (qtd > 0),
  valor_unit numeric not null check (valor_unit >= 0),
  meio_pagamento text check (meio_pagamento in ('pix','cartao','dinheiro')),
  data_hora timestamptz default now(),
  status text default 'confirmado' check (status in ('pendente','confirmado','cancelado')),
  empresa_id uuid not null,
  created_at timestamptz default now()
);

-- FECHAMENTOS: fechamento do dia por vendedor
create table if not exists public.fechamentos (
  id uuid primary key default gen_random_uuid(),
  vendedor_id uuid not null references public.vendedores(id) on delete cascade,
  data date not null,
  total numeric not null default 0 check (total >= 0),
  total_pix numeric default 0 check (total_pix >= 0),
  total_cartao numeric default 0 check (total_cartao >= 0),
  total_dinheiro numeric default 0 check (total_dinheiro >= 0),
  comissao_calculada numeric default 0 check (comissao_calculada >= 0),
  conferido boolean default false,
  empresa_id uuid not null,
  created_at timestamptz default now(),
  unique(vendedor_id, data) -- um fechamento por vendedor por dia
);

-- ============================================
-- VIEWS
-- ============================================

-- VIEW: agregação de vendas por dia e produto
create or replace view public.vw_vendas_dia_produto as
select 
  date_trunc('day', data_hora)::date as dia,
  produto_id,
  empresa_id,
  sum(qtd) as qtd_total,
  sum(qtd * valor_unit) as valor_total
from public.vendas
where status = 'confirmado'
group by 1, 2, 3;

-- ============================================
-- FUNÇÕES HELPERS
-- ============================================

-- Função: retorna empresa_id do usuário logado
create or replace function public.empresa_id_for_user(u uuid)
returns uuid
language sql
stable
security definer
as $$
  select empresa_id from public.perfis where user_id = u;
$$;

-- Função: retorna role do usuário logado
create or replace function public.role_for_user(u uuid)
returns text
language sql
stable
security definer
as $$
  select role from public.perfis where user_id = u;
$$;

-- ============================================
-- HABILITAR RLS
-- ============================================

alter table public.empresas enable row level security;
alter table public.perfis enable row level security;
alter table public.vendedores enable row level security;
alter table public.produtos enable row level security;
alter table public.kits enable row level security;
alter table public.kit_itens enable row level security;
alter table public.vendas enable row level security;
alter table public.fechamentos enable row level security;

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- EMPRESAS
drop policy if exists "Usuário vê apenas sua empresa" on public.empresas;
create policy "Usuário vê apenas sua empresa"
  on public.empresas for select
  using ( id = public.empresa_id_for_user(auth.uid()) );

drop policy if exists "Owner pode inserir empresa" on public.empresas;
create policy "Owner pode inserir empresa"
  on public.empresas for insert
  with check ( owner_id = auth.uid() );

drop policy if exists "Owner pode atualizar sua empresa" on public.empresas;
create policy "Owner pode atualizar sua empresa"
  on public.empresas for update
  using ( id = public.empresa_id_for_user(auth.uid()) );

-- PERFIS
drop policy if exists "Usuário vê apenas seu perfil" on public.perfis;
create policy "Usuário vê apenas seu perfil"
  on public.perfis for select
  using ( user_id = auth.uid() );

drop policy if exists "Usuário pode inserir seu perfil" on public.perfis;
create policy "Usuário pode inserir seu perfil"
  on public.perfis for insert
  with check ( user_id = auth.uid() );

drop policy if exists "Usuário pode atualizar seu perfil" on public.perfis;
create policy "Usuário pode atualizar seu perfil"
  on public.perfis for update
  using ( user_id = auth.uid() );

-- VENDEDORES
drop policy if exists "Usuário vê vendedores da sua empresa" on public.vendedores;
create policy "Usuário vê vendedores da sua empresa"
  on public.vendedores for select
  using ( empresa_id = public.empresa_id_for_user(auth.uid()) );

drop policy if exists "Owner pode inserir vendedores" on public.vendedores;
create policy "Owner pode inserir vendedores"
  on public.vendedores for insert
  with check ( empresa_id = public.empresa_id_for_user(auth.uid()) );

drop policy if exists "Owner pode atualizar vendedores" on public.vendedores;
create policy "Owner pode atualizar vendedores"
  on public.vendedores for update
  using ( empresa_id = public.empresa_id_for_user(auth.uid()) );

drop policy if exists "Owner pode deletar vendedores" on public.vendedores;
create policy "Owner pode deletar vendedores"
  on public.vendedores for delete
  using ( empresa_id = public.empresa_id_for_user(auth.uid()) );

-- PRODUTOS
drop policy if exists "Usuário vê produtos da sua empresa" on public.produtos;
create policy "Usuário vê produtos da sua empresa"
  on public.produtos for select
  using ( empresa_id = public.empresa_id_for_user(auth.uid()) );

drop policy if exists "Owner pode inserir produtos" on public.produtos;
create policy "Owner pode inserir produtos"
  on public.produtos for insert
  with check ( empresa_id = public.empresa_id_for_user(auth.uid()) );

drop policy if exists "Owner pode atualizar produtos" on public.produtos;
create policy "Owner pode atualizar produtos"
  on public.produtos for update
  using ( empresa_id = public.empresa_id_for_user(auth.uid()) );

drop policy if exists "Owner pode deletar produtos" on public.produtos;
create policy "Owner pode deletar produtos"
  on public.produtos for delete
  using ( empresa_id = public.empresa_id_for_user(auth.uid()) );

-- KITS
drop policy if exists "Usuário vê kits da sua empresa" on public.kits;
create policy "Usuário vê kits da sua empresa"
  on public.kits for select
  using (
    vendedor_id in (
      select id from public.vendedores 
      where empresa_id = public.empresa_id_for_user(auth.uid())
    )
  );

drop policy if exists "Owner pode inserir kits" on public.kits;
create policy "Owner pode inserir kits"
  on public.kits for insert
  with check (
    vendedor_id in (
      select id from public.vendedores 
      where empresa_id = public.empresa_id_for_user(auth.uid())
    )
  );

drop policy if exists "Owner pode atualizar kits" on public.kits;
create policy "Owner pode atualizar kits"
  on public.kits for update
  using (
    vendedor_id in (
      select id from public.vendedores 
      where empresa_id = public.empresa_id_for_user(auth.uid())
    )
  );

-- KIT_ITENS
drop policy if exists "Usuário vê itens de kits da sua empresa" on public.kit_itens;
create policy "Usuário vê itens de kits da sua empresa"
  on public.kit_itens for select
  using (
    kit_id in (
      select k.id from public.kits k
      inner join public.vendedores v on v.id = k.vendedor_id
      where v.empresa_id = public.empresa_id_for_user(auth.uid())
    )
  );

drop policy if exists "Owner pode inserir kit_itens" on public.kit_itens;
create policy "Owner pode inserir kit_itens"
  on public.kit_itens for insert
  with check (
    kit_id in (
      select k.id from public.kits k
      inner join public.vendedores v on v.id = k.vendedor_id
      where v.empresa_id = public.empresa_id_for_user(auth.uid())
    )
  );

drop policy if exists "Owner pode atualizar kit_itens" on public.kit_itens;
create policy "Owner pode atualizar kit_itens"
  on public.kit_itens for update
  using (
    kit_id in (
      select k.id from public.kits k
      inner join public.vendedores v on v.id = k.vendedor_id
      where v.empresa_id = public.empresa_id_for_user(auth.uid())
    )
  );

-- VENDAS
drop policy if exists "Usuário vê vendas da sua empresa" on public.vendas;
create policy "Usuário vê vendas da sua empresa"
  on public.vendas for select
  using ( empresa_id = public.empresa_id_for_user(auth.uid()) );

drop policy if exists "Usuário pode inserir vendas da sua empresa" on public.vendas;
create policy "Usuário pode inserir vendas da sua empresa"
  on public.vendas for insert
  with check ( empresa_id = public.empresa_id_for_user(auth.uid()) );

drop policy if exists "Usuário pode atualizar vendas da sua empresa" on public.vendas;
create policy "Usuário pode atualizar vendas da sua empresa"
  on public.vendas for update
  using ( empresa_id = public.empresa_id_for_user(auth.uid()) );

-- FECHAMENTOS
drop policy if exists "Usuário vê fechamentos da sua empresa" on public.fechamentos;
create policy "Usuário vê fechamentos da sua empresa"
  on public.fechamentos for select
  using ( empresa_id = public.empresa_id_for_user(auth.uid()) );

drop policy if exists "Usuário pode inserir fechamentos" on public.fechamentos;
create policy "Usuário pode inserir fechamentos"
  on public.fechamentos for insert
  with check ( empresa_id = public.empresa_id_for_user(auth.uid()) );

drop policy if exists "Owner pode atualizar fechamentos" on public.fechamentos;
create policy "Owner pode atualizar fechamentos"
  on public.fechamentos for update
  using ( empresa_id = public.empresa_id_for_user(auth.uid()) );

-- ============================================
-- ÍNDICES para performance
-- ============================================

create index if not exists idx_perfis_user_id on public.perfis(user_id);
create index if not exists idx_perfis_empresa_id on public.perfis(empresa_id);
create index if not exists idx_vendedores_empresa_id on public.vendedores(empresa_id);
create index if not exists idx_produtos_empresa_id on public.produtos(empresa_id);
create index if not exists idx_kits_vendedor_id on public.kits(vendedor_id);
create index if not exists idx_kits_data on public.kits(data);
create index if not exists idx_kit_itens_kit_id on public.kit_itens(kit_id);
create index if not exists idx_vendas_vendedor_id on public.vendas(vendedor_id);
create index if not exists idx_vendas_empresa_id on public.vendas(empresa_id);
create index if not exists idx_vendas_data_hora on public.vendas(data_hora);
create index if not exists idx_fechamentos_vendedor_id on public.fechamentos(vendedor_id);
create index if not exists idx_fechamentos_empresa_id on public.fechamentos(empresa_id);
create index if not exists idx_fechamentos_data on public.fechamentos(data);

-- ============================================
-- REALTIME: habilitar subscriptions
-- ============================================

-- Publicar alterações em vendas para dashboard em tempo real
alter publication supabase_realtime add table public.vendas;
alter publication supabase_realtime add table public.fechamentos;

-- ============================================
-- SEEDS (Opcional - para teste)
-- ============================================

-- Este bloco pode ser executado separadamente após criar o primeiro usuário

-- Exemplo:
-- 1. Crie um usuário no Supabase Auth (email: admin@vendr.com)
-- 2. Copie o UUID do usuário
-- 3. Execute o bloco abaixo substituindo 'SEU-USER-UUID-AQUI'

/*
-- Criar empresa demo
insert into public.empresas (id, owner_id, nome, cnpj_cpf, chave_pix)
values (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  'SEU-USER-UUID-AQUI',
  'Vendr Demo LTDA',
  '12.345.678/0001-90',
  'vendrdemo@pix.com'
);

-- Criar perfil do owner
insert into public.perfis (user_id, empresa_id, role)
values (
  'SEU-USER-UUID-AQUI',
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  'owner'
);

-- Criar vendedores
insert into public.vendedores (id, empresa_id, nome, telefone, comissao_padrao, ativo)
values 
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'João Silva', '11987654321', 0.10, true),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Maria Santos', '11987654322', 0.12, true);

-- Criar produtos
insert into public.produtos (id, empresa_id, nome, preco, unidade, ativo)
values 
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Picolé', 6.00, 'un', true),
  ('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Água Mineral', 4.00, 'un', true),
  ('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Refrigerante', 7.00, 'un', true);

-- Criar kit para hoje
insert into public.kits (id, vendedor_id, data, comissao_percent)
values 
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', current_date, 0.10),
  ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', current_date, 0.12);

-- Adicionar itens aos kits
insert into public.kit_itens (kit_id, produto_id, qtd_atribuida)
values 
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 50),
  ('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 30),
  ('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 40),
  ('77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', 25);

-- Criar vendas de exemplo
insert into public.vendas (vendedor_id, produto_id, qtd, valor_unit, meio_pagamento, empresa_id)
values 
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 5, 6.00, 'pix', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 3, 4.00, 'dinheiro', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'),
  ('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 4, 7.00, 'cartao', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
*/

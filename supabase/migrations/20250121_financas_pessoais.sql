-- Migration: Finanças Pessoais
-- Adiciona suporte para modo Pessoal no Painel Venlo

-- Tabela de transações pessoais
create table if not exists financas_pessoais (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  tipo text not null check (tipo in ('entrada','saida')),
  categoria text not null,
  descricao text,
  valor numeric(12,2) not null check (valor >= 0),
  data date not null default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de metas mensais
create table if not exists metas_pessoais (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  ano int not null,
  mes int not null check (mes between 1 and 12),
  meta_economia numeric(12,2) not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, ano, mes)
);

-- Índices para performance
create index if not exists idx_financas_pessoais_user_id on financas_pessoais(user_id);
create index if not exists idx_financas_pessoais_data on financas_pessoais(data desc);
create index if not exists idx_financas_pessoais_tipo on financas_pessoais(tipo);
create index if not exists idx_metas_pessoais_user_id on metas_pessoais(user_id);
create index if not exists idx_metas_pessoais_ano_mes on metas_pessoais(ano, mes);

-- Habilitar RLS
alter table financas_pessoais enable row level security;
alter table metas_pessoais enable row level security;

-- Políticas RLS para financas_pessoais
create policy "Usuários podem ver suas próprias finanças"
  on financas_pessoais for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias finanças"
  on financas_pessoais for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias finanças"
  on financas_pessoais for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias finanças"
  on financas_pessoais for delete
  using (auth.uid() = user_id);

-- Políticas RLS para metas_pessoais
create policy "Usuários podem ver suas próprias metas"
  on metas_pessoais for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias metas"
  on metas_pessoais for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias metas"
  on metas_pessoais for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias metas"
  on metas_pessoais for delete
  using (auth.uid() = user_id);

-- Trigger para atualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_financas_pessoais_updated_at
  before update on financas_pessoais
  for each row
  execute function update_updated_at_column();

create trigger update_metas_pessoais_updated_at
  before update on metas_pessoais
  for each row
  execute function update_updated_at_column();

-- Comentários
comment on table financas_pessoais is 'Transações financeiras pessoais dos usuários';
comment on table metas_pessoais is 'Metas de economia mensal dos usuários';
comment on column financas_pessoais.tipo is 'Tipo da transação: entrada ou saida';
comment on column financas_pessoais.categoria is 'Categoria da transação (ex: Alimentação, Transporte, Salário)';
comment on column metas_pessoais.meta_economia is 'Valor da meta de economia para o mês';

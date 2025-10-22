-- Migration: Catálogo Venlo Conecta
-- Módulo de catálogo público para empresas, autônomos e estabelecimentos

-- Tabela de estabelecimentos
create table if not exists catalogo_estabelecimentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  nome text not null,
  categoria text not null,
  descricao text,
  telefone text,
  whatsapp text,
  email text,
  endereco text,
  cidade text,
  estado text,
  site text,
  instagram text,
  imagens text[] default '{}',
  aprovado boolean default false,
  destaque boolean default false,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Tabela de avaliações
create table if not exists catalogo_avaliacoes (
  id uuid primary key default gen_random_uuid(),
  estabelecimento_id uuid references catalogo_estabelecimentos(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  nota int not null check (nota between 1 and 5),
  comentario text,
  criado_em timestamptz default now()
);

-- Índices para performance
create index if not exists idx_catalogo_estabelecimentos_user_id on catalogo_estabelecimentos(user_id);
create index if not exists idx_catalogo_estabelecimentos_categoria on catalogo_estabelecimentos(categoria);
create index if not exists idx_catalogo_estabelecimentos_cidade on catalogo_estabelecimentos(cidade);
create index if not exists idx_catalogo_estabelecimentos_aprovado on catalogo_estabelecimentos(aprovado);
create index if not exists idx_catalogo_estabelecimentos_destaque on catalogo_estabelecimentos(destaque);
create index if not exists idx_catalogo_avaliacoes_estabelecimento_id on catalogo_avaliacoes(estabelecimento_id);
create index if not exists idx_catalogo_avaliacoes_user_id on catalogo_avaliacoes(user_id);

-- Trigger para atualizar updated_at
create or replace function update_catalogo_estabelecimentos_updated_at()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger catalogo_estabelecimentos_updated_at
  before update on catalogo_estabelecimentos
  for each row
  execute function update_catalogo_estabelecimentos_updated_at();

-- Row Level Security
alter table catalogo_estabelecimentos enable row level security;
alter table catalogo_avaliacoes enable row level security;

-- Políticas para estabelecimentos
-- Todos podem visualizar estabelecimentos aprovados
create policy "view_approved_estabelecimentos" 
  on catalogo_estabelecimentos for select 
  using (aprovado = true or auth.uid() = user_id);

-- Usuários autenticados podem criar
create policy "create_own_estabelecimento" 
  on catalogo_estabelecimentos for insert 
  with check (auth.uid() = user_id);

-- Usuários podem editar seus próprios estabelecimentos
create policy "update_own_estabelecimento" 
  on catalogo_estabelecimentos for update 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Usuários podem deletar seus próprios estabelecimentos
create policy "delete_own_estabelecimento" 
  on catalogo_estabelecimentos for delete 
  using (auth.uid() = user_id);

-- Políticas para avaliações
-- Todos podem visualizar avaliações
create policy "view_all_avaliacoes" 
  on catalogo_avaliacoes for select 
  using (true);

-- Usuários autenticados podem criar avaliações
create policy "create_own_avaliacao" 
  on catalogo_avaliacoes for insert 
  with check (auth.uid() = user_id);

-- Usuários podem editar suas próprias avaliações
create policy "update_own_avaliacao" 
  on catalogo_avaliacoes for update 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Usuários podem deletar suas próprias avaliações
create policy "delete_own_avaliacao" 
  on catalogo_avaliacoes for delete 
  using (auth.uid() = user_id);

-- View para estatísticas de estabelecimentos
create or replace view catalogo_estabelecimentos_stats as
select 
  e.id,
  e.nome,
  e.categoria,
  e.cidade,
  e.estado,
  e.destaque,
  count(a.id) as total_avaliacoes,
  coalesce(avg(a.nota), 0) as nota_media
from catalogo_estabelecimentos e
left join catalogo_avaliacoes a on a.estabelecimento_id = e.id
where e.aprovado = true
group by e.id, e.nome, e.categoria, e.cidade, e.estado, e.destaque;

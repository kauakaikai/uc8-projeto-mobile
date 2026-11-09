create table public.pets (
  id bigint generated always as identity primary key,
  nome text not null,
  especie text not null check (especie in ('cachorro', 'gato', 'ave', 'outro')),
  raca text,
  cliente_id integer not null default 1,
  criado_em timestamptz not null default now()
);

alter table public.pets enable row level security;

create policy "leitura anonima" on public.pets for select to anon using (true);
create policy "inclusao anonima" on public.pets for insert to anon with check (true);

grant usage on schema public to anon;
grant select, insert on public.pets to anon;
grant usage, select on sequence public.pets_id_seq to anon;

insert into public.pets (nome, especie, raca, cliente_id) values
  ('Rex', 'cachorro', 'Vira-lata', 1),
  ('Mimi', 'gato', null, 2),
  ('Piu', 'ave', 'Calopsita', 1);
-- CellDrop database schema.
-- Run this in the Supabase SQL editor (Project -> SQL editor -> New query).
-- It creates the analyses table and locks it down with Row Level Security so
-- every user can only read and write their own rows.

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  live integer not null,
  dead integer not null,
  viability numeric not null,
  concentration numeric not null,
  dilution_factor numeric not null default 1,
  squares_counted integer not null default 1,
  note text,
  created_at timestamptz not null default now()
);

alter table public.analyses enable row level security;

drop policy if exists "Read own analyses" on public.analyses;
create policy "Read own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

drop policy if exists "Insert own analyses" on public.analyses;
create policy "Insert own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Update own analyses" on public.analyses;
create policy "Update own analyses"
  on public.analyses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Delete own analyses" on public.analyses;
create policy "Delete own analyses"
  on public.analyses for delete
  using (auth.uid() = user_id);

create index if not exists analyses_user_created_idx
  on public.analyses (user_id, created_at desc);

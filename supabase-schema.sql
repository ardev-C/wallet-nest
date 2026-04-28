-- ============================================================
-- WalletNest Supabase Schema
-- Run this ONCE in Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Expenses table
create table if not exists public.expenses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null default '',
  amount     numeric not null,
  category   text not null default 'Other',
  date       date not null default current_date,
  mood       text,
  note       text,
  created_at timestamptz not null default now()
);

alter table public.expenses enable row level security;

create policy "Users manage own expenses"
  on public.expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Goals table
create table if not exists public.goals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  target     numeric not null default 0,
  saved      numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Users manage own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. User settings table (budget + custom categories)
create table if not exists public.user_settings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references auth.users(id) on delete cascade,
  monthly_budget  numeric not null default 0,
  categories      jsonb not null default '[]'::jsonb
);

alter table public.user_settings enable row level security;

create policy "Users manage own settings"
  on public.user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

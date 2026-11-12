-- Picky Eater: saved preferences, one row per user.
-- Run this in Supabase → SQL Editor → New query → Run.
-- Safe to run again: every statement checks whether its change already exists,
-- so it also upgrades a database created by an older version of this file.

create table if not exists public.preferences (
  user_id             uuid primary key references auth.users (id) on delete cascade,
  restrictions        text[]      not null default '{}',
  allergies           text[]      not null default '{}',
  goals               text[]      not null default '{}',  -- ordered: index 1 = top priority
  custom_restrictions text[]      not null default '{}',  -- user-typed "+ Other" diets
  custom_allergies    text[]      not null default '{}',  -- user-typed "+ Other" allergies
  notes               text        not null default '' check (char_length(notes) <= 200),
  updated_at          timestamptz not null default now()
);

-- Upgrade: add the "+ Other" columns to tables created before they existed.
alter table public.preferences add column if not exists custom_restrictions text[] not null default '{}';
alter table public.preferences add column if not exists custom_allergies    text[] not null default '{}';

-- Keep typed entries bounded (the app enforces the same limits).
alter table public.preferences drop constraint if exists custom_entries_bounded;
alter table public.preferences add constraint custom_entries_bounded check (
  coalesce(array_length(custom_restrictions, 1), 0) <= 15
  and coalesce(array_length(custom_allergies, 1), 0) <= 15
);

-- Row Level Security: the browser talks to this table directly with the public
-- key, so these policies are what keep each person's data private.
alter table public.preferences enable row level security;

drop policy if exists "Users read own preferences" on public.preferences;
create policy "Users read own preferences" on public.preferences
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users insert own preferences" on public.preferences;
create policy "Users insert own preferences" on public.preferences
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own preferences" on public.preferences;
create policy "Users update own preferences" on public.preferences
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete own preferences" on public.preferences;
create policy "Users delete own preferences" on public.preferences
  for delete to authenticated using ((select auth.uid()) = user_id);

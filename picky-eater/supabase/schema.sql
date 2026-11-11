-- Picky Eater: saved preferences, one row per user.
-- Run this once in Supabase → SQL Editor → New query → Run.

create table if not exists public.preferences (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  restrictions text[]      not null default '{}',
  allergies    text[]      not null default '{}',
  goals        text[]      not null default '{}',  -- ordered: index 1 = top priority
  notes        text        not null default '' check (char_length(notes) <= 200),
  updated_at   timestamptz not null default now()
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

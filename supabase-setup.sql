-- Ledger: one row per person holding their whole ledger.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to run again.

create table if not exists public.ledger_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- Row Level Security: without this, anyone with the public anon key could
-- read every ledger. With it, each signed-in person sees only their own row.
alter table public.ledger_data enable row level security;

drop policy if exists "read own ledger"   on public.ledger_data;
drop policy if exists "insert own ledger" on public.ledger_data;
drop policy if exists "update own ledger" on public.ledger_data;
drop policy if exists "delete own ledger" on public.ledger_data;

create policy "read own ledger" on public.ledger_data
  for select using ((select auth.uid()) = user_id);

create policy "insert own ledger" on public.ledger_data
  for insert with check ((select auth.uid()) = user_id);

create policy "update own ledger" on public.ledger_data
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "delete own ledger" on public.ledger_data
  for delete using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Account deletion (required by the App Store and Google Play).
-- The app's public key can't delete sign-in accounts, so this function does
-- it on the server. It only ever deletes the account of the person calling
-- it: auth.uid() comes from their own signed-in session, not from anything
-- they send. Their ledger row is removed along with it.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  delete from public.ledger_data where user_id = uid;
  delete from auth.users where id = uid;
end;
$$;

-- signed-in users may call it; anonymous visitors may not
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

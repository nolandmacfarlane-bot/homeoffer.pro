-- HomeOffer.pro backend stabilization.
-- Idempotent: safe to run more than once in the Supabase SQL editor.

create extension if not exists pgcrypto;

alter table public.users add column if not exists email text;
alter table public.users add column if not exists first_name text;
alter table public.users add column if not exists last_name text;
alter table public.users add column if not exists user_type text default 'buyer';
alter table public.users add column if not exists phone_number text;
alter table public.users add column if not exists dre_license_number text;
alter table public.users add column if not exists broker_name text;
alter table public.users add column if not exists broker_dre_number text;
alter table public.users add column if not exists approved boolean default false;
alter table public.users add column if not exists account_status text default 'active';
alter table public.users add column if not exists referred_by_agent_id uuid references public.users(id);
alter table public.users add column if not exists original_sponsor_agent_id uuid references public.users(id);

create or replace function public.is_homeoffer_owner(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from auth.users
    where id = p_user_id
      and lower(email) = 'noland.macfarlane@gmail.com'
  );
$$;

create or replace function public.ensure_user_profile()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_auth auth.users;
  v_first text;
  v_last text;
  v_profile public.users;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into v_auth from auth.users where id = auth.uid();
  v_first := coalesce(v_auth.raw_user_meta_data->>'first_name', split_part(coalesce(v_auth.raw_user_meta_data->>'full_name', v_auth.raw_user_meta_data->>'name', v_auth.email, 'User'), ' ', 1));
  v_last := coalesce(v_auth.raw_user_meta_data->>'last_name', nullif(regexp_replace(coalesce(v_auth.raw_user_meta_data->>'full_name', v_auth.raw_user_meta_data->>'name', ''), '^\S+\s*', ''), ''));

  insert into public.users (id, email, first_name, last_name, user_type, approved, account_status)
  values (
    v_auth.id, v_auth.email, v_first, v_last,
    case when lower(v_auth.email) = 'noland.macfarlane@gmail.com' then 'agent' else coalesce(v_auth.raw_user_meta_data->>'user_type', 'buyer') end,
    lower(v_auth.email) = 'noland.macfarlane@gmail.com', 'active'
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = coalesce(public.users.first_name, excluded.first_name),
    last_name = coalesce(public.users.last_name, excluded.last_name),
    user_type = case when lower(excluded.email) = 'noland.macfarlane@gmail.com' then 'agent' else public.users.user_type end,
    approved = public.users.approved or lower(excluded.email) = 'noland.macfarlane@gmail.com',
    account_status = case when lower(excluded.email) = 'noland.macfarlane@gmail.com' then 'active' else public.users.account_status end
  returning * into v_profile;

  return jsonb_build_object('id', v_profile.id, 'user_type', v_profile.user_type, 'account_status', v_profile.account_status);
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.users (id, email, first_name, last_name, user_type, approved, account_status)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email, 'User'), ' ', 1)),
    coalesce(new.raw_user_meta_data->>'last_name', nullif(regexp_replace(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), '^\S+\s*', ''), '')),
    case when lower(new.email) = 'noland.macfarlane@gmail.com' then 'agent' else coalesce(new.raw_user_meta_data->>'user_type', 'buyer') end,
    lower(new.email) = 'noland.macfarlane@gmail.com', 'active'
  ) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_auth_user();

create table if not exists public.listing_drafts (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(agent_id)
);
alter table public.listing_drafts enable row level security;
drop policy if exists listing_drafts_own on public.listing_drafts;
create policy listing_drafts_own on public.listing_drafts for all to authenticated
using (agent_id = auth.uid()) with check (agent_id = auth.uid());

create table if not exists public.card_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  stripe_checkout_session_id text not null unique,
  stripe_customer_id text,
  verified_at timestamptz not null default now(),
  unique(user_id, property_id)
);
alter table public.card_verifications enable row level security;
drop policy if exists card_verifications_read_own on public.card_verifications;
create policy card_verifications_read_own on public.card_verifications for select to authenticated using (user_id = auth.uid());

create unique index if not exists agent_approvals_property_buyer_uidx
  on public.agent_approvals(property_id, buyer_id);

create or replace function public.search_agent_sponsors(p_search text)
returns table(id uuid, first_name text, last_name text, phone_number text, dre_license_number text)
language sql
stable
security definer
set search_path = public
as $$
  select u.id, u.first_name, u.last_name, u.phone_number, u.dre_license_number
  from public.users u
  where u.id <> auth.uid()
    and u.user_type = 'agent'
    and coalesce(u.account_status, 'active') = 'active'
    and concat_ws(' ', u.first_name, u.last_name) ilike '%' || trim(p_search) || '%'
  order by u.last_name, u.first_name
  limit 12;
$$;

create or replace function public.select_agent_sponsor(p_sponsor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_existing uuid; v_cursor uuid := p_sponsor_id; v_next uuid; v_steps integer := 0;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_sponsor_id = auth.uid() then raise exception 'You cannot sponsor yourself'; end if;
  select referred_by_agent_id into v_existing from public.users where id = auth.uid() for update;
  if v_existing is not null then raise exception 'Sponsor selection is permanent'; end if;
  if not exists (select 1 from public.users where id = p_sponsor_id and user_type = 'agent' and coalesce(account_status, 'active') = 'active') then
    raise exception 'Sponsor is not eligible';
  end if;
  while v_cursor is not null and v_steps < 100 loop
    if v_cursor = auth.uid() then raise exception 'This sponsor would create an organization cycle'; end if;
    select referred_by_agent_id into v_next from public.users where id = v_cursor;
    v_cursor := v_next; v_steps := v_steps + 1;
  end loop;
  update public.users set referred_by_agent_id = p_sponsor_id, original_sponsor_agent_id = p_sponsor_id where id = auth.uid();
end;
$$;

grant execute on function public.ensure_user_profile() to authenticated;
grant execute on function public.search_agent_sponsors(text) to authenticated;
grant execute on function public.select_agent_sponsor(uuid) to authenticated;

-- The owner account is permanently active and never billed.
do $$
declare v_owner uuid;
begin
  select id into v_owner from auth.users where lower(email) = 'noland.macfarlane@gmail.com' limit 1;
  if v_owner is not null and to_regclass('public.agent_memberships') is not null then
    execute $sql$
      insert into public.agent_memberships (user_id, status, current_period_end)
      values ($1, 'active', 'infinity'::timestamptz)
      on conflict (user_id) do update
      set status = 'active', current_period_end = 'infinity'::timestamptz, delinquent_since = null
    $sql$ using v_owner;
  end if;
end $$;

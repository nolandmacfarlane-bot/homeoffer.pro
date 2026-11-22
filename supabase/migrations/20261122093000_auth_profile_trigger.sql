-- Create public profiles inside the database so email-confirmation signups
-- never depend on having an authenticated browser session.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  profile_user_type text;
  profile_first_name text;
  profile_last_name text;
  profile_sms_opt_in boolean;
begin
  if new.email is null then
    return new;
  end if;

  profile_user_type := case
    when metadata->>'user_type' in ('buyer', 'seller', 'agent') then metadata->>'user_type'
    else 'buyer'
  end;

  profile_first_name := nullif(trim(coalesce(
    metadata->>'first_name',
    split_part(metadata->>'full_name', ' ', 1)
  )), '');

  profile_last_name := nullif(trim(coalesce(
    metadata->>'last_name',
    case
      when position(' ' in coalesce(metadata->>'full_name', '')) > 0
      then substr(metadata->>'full_name', position(' ' in metadata->>'full_name') + 1)
      else null
    end
  )), '');

  profile_sms_opt_in := lower(coalesce(metadata->>'sms_opt_in', 'false'))
    in ('true', '1', 'yes', 'on');

  insert into public.users (
    id,
    email,
    first_name,
    last_name,
    user_type,
    phone_number,
    dre_license_number,
    broker_name,
    broker_dre_number,
    sms_opt_in
  )
  values (
    new.id,
    new.email,
    profile_first_name,
    profile_last_name,
    profile_user_type,
    nullif(metadata->>'phone_number', ''),
    nullif(metadata->>'dre_license_number', ''),
    nullif(metadata->>'broker_name', ''),
    nullif(metadata->>'broker_dre_number', ''),
    profile_sms_opt_in
  )
  on conflict do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function private.handle_new_auth_user();

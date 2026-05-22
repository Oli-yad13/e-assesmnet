-- Migration: OAuth users must complete profile before reaching the dashboard.
-- Run once in the Supabase SQL editor. Idempotent.

-- New trigger logic: only auto-fill full_name when the user signed up via
-- email/password (which collects the name in the signup form). For Google
-- (and any other OAuth provider) leave full_name NULL so the app can route
-- the user through /complete-profile.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    case
      when new.raw_app_meta_data->>'provider' = 'email'
        then nullif(trim(new.raw_user_meta_data->>'full_name'), '')
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end $$;

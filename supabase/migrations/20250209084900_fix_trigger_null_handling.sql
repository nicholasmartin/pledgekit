-- Must be run with authenticator role for auth schema access
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
declare
  first_name text;
  last_name text;
  display_name text;
begin
  -- Safely extract first and last name
  first_name := COALESCE(new.raw_user_meta_data->>'first_name', '');
  last_name := COALESCE(new.raw_user_meta_data->>'last_name', '');
  
  -- Set display name with fallback
  display_name := COALESCE(
    new.raw_user_meta_data->>'display_name',
    NULLIF(TRIM(concat(first_name, ' ', last_name)), ''),
    'User'
  );

  -- Insert with NULL handling
  insert into public.user_profiles (
    id,
    first_name,
    last_name,
    display_name,
    email,
    created_at,
    updated_at
  )
  values (
    new.id,
    first_name,
    last_name,
    display_name,
    COALESCE(new.email, ''),
    now(),
    now()
  );

  return new;
exception when others then
  -- Log the error
  raise warning 'Error in handle_new_user: %', SQLERRM;
  -- Still return new to allow the auth.users insert to succeed
  return new;
end;
$$;

-- Drop if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger for new signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant trigger permissions
GRANT USAGE ON SCHEMA public TO postgres, authenticated, service_role, anon;
GRANT ALL ON public.user_profiles TO postgres, authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, authenticated, service_role, anon;

-- Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (can be restricted later)
CREATE POLICY "Allow all operations on user_profiles"
  ON public.user_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);
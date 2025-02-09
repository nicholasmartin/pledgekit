-- Must be run with authenticator role for auth schema access
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
begin
  insert into public.user_profiles (id, first_name, last_name, display_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    coalesce(
      new.raw_user_meta_data->>'display_name',
      concat(
        new.raw_user_meta_data->>'first_name',
        ' ',
        new.raw_user_meta_data->>'last_name'
      )
    ),
    new.email
  );
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
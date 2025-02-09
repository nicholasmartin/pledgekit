-- Revoke all on auth.users from public
REVOKE ALL ON auth.users FROM public;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function with proper auth schema handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name, display_name, email)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'first_name')::text, ''),
    COALESCE((NEW.raw_user_meta_data->>'last_name')::text, ''),
    COALESCE(
      (NEW.raw_user_meta_data->>'display_name')::text,
      CONCAT(
        COALESCE((NEW.raw_user_meta_data->>'first_name')::text, ''),
        ' ',
        COALESCE((NEW.raw_user_meta_data->>'last_name')::text, '')
      )
    ),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, authenticated, service_role, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated, service_role, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role, anon;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, authenticated, service_role, anon;

-- Allow postgres to create triggers on auth.users
GRANT ALL ON auth.users TO postgres;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for metadata updates
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data OR OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_new_user();
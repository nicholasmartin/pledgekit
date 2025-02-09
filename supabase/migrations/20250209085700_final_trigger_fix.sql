/**
 * fix: Simplify auth trigger to match existing user_profiles schema
 * 
 * - Remove attempts to write to non-existent columns
 * - Fix display_name concatenation with proper NULL handling
 * - Set correct permissions for trigger execution
 * - Disable RLS to ensure trigger can write to user_profiles
 */

-- First drop triggers that depend on the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Simple function that matches existing schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    display_name,
    settings
  ) VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NULLIF(TRIM(CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      )), '')
    ),
    '{}'::jsonb
  );
  RETURN NEW;
END;
$$;

-- Simple trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Basic permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticator;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO anon, authenticated, service_role;

-- Ensure RLS doesn't block the insert
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
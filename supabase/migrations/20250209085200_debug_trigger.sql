-- First drop triggers that depend on the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Simple function with debug logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Debug logs
  RAISE LOG 'handle_new_user() called with id: %, email: %, metadata: %', 
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data;

  INSERT INTO public.user_profiles (
    id,
    email,
    first_name,
    last_name,
    display_name
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'display_name'
  );

  -- Log successful insert
  RAISE LOG 'Successfully created user_profile for id: %', NEW.id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log any errors
  RAISE LOG 'Error in handle_new_user for id %: %', NEW.id, SQLERRM;
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
-- Grant necessary permissions to public role
GRANT USAGE ON SCHEMA public TO public;
GRANT ALL ON public.user_profiles TO public;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;

-- Ensure the function has proper permissions
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER SET search_path = public;
-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate function to handle user profile creation/updates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id,
        first_name,
        last_name,
        display_name,
        email
    )
    VALUES (
        NEW.id,
        (NEW.raw_user_metadata->>'first_name')::text,
        (NEW.raw_user_metadata->>'last_name')::text,
        COALESCE(
            (NEW.raw_user_metadata->>'display_name')::text,
            CONCAT(
                (NEW.raw_user_metadata->>'first_name')::text,
                ' ',
                (NEW.raw_user_metadata->>'last_name')::text
            )
        ),
        NEW.email
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Recreate trigger to update user profile when auth user is updated
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE OF raw_user_metadata, email ON auth.users
    FOR EACH ROW
    WHEN (OLD.raw_user_metadata IS DISTINCT FROM NEW.raw_user_metadata OR OLD.email IS DISTINCT FROM NEW.email)
    EXECUTE FUNCTION public.handle_new_user();
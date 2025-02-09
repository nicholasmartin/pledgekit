-- Function to handle user profile creation/updates
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
        email = EXCLUDED.email;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create trigger to update user profile when auth user is updated
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE OF raw_user_metadata, email ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Handle existing users without profiles
INSERT INTO public.user_profiles (
    id,
    first_name,
    last_name,
    display_name,
    email
)
SELECT
    id,
    (raw_user_metadata->>'first_name')::text as first_name,
    (raw_user_metadata->>'last_name')::text as last_name,
    COALESCE(
        (raw_user_metadata->>'display_name')::text,
        CONCAT(
            (raw_user_metadata->>'first_name')::text,
            ' ',
            (raw_user_metadata->>'last_name')::text
        )
    ) as display_name,
    email
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO UPDATE
SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    email = EXCLUDED.email;
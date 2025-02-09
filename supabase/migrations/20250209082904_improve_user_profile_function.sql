-- Improve handle_new_user function with better error handling and transaction management
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure we have the required data
    IF NEW.raw_user_metadata IS NULL THEN
        RETURN NEW;
    END IF;

    -- Use a transaction for atomicity
    BEGIN
        INSERT INTO public.user_profiles (
            id,
            first_name,
            last_name,
            display_name,
            email,
            updated_at
        )
        VALUES (
            NEW.id,
            COALESCE((NEW.raw_user_metadata->>'first_name')::text, ''),
            COALESCE((NEW.raw_user_metadata->>'last_name')::text, ''),
            COALESCE(
                (NEW.raw_user_metadata->>'display_name')::text,
                CONCAT(
                    COALESCE((NEW.raw_user_metadata->>'first_name')::text, ''),
                    ' ',
                    COALESCE((NEW.raw_user_metadata->>'last_name')::text, '')
                )
            ),
            COALESCE(NEW.email, ''),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            display_name = EXCLUDED.display_name,
            email = EXCLUDED.email,
            updated_at = NOW();

        RETURN NEW;
    EXCEPTION WHEN OTHERS THEN
        -- Log error details to the Postgres log
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        -- Return NEW to allow the auth.users operation to complete
        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
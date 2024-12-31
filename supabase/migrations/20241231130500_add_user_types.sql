-- Migration: Add user types and metadata
-- Description: Implements user type distinction in auth metadata and provides migration for existing users

-- Step 1: Ensure raw_user_metadata exists and is accessible
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS raw_user_metadata jsonb DEFAULT '{}'::jsonb;

-- Step 2: Create policy for users to read their own metadata
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'auth' 
        AND tablename = 'users' 
        AND policyname = 'Users can read own user metadata'
    ) THEN
        CREATE POLICY "Users can read own user metadata" ON auth.users
            FOR SELECT
            USING (auth.uid() = id);
    END IF;
END
$$;

-- Step 3: Create user type management functions
CREATE TYPE public.user_type AS ENUM ('company_member', 'public_user');

CREATE OR REPLACE FUNCTION public.get_user_type(user_id uuid)
RETURNS public.user_type AS $$
DECLARE
    user_type text;
BEGIN
    SELECT raw_user_metadata->>'user_type'
    INTO user_type
    FROM auth.users
    WHERE id = user_id;
    
    RETURN user_type::public.user_type;
EXCEPTION
    WHEN others THEN
        RETURN 'public_user'::public.user_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create migration function for existing users
CREATE OR REPLACE FUNCTION public.set_user_types()
RETURNS void AS $$
BEGIN
    -- Set company members first
    UPDATE auth.users SET raw_user_metadata = 
        COALESCE(raw_user_metadata, '{}'::jsonb) || 
        '{"user_type": "company_member"}'::jsonb
    WHERE id IN (
        SELECT DISTINCT user_id 
        FROM public.company_members
    );

    -- Set remaining users as public users
    UPDATE auth.users SET raw_user_metadata = 
        COALESCE(raw_user_metadata, '{}'::jsonb) || 
        '{"user_type": "public_user"}'::jsonb
    WHERE raw_user_metadata->>'user_type' IS NULL;

    -- Verify no users are left without a type
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE raw_user_metadata->>'user_type' IS NULL
    ) THEN
        RAISE EXCEPTION 'Some users do not have a type assigned';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create rollback function
CREATE OR REPLACE FUNCTION public.rollback_user_types()
RETURNS void AS $$
BEGIN
    UPDATE auth.users SET raw_user_metadata = 
        raw_user_metadata - 'user_type';
END;
$$ LANGUAGE plpgsql;

-- Step 6: Run the migration for existing users
SELECT public.set_user_types();

-- Step 7: Create helper function to set user type
CREATE OR REPLACE FUNCTION public.set_user_type(
    user_id uuid,
    new_type public.user_type
)
RETURNS void AS $$
BEGIN
    UPDATE auth.users 
    SET raw_user_metadata = 
        COALESCE(raw_user_metadata, '{}'::jsonb) || 
        jsonb_build_object('user_type', new_type::text)
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration: Fix user types to use raw_user_meta_data
-- Description: Moves user type to raw_user_meta_data where Supabase stores other metadata

-- Step 1: Move existing user types from raw_user_metadata to raw_user_meta_data
UPDATE auth.users 
SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('user_type', raw_user_metadata->>'user_type')
WHERE raw_user_metadata->>'user_type' IS NOT NULL;

-- Step 2: Remove user_type from raw_user_metadata
UPDATE auth.users 
SET raw_user_metadata = raw_user_metadata - 'user_type'
WHERE raw_user_metadata->>'user_type' IS NOT NULL;

-- Step 3: Update the set_user_types function to use raw_user_meta_data
CREATE OR REPLACE FUNCTION public.set_user_types()
RETURNS void AS $$
BEGIN
    -- Set company members first
    UPDATE auth.users SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        '{"user_type": "company_member"}'::jsonb
    WHERE id IN (
        SELECT DISTINCT user_id 
        FROM public.company_members
    );

    -- Set remaining users as public users
    UPDATE auth.users SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        '{"user_type": "public_user"}'::jsonb
    WHERE raw_user_meta_data->>'user_type' IS NULL;

    -- Verify no users are left without a type
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE raw_user_meta_data->>'user_type' IS NULL
    ) THEN
        RAISE EXCEPTION 'Some users do not have a type assigned';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Update the get_user_type function to use raw_user_meta_data
CREATE OR REPLACE FUNCTION public.get_user_type(user_id uuid)
RETURNS public.user_type AS $$
DECLARE
    user_type text;
BEGIN
    SELECT raw_user_meta_data->>'user_type'
    INTO user_type
    FROM auth.users
    WHERE id = user_id;
    
    RETURN user_type::public.user_type;
EXCEPTION
    WHEN others THEN
        RETURN 'public_user'::public.user_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Update the set_user_type function to use raw_user_meta_data
CREATE OR REPLACE FUNCTION public.set_user_type(
    user_id uuid,
    new_type public.user_type
)
RETURNS void AS $$
BEGIN
    UPDATE auth.users 
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('user_type', new_type::text)
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Run the migration again to ensure all users have types
SELECT public.set_user_types();

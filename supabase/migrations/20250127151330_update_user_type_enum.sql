-- Migration: Update user_type enum values
-- Description: Standardize user type values between database and application code

-- Step 1: Drop dependent functions first
DROP FUNCTION IF EXISTS public.set_user_type(uuid, public.user_type);
DROP FUNCTION IF EXISTS public.get_user_type(uuid);
DROP FUNCTION IF EXISTS public.set_user_types();

-- Step 2: Create new enum type
CREATE TYPE public.user_type_new AS ENUM ('company', 'user');

-- Step 3: Update existing user metadata to use new values
UPDATE auth.users
SET raw_user_metadata = jsonb_set(
  raw_user_metadata,
  '{user_type}',
  to_jsonb(
    CASE (raw_user_metadata->>'user_type')::text
      WHEN 'company_member' THEN 'company'
      WHEN 'public_user' THEN 'user'
      ELSE 'user'  -- Default case
    END
  )
)
WHERE raw_user_metadata->>'user_type' IS NOT NULL;

-- Step 4: Drop old type and rename new type
DROP TYPE public.user_type CASCADE;
ALTER TYPE public.user_type_new RENAME TO user_type;

-- Step 5: Recreate functions with new type
CREATE OR REPLACE FUNCTION public.get_user_type(user_id uuid)
RETURNS public.user_type AS $$
DECLARE
    user_type text;
BEGIN
    SELECT raw_user_metadata->>'user_type'
    INTO user_type
    FROM auth.users
    WHERE id = user_id;
    
    RETURN COALESCE(user_type::public.user_type, 'user'::public.user_type);
EXCEPTION
    WHEN others THEN
        RETURN 'user'::public.user_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

CREATE OR REPLACE FUNCTION public.set_user_types()
RETURNS void AS $$
BEGIN
    -- Set company members
    UPDATE auth.users SET raw_user_metadata = 
        COALESCE(raw_user_metadata, '{}'::jsonb) || 
        '{"user_type": "company"}'::jsonb
    WHERE id IN (
        SELECT DISTINCT user_id 
        FROM public.company_members
    );

    -- Set remaining users as public users
    UPDATE auth.users SET raw_user_metadata = 
        COALESCE(raw_user_metadata, '{}'::jsonb) || 
        '{"user_type": "user"}'::jsonb
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

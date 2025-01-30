-- Step 1: First check if there are any users with multiple companies
DO $$ 
DECLARE 
    duplicate_count integer;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT user_id
        FROM public.company_members
        WHERE user_id IS NOT NULL
        GROUP BY user_id
        HAVING COUNT(*) > 1
    ) duplicates;

    IF duplicate_count > 0 THEN
        RAISE EXCEPTION 'Found % users with multiple company memberships. Please resolve these before adding the unique constraint.', duplicate_count;
    END IF;
END $$;

-- Step 2: Add NOT NULL constraint to user_id if not already present
ALTER TABLE public.company_members 
    ALTER COLUMN user_id SET NOT NULL;

-- Step 3: Add unique constraint to user_id
ALTER TABLE public.company_members
    ADD CONSTRAINT company_members_user_id_key UNIQUE (user_id);

-- Step 4: Add comment explaining the constraint
COMMENT ON CONSTRAINT company_members_user_id_key ON public.company_members IS 
    'Ensures each user can only be a member of one company at a time';

-- Step 5: Update RLS policies to reflect this change
DROP POLICY IF EXISTS "Users can view their own company membership" ON public.company_members;
CREATE POLICY "Users can view their own company membership"
    ON public.company_members
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

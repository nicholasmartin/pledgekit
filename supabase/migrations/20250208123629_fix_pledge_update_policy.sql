-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can update own pending pledges" ON public.pledges;

-- Create a new policy for user updates (still restricted to pending)
CREATE POLICY "Users can update own pending pledges"
    ON public.pledges
    FOR UPDATE
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() = user_id 
        AND status = 'pending'::pledge_status
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() = user_id 
        AND status = 'pending'::pledge_status
    );

-- Add a new policy for service role to bypass RLS
ALTER TABLE public.pledges FORCE ROW LEVEL SECURITY;

-- Grant necessary permissions to service role
GRANT ALL ON public.pledges TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Add comment explaining the policy setup
COMMENT ON TABLE public.pledges IS 'Pledges table with RLS:
- Authenticated users can only update their own pending pledges
- Service role has full access (used by webhooks and admin functions)
- Users can view their own pledges
- Company members can view project pledges';
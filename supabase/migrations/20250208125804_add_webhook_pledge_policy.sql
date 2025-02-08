-- Drop any webhook policies if they exist
DROP POLICY IF EXISTS "Allow status and payment updates" ON public.pledges;
DROP POLICY IF EXISTS "Webhook can update pledge status" ON public.pledges;

-- Drop and recreate the user update policy to be explicit
DROP POLICY IF EXISTS "Users can update own pending pledges" ON public.pledges;

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

-- Add comment explaining the security model
COMMENT ON TABLE public.pledges IS 
'Pledges table with RLS policies:
- Users can only update their own pending pledges
- Service role bypasses RLS for webhook operations
- Users can view their own pledges
- Company members can view project pledges';
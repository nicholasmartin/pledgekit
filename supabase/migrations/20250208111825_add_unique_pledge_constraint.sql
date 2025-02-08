-- Add unique constraint to prevent multiple pledges for same user/project/option
ALTER TABLE public.pledges
ADD CONSTRAINT unique_user_project_pledge
UNIQUE (user_id, project_id, pledge_option_id);

-- Create function to get user's pledges for a project
CREATE OR REPLACE FUNCTION get_user_project_pledges(
  p_user_id UUID,
  p_project_id UUID
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  project_id UUID,
  pledge_option_id UUID,
  amount NUMERIC,
  status pledge_status,
  payment_intent_id TEXT,
  payment_method_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  pledge_option_title TEXT,
  pledge_option_amount NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.project_id,
    p.pledge_option_id,
    p.amount,
    p.status,
    p.payment_intent_id,
    p.payment_method_id,
    p.created_at,
    p.updated_at,
    po.title as pledge_option_title,
    po.amount as pledge_option_amount
  FROM pledges p
  JOIN pledge_options po ON p.pledge_option_id = po.id
  WHERE p.user_id = p_user_id 
  AND p.project_id = p_project_id;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_user_project_pledges TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_project_pledges TO service_role;

-- Add RLS policy for the function
CREATE POLICY "Users can get their own project pledges"
  ON pledges
  FOR SELECT
  USING (
    auth.uid() = user_id
  );
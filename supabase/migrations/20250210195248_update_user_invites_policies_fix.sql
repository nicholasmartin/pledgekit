-- Drop policies from previous migration attempt
DROP POLICY IF EXISTS "Company users can view invites for their company" ON user_invites;
DROP POLICY IF EXISTS "Company users can create invites for their company" ON user_invites;
DROP POLICY IF EXISTS "Company users can delete invites for their company" ON user_invites;

-- Create correct policies that just check company membership
CREATE POLICY "Users can view invites for their company"
ON user_invites FOR SELECT
USING (
  company_id IN (
    SELECT company_id 
    FROM company_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create invites for their company"
ON user_invites FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM company_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete invites for their company"
ON user_invites FOR DELETE
USING (
  company_id IN (
    SELECT company_id 
    FROM company_members 
    WHERE user_id = auth.uid()
  )
);

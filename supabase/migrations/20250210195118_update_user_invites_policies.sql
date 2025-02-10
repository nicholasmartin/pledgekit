-- Drop existing policies
DROP POLICY IF EXISTS "Users can view invites for their company" ON user_invites;
DROP POLICY IF EXISTS "Users can create invites for their company" ON user_invites;
DROP POLICY IF EXISTS "Users can delete invites for their company" ON user_invites;

-- Create new policies with company_user role check
-- Allow company users to view invites for their company
CREATE POLICY "Company users can view invites for their company"
ON user_invites FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM company_members 
    WHERE user_id = auth.uid()
    AND company_id = user_invites.company_id
    AND role = 'company_user'
  )
);

-- Allow company users to create invites for their company
CREATE POLICY "Company users can create invites for their company"
ON user_invites FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM company_members 
    WHERE user_id = auth.uid()
    AND company_id = user_invites.company_id
    AND role = 'company_user'
  )
);

-- Allow company users to delete invites for their company
CREATE POLICY "Company users can delete invites for their company"
ON user_invites FOR DELETE
USING (
  EXISTS (
    SELECT 1 
    FROM company_members 
    WHERE user_id = auth.uid()
    AND company_id = user_invites.company_id
    AND role = 'company_user'
  )
);

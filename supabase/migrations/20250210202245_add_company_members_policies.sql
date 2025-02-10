-- Enable RLS on company_members table
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own company memberships
CREATE POLICY "Users can view their own company memberships"
ON company_members FOR SELECT
USING (user_id = auth.uid());

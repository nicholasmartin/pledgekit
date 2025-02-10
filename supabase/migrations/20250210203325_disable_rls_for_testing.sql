-- Disable RLS on tables to test functionality
ALTER TABLE user_invites DISABLE ROW LEVEL SECURITY;
ALTER TABLE company_members DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view invites for their company" ON user_invites;
DROP POLICY IF EXISTS "Users can create invites for their company" ON user_invites;
DROP POLICY IF EXISTS "Users can delete invites for their company" ON user_invites;
DROP POLICY IF EXISTS "Users can view their own company memberships" ON company_members;

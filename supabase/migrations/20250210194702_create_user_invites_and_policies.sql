-- Create user_invites table
CREATE TABLE IF NOT EXISTS user_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')) DEFAULT 'pending',
    UNIQUE(company_id, email)
);

-- Enable RLS
ALTER TABLE user_invites ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to view invites for their company
CREATE POLICY "Users can view invites for their company"
ON user_invites FOR SELECT
USING (
  company_id IN (
    SELECT company_id 
    FROM company_members 
    WHERE user_id = auth.uid()
  )
);

-- Allow users to create invites for their company
CREATE POLICY "Users can create invites for their company"
ON user_invites FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM company_members 
    WHERE user_id = auth.uid()
  )
);

-- Allow users to delete invites for their company
CREATE POLICY "Users can delete invites for their company"
ON user_invites FOR DELETE
USING (
  company_id IN (
    SELECT company_id 
    FROM company_members 
    WHERE user_id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX user_invites_company_id_idx ON user_invites(company_id);
CREATE INDEX user_invites_email_idx ON user_invites(email);
CREATE INDEX user_invites_status_idx ON user_invites(status);

-- Add comment to table
COMMENT ON TABLE user_invites IS 'Stores user invitations for companies';

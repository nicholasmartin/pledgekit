-- Create canny_posts table
CREATE TABLE IF NOT EXISTS canny_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  canny_post_id TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  author_name TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  UNIQUE(company_id, canny_post_id)
);

-- Create canny_sync_logs table
CREATE TABLE IF NOT EXISTS canny_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  error_message TEXT,
  records_synced INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for performance
CREATE INDEX idx_canny_posts_company_id ON canny_posts(company_id);
CREATE INDEX idx_canny_posts_project_id ON canny_posts(project_id);
CREATE INDEX idx_canny_posts_status ON canny_posts(status);
CREATE INDEX idx_canny_posts_score ON canny_posts(score);
CREATE INDEX idx_canny_sync_logs_company_id ON canny_sync_logs(company_id);
CREATE INDEX idx_canny_sync_logs_created_at ON canny_sync_logs(created_at);

-- Enable RLS
ALTER TABLE canny_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE canny_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for canny_posts

-- View policies
CREATE POLICY "Company members can view their canny posts"
  ON canny_posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = canny_posts.company_id
      AND cm.user_id = auth.uid()
    )
  );

-- Insert/Update/Delete policies (admin only)
CREATE POLICY "Company admins can insert canny posts"
  ON canny_posts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = canny_posts.company_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Company admins can update canny posts"
  ON canny_posts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = canny_posts.company_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Company admins can delete canny posts"
  ON canny_posts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = canny_posts.company_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'owner')
    )
  );

-- RLS Policies for canny_sync_logs

-- View policies
CREATE POLICY "Company members can view their sync logs"
  ON canny_sync_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = canny_sync_logs.company_id
      AND cm.user_id = auth.uid()
    )
  );

-- Insert policies (admin only)
CREATE POLICY "Company admins can insert sync logs"
  ON canny_sync_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = canny_sync_logs.company_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'owner')
    )
  );

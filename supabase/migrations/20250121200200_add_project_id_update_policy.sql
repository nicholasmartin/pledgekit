-- Drop the existing update policy
DROP POLICY IF EXISTS "Company admins can update canny posts" ON canny_posts;

-- Create separate policies for different types of updates
-- 1. Allow admins to do any updates
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

-- 2. Allow any company member to update project_id
CREATE POLICY "Company members can update project_id"
  ON canny_posts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = canny_posts.company_id
      AND cm.user_id = auth.uid()
    )
  );

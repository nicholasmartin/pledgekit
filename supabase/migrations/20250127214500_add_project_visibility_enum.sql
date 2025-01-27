-- Create the project_visibility enum type
CREATE TYPE project_visibility AS ENUM ('public', 'private');

-- Drop the policy that uses the visibility column
DROP POLICY IF EXISTS "Users can access projects based on visibility" ON public.projects;

-- Add new column with enum type
ALTER TABLE projects 
  ADD COLUMN visibility_new project_visibility;

-- Migrate data to the new column
UPDATE projects 
SET visibility_new = CASE 
    WHEN visibility = 'public' THEN 'public'::project_visibility
    ELSE 'private'::project_visibility
  END;

-- Set constraints on new column
ALTER TABLE projects 
  ALTER COLUMN visibility_new SET NOT NULL;

ALTER TABLE projects
  ALTER COLUMN visibility_new SET DEFAULT 'private'::project_visibility;

-- Drop old column
ALTER TABLE projects 
  DROP COLUMN visibility;

-- Rename new column
ALTER TABLE projects 
  RENAME COLUMN visibility_new TO visibility;

-- Recreate the policy with the enum type
CREATE POLICY "Users can access projects based on visibility" ON public.projects
  FOR SELECT
  USING (
    visibility = 'public'::project_visibility OR 
    public.can_access_project(auth.uid(), id)
  );

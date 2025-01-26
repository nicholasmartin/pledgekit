-- Create the project_status enum type
CREATE TYPE project_status AS ENUM ('published', 'draft', 'completed', 'cancelled');

-- First remove the default constraint
ALTER TABLE projects 
  ALTER COLUMN status DROP DEFAULT;

-- Update existing status values to draft if null
UPDATE projects
SET status = 'draft'
WHERE status IS NULL;

-- Convert the column type
ALTER TABLE projects 
  ALTER COLUMN status TYPE project_status USING (status::project_status);

-- Now set the default and not null constraints
ALTER TABLE projects 
  ALTER COLUMN status SET DEFAULT 'draft'::project_status,
  ALTER COLUMN status SET NOT NULL;

-- Add comment for better documentation
COMMENT ON COLUMN projects.status IS 'The current status of the project. One of: published, draft, completed, cancelled.';

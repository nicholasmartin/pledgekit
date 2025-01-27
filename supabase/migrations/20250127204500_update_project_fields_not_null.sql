-- Update existing null values to their defaults
UPDATE public.projects 
SET amount_pledged = 0 
WHERE amount_pledged IS NULL;

-- Make amount_pledged NOT NULL
ALTER TABLE public.projects 
ALTER COLUMN amount_pledged SET NOT NULL;

-- Update header_image_url to empty string if null
UPDATE public.projects 
SET header_image_url = '' 
WHERE header_image_url IS NULL;

-- Make header_image_url NOT NULL with default empty string
ALTER TABLE public.projects 
ALTER COLUMN header_image_url SET DEFAULT '',
ALTER COLUMN header_image_url SET NOT NULL;

-- Add check constraint to ensure goal is positive
ALTER TABLE public.projects
ADD CONSTRAINT check_goal_positive CHECK (goal > 0);

-- Add check constraint to ensure amount_pledged is non-negative
ALTER TABLE public.projects
ADD CONSTRAINT check_amount_pledged_non_negative CHECK (amount_pledged >= 0);

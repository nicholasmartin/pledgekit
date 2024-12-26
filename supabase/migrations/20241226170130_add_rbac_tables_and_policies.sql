-- Migration to add RBAC tables and policies

-- Create user_private_access table
CREATE TABLE public.user_private_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  access_type TEXT CHECK (access_type IN ('customer_list', 'manual_request')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, company_id)
);

-- Add visibility column to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' 
CHECK (visibility IN ('public', 'private'));

-- Create a function to check project access
CREATE OR REPLACE FUNCTION public.can_access_project(
  p_user_id UUID, 
  p_project_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  project_visibility TEXT;
  user_company_member BOOLEAN;
  user_private_access BOOLEAN;
BEGIN
  -- Fetch project visibility
  SELECT visibility INTO project_visibility 
  FROM public.projects 
  WHERE id = p_project_id;

  -- If project is public, always return true
  IF project_visibility = 'public' THEN
    RETURN TRUE;
  END IF;

  -- Check if user is a company member
  user_company_member := EXISTS (
    SELECT 1 
    FROM public.company_members cm
    JOIN public.projects p ON p.company_id = cm.company_id
    WHERE p.id = p_project_id AND cm.user_id = p_user_id
  );

  IF user_company_member THEN
    RETURN TRUE;
  END IF;

  -- Check if user has private access to the project's company
  user_private_access := EXISTS (
    SELECT 1 
    FROM public.user_private_access upa
    JOIN public.projects p ON p.company_id = upa.company_id
    WHERE p.id = p_project_id 
      AND upa.user_id = p_user_id 
      AND upa.status = 'approved' 
      AND upa.is_active = TRUE
  );

  RETURN user_private_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view public projects" ON public.projects;
DROP POLICY IF EXISTS "Users can access projects based on visibility" ON public.projects;

-- Create new policy for project access
CREATE POLICY "Users can access projects based on visibility" ON public.projects
  FOR SELECT
  USING (
    visibility = 'public' OR 
    public.can_access_project(auth.uid(), id)
  );

-- Create indexes to optimize access checks
CREATE INDEX IF NOT EXISTS idx_user_private_access_user_company 
ON public.user_private_access(user_id, company_id, status);

CREATE INDEX IF NOT EXISTS idx_company_members_user_company 
ON public.company_members(user_id, company_id);

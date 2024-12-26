-- Function to retrieve projects accessible to a user
CREATE OR REPLACE FUNCTION public.get_user_accessible_projects(p_user_id UUID)
RETURNS UUID[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT DISTINCT p.id
    FROM public.projects p
    LEFT JOIN public.company_members cm ON p.company_id = cm.company_id
    LEFT JOIN public.user_private_access upa ON p.company_id = upa.company_id
    WHERE 
      p.visibility = 'public' OR
      cm.user_id = p_user_id OR
      (upa.user_id = p_user_id AND upa.status = 'approved' AND upa.is_active = TRUE)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_accessible_projects(UUID) TO authenticated;

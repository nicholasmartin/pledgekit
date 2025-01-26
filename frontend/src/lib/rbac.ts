import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/generated/database'

export enum UserRole {
  COMPANY_OWNER = 'company_owner',
  COMPANY_MEMBER = 'company_member',
  PUBLIC_USER = 'public_user',
  PUBLIC_USER_PRIVATE_ACCESS = 'public_user_private_access'
}

export interface ProjectAccessResult {
  canAccess: boolean;
  reason?: string;
}

export class AccessControlManager {
  private supabase: ReturnType<typeof createClient<Database>>;

  constructor(supabaseClient: ReturnType<typeof createClient<Database>>) {
    this.supabase = supabaseClient;
  }

  /**
   * Determine the user's role within a specific company
   */
  async getUserRoleInCompany(userId: string, companyId: string): Promise<UserRole> {
    const { data, error } = await this.supabase
      .from('company_members')
      .select('role')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();

    if (error || !data) return UserRole.PUBLIC_USER;

    switch (data.role) {
      case 'owner': return UserRole.COMPANY_OWNER;
      case 'admin':
      case 'member': return UserRole.COMPANY_MEMBER;
      default: return UserRole.PUBLIC_USER;
    }
  }

  /**
   * Check if a user can access a specific project
   */
  async canAccessProject(projectId: string): Promise<ProjectAccessResult> {
    const { data: project, error: projectError } = await this.supabase
      .from('projects')
      .select('id, visibility, company_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return { 
        canAccess: false, 
        reason: 'Project not found' 
      };
    }

    // Public projects are always accessible
    if (project.visibility === 'public') {
      return { 
        canAccess: true 
      };
    }

    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) {
      return { 
        canAccess: false, 
        reason: 'User not authenticated' 
      };
    }

    // Check if user is a company member
    const { data: membership } = await this.supabase
      .from('company_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('company_id', project.company_id)
      .single();

    if (membership) {
      return { 
        canAccess: true 
      };
    }

    // Check private access
    const { data: privateAccess } = await this.supabase
      .from('user_private_access')
      .select('status')
      .eq('user_id', user.id)
      .eq('company_id', project.company_id)
      .eq('status', 'approved')
      .eq('is_active', true)
      .single();

    if (privateAccess) {
      return { 
        canAccess: true 
      };
    }

    return { 
      canAccess: false, 
      reason: 'No access to private project' 
    };
  }

  /**
   * Retrieve all projects accessible to the current user
   */
  async getAccessibleProjects(): Promise<string[]> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await this.supabase.rpc('get_user_accessible_projects', {
      p_user_id: user.id
    });

    if (error) {
      console.error('Error fetching accessible projects:', error);
      return [];
    }

    return Array.isArray(data) && data.every(item => typeof item === 'string') ? data : [];
  }

  /**
   * Request access to a private project
   */
  async requestProjectAccess(companyId: string): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return false;

    const { error } = await this.supabase
      .from('user_private_access')
      .upsert({
        user_id: user.id,
        company_id: companyId,
        access_type: 'manual_request',
        status: 'pending',
        is_active: true
      }, {
        onConflict: 'user_id,company_id'
      });

    return !error;
  }
}

// Supabase RPC function to get accessible projects
// This should be added to your Supabase database functions
/*
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
*/

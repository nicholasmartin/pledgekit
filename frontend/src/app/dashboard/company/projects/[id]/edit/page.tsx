import { notFound, redirect } from "next/navigation"
import { createServerSupabase } from "@/lib/server-supabase"
import { ProjectFormTabs } from "@/components/dashboard/projects/project-form-tabs"
import { getUser } from "@/lib/server-auth"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

type ProjectStatus = Database['public']['Enums']['project_status']

type Project = Omit<Database['public']['Tables']['projects']['Row'], 'status'> & {
  status: ProjectStatus;
  company: { 
    id: string;
    name: string | null;
  };
}

interface EditProjectPageProps {
  params: {
    id: string
  }
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  // Call cookies() before any Supabase calls
  cookies()
  
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }

  const supabase = createServerSupabase()
  
  // Get the company_id for the current user
  const { data: companyMember, error: memberError } = await supabase
    .from("company_members")
    .select(`
      company_id,
      company:companies (
        name
      )
    `)
    .eq("user_id", user.id)
    .single()

  if (memberError) {
    if (memberError.code !== 'PGRST116') {
      console.error('Error fetching company member:', memberError)
    }
    return (
      <div className="max-w-4xl mx-auto py-6">
        <div className="p-4 text-red-600 bg-red-50 rounded-md">
          You must be part of a company to edit projects.
        </div>
      </div>
    )
  }

  if (!companyMember?.company_id) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <div className="p-4 text-red-600 bg-red-50 rounded-md">
          No company found. Please contact support if this is unexpected.
        </div>
      </div>
    )
  }

  // Get the project with company details
  const { data: dbProject, error: projectError } = await supabase
    .from("projects")
    .select(`
      *,
      company:companies (
        id,
        name
      )
    `)
    .eq("id", params.id)
    .single()

  if (projectError) {
    console.error('Error fetching project:', projectError)
    notFound()
  }

  if (!dbProject) {
    notFound()
  }

  // Type assertion to ensure project has valid status
  const project = {
    ...dbProject,
    status: (dbProject.status || 'draft') as ProjectStatus
  } satisfies Project

  // Verify user has access to this project
  if (project.company.id !== companyMember.company_id) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <div className="p-4 text-red-600 bg-red-50 rounded-md">
          You do not have permission to edit this project.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Edit Project</h1>
        {project.company.name && (
          <p className="text-muted-foreground">
            Editing project for {project.company.name}
          </p>
        )}
      </div>
      <ProjectFormTabs
        companyId={companyMember.company_id}
        project={project}
      />
    </div>
  )
}

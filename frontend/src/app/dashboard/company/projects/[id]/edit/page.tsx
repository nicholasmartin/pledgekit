import { notFound, redirect } from "next/navigation"
import { createServer } from "@/lib/supabase/server"
import { ProjectFormTabs } from "@/components/dashboard/projects/project-form-tabs"
import { getSession } from "@/lib/server-auth"
import type { Database } from "@/lib/database.types"

type ProjectStatus = "published" | "draft" | "completed" | "cancelled"

type Project = Omit<Database['public']['Tables']['projects']['Row'], 'status'> & {
  status: ProjectStatus;
  company: { id: string };
}

interface EditProjectPageProps {
  params: {
    id: string
  }
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const session = await getSession()
  if (!session?.user) {
    redirect('/login')
  }

  const supabase = createServer()
  
  // Get the company_id for the current user
  const { data: companyMember, error: memberError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", session.user.id)
    .single()

  if (memberError || !companyMember) {
    return <div>You must be part of a company to edit projects.</div>
  }

  // Get the project
  const { data: dbProject, error: projectError } = await supabase
    .from("projects")
    .select(`
      *,
      company:companies(id)
    `)
    .eq("id", params.id)
    .single()

  if (projectError || !dbProject) {
    notFound()
  }

  // Type assertion to ensure project has valid status
  const project = {
    ...dbProject,
    status: (dbProject.status || 'draft') as ProjectStatus
  } satisfies Project

  // Verify user has access to this project
  if (project.company.id !== companyMember.company_id) {
    return <div>You do not have permission to edit this project.</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Edit Project</h1>
      <ProjectFormTabs
        companyId={companyMember.company_id}
        project={project}
      />
    </div>
  )
}

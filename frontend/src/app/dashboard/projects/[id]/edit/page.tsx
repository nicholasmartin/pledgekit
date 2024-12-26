import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { ProjectFormTabs } from "@/components/dashboard/projects/project-form-tabs"

interface EditProjectPageProps {
  params: {
    id: string
  }
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get the company_id for the current user
  const { data: companyMember } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user?.id)
    .single()

  if (!companyMember) {
    return <div>You must be part of a company to edit projects.</div>
  }

  // Get the project
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .single()

  if (!project) {
    notFound()
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

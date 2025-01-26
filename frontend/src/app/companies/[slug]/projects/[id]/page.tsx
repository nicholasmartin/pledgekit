import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createServerSupabase } from "@/lib/server-supabase"
import { ProjectDetail } from "@/components/companies/project-detail"
import { transformProject, transformCompany } from "@/lib/transformers/project"
import type { Project, ProjectWithCompany } from "@/types/domain/project"

interface PageParams {
  params: {
    slug: string
    id: string
  }
}

export default async function ProjectDetailPage({ params }: PageParams) {
  // Must call cookies() before any Supabase calls as per SSR requirements
  cookies()
  const supabase = createServerSupabase()
  
  // Fetch project with pledge options
  const { data: project, error } = await supabase
    .from("projects")
    .select("*, pledge_options(*)")
    .eq("id", params.id)
    .single()

  if (error || !project) {
    console.error('Error fetching project:', error)
    return notFound()
  }

  // Fetch company
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", project.company_id)
    .single()

  if (companyError || !company) {
    console.error('Error fetching company:', companyError)
    return notFound()
  }

  // Count pledges
  const { count: pledgeCount, error: pledgeError } = await supabase
    .from("pledges")
    .select("*", { count: "exact", head: true })
    .eq("project_id", project.id)

  if (pledgeError) {
    console.error('Error counting pledges:', pledgeError)
  }

  const transformedProject = transformProject(project)
  const transformedCompany = transformCompany(company)

  return (
    <ProjectDetail 
      project={transformedProject}
      company={transformedCompany}
      pledgeCount={pledgeCount || 0}
    />
  )
}

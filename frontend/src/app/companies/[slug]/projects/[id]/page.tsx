import { createServer } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProjectDetail } from "@/components/companies/project-detail"

interface Props {
  params: {
    slug: string
    id: string
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const supabase = createServer()

  // Get company by slug
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, slug, branding")
    .eq("slug", params.slug)
    .single()

  if (companyError || !company) {
    notFound()
  }

  // Get project with pledge options and benefits
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(`
      *,
      pledge_options (
        id,
        title,
        amount,
        benefits,
        created_at
      ),
      updates (
        id,
        title,
        content,
        created_at
      )
    `)
    .eq("id", params.id)
    .eq("company_id", company.id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Get total number of pledges
  const { count: pledgeCount } = await supabase
    .from("pledges")
    .select("*", { count: "exact", head: true })
    .eq("project_id", project.id)

  return (
    <ProjectDetail 
      project={project} 
      company={company} 
      pledgeCount={pledgeCount || 0}
    />
  )
}

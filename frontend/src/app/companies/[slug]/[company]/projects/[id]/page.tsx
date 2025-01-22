import { createServer } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { ProjectDetail } from "@/components/companies/project-detail"

interface Props {
  params: {
    slug: string
    company: string
    id: string
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const supabase = createServer()

  // Get company by slug
  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("slug", params.company)
    .single()

  if (!company) {
    notFound()
  }

  // Get project with pledge options and benefits
  const { data: project } = await supabase
    .from("projects")
    .select(`
      *,
      pledge_options (
        id,
        title,
        amount,
        benefits
      )
    `)
    .eq("id", params.id)
    .eq("company_id", company.id)
    .single()

  if (!project) {
    notFound()
  }

  return <ProjectDetail project={project} company={company} />
}

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { ProjectDetail } from "@/components/companies/project-detail"

interface Props {
  params: {
    slug: string
    id: string
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const supabase = createServerComponentClient({ cookies })

  // Get company by slug
  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("slug", params.slug)
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

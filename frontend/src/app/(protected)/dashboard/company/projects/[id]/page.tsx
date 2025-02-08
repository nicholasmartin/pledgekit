import { createServer } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProjectPreview } from "@/components/dashboard/projects/project-preview"
import { toProjectWithCompany } from "@/types/transformers/project"
import { Tables } from "@/types/helpers/database"

interface PageParams {
  params: {
    id: string
  }
}

// Transform pledge option to match ProjectPreview's expected format
function toPreviewPledgeOption(dbOption: Tables<'pledge_options'>) {
  return {
    id: dbOption.id,
    title: dbOption.title,
    description: dbOption.description,
    amount: dbOption.amount,
    benefits: Array.isArray(dbOption.benefits) ? dbOption.benefits.filter((b): b is string => typeof b === 'string') : [],
    project_id: dbOption.project_id,
    created_at: dbOption.created_at
  }
}

export default async function ProjectPage({ params }: PageParams) {
  const supabase = createServer()
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      companies (*),
      pledge_options (*)
    `)
    .eq('id', params.id)
    .single()

  if (!project) {
    notFound()
  }

  const transformedProject = toProjectWithCompany(project)
  if (!transformedProject) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <ProjectPreview
        project={transformedProject}
        pledgeOptions={(project.pledge_options || []).map(toPreviewPledgeOption)}
      />
    </div>
  )
}

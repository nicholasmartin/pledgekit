import { createServer } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProjectPreview } from "@/components/dashboard/projects/project-preview"
import { toProjectWithCompany, toPledgeOption } from "@/types/transformers/project"

interface PageParams {
  params: {
    id: string
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
        pledgeOptions={(project.pledge_options || []).map(toPledgeOption)}
      />
    </div>
  )
}

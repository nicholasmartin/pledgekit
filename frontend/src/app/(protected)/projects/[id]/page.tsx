import { notFound } from "next/navigation"
import { getProject } from "@/lib/supabase/server/project"
import { getPledgeOptions } from "@/lib/supabase/server/pledge"
import { ProjectDetails } from "@/components/projects/project-details"
import { toPublicProject } from "@/types/transformers/project"
import { toPublicCompany } from "@/types/transformers/company"

interface PageProps {
  params: {
    id: string
  }
}

export default async function ProjectPage({ params }: PageProps) {
  try {
    // Fetch project data
    const project = await getProject(params.id)
    if (!project) {
      notFound()
    }

    // Fetch pledge options
    const pledgeOptions = await getPledgeOptions(project.id)

    const publicProject = toPublicProject(project)
    const publicCompany = toPublicCompany(project.companies)

    if (!publicProject || !publicCompany) {
      notFound()
    }

    return (
      <div className="container mx-auto max-w-[1200px] px-4 py-8">
        <ProjectDetails
          project={publicProject}
          company={publicCompany}
          pledgeOptions={pledgeOptions}
        />
      </div>
    )
  } catch (error) {
    console.error("Error loading project:", error)
    notFound()
  }
}
import { notFound } from "next/navigation"
import { getCompany, getCompanyProjects } from "@/lib/supabase/server"
import { toPublicCompany } from "@/types/transformers/company"
import { toPublicProject } from "@/types/transformers/project"
import { ProjectPublicView } from "@/components/shared/projects/project-public-view"

interface PageProps {
  params: {
    slug: string
    id: string
  }
}

export default async function ProjectPage({ params }: PageProps) {
  try {
    // Fetch company data
    const company = await getCompany(params.slug)
    
    // Fetch projects for this company
    const projects = await getCompanyProjects(company.id)
    const project = projects.find(p => p.id === params.id)
    
    if (!project) {
      notFound()
    }

    const publicCompany = toPublicCompany(company)
    const publicProject = toPublicProject({ ...project, companies: company })
    
    if (!publicProject) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <ProjectPublicView 
            project={publicProject} 
            company={publicCompany}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading project:", error)
    notFound()
  }
}

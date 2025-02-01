import { notFound, redirect } from "next/navigation"
import { getCompany, getCompanyProjects } from "@/lib/supabase/server"
import { ProjectDetails } from "@/components/projects/project-details"
import { toPublicCompany } from "@/types/transformers/company"
import { toPublicProject } from "@/types/transformers/project"

interface PageProps {
  params: {
    id: string
  }
}

export default async function ProtectedProjectPage({ params }: PageProps) {
  try {
    // Get user's company context from layout
    const userCompanyId = params.id // TODO: Get from layout context
    if (!userCompanyId) {
      redirect('/dashboard')
    }

    // Fetch company data
    const company = await getCompany(userCompanyId)
    
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
          <ProjectDetails
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
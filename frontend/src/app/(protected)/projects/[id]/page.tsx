import { notFound, redirect } from "next/navigation"
import { getCompany, getCompanyProjects } from "@/lib/supabase/server"
import { toPublicCompany } from "@/types/transformers/company"
import { toPublicProject } from "@/types/transformers/project"
import { ProjectFullDetails } from "@/components/shared/projects/project-full-details"

interface PageProps {
  params: {
    id: string
  }
}

export default async function ProtectedProjectPage({ params }: PageProps) {
  try {
    // In a protected route, we can get the user's company context
    // This would come from your auth/session management
    const userCompanyId = "TODO: Get from session"
    
    // Fetch company data
    const company = await getCompany(userCompanyId)
    
    // Fetch projects for this company
    const projects = await getCompanyProjects(company.id)
    const project = projects.find(p => p.id === params.id)
    
    if (!project) {
      notFound()
    }

    // Check if user has permission to view this project
    const hasPermission = true // TODO: Implement permission check
    if (!hasPermission) {
      redirect('/dashboard')
    }

    const publicCompany = toPublicCompany(company)
    const publicProject = toPublicProject({ ...project, companies: company })
    
    if (!publicProject) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <ProjectFullDetails 
            project={publicProject} 
            company={publicCompany}
            onPledge={() => {
              // TODO: Implement pledge flow
              console.log('Pledge clicked')
            }}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading project:", error)
    notFound()
  }
}
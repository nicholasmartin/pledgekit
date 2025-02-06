import { notFound } from "next/navigation"
import Link from "next/link"
import { getCompany, getCompanyProjects } from "@/lib/supabase/server"
import { getPledgeOptions } from "@/lib/supabase/server/pledge"
import { ProjectDetails } from "@/components/projects/project-details"
import { toPublicCompany } from "@/types/transformers/company"
import { toPublicProject } from "@/types/transformers/project"

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

    // Fetch pledge options
    const pledgeOptions = await getPledgeOptions(project.id)

    const publicCompany = toPublicCompany(company)
    const publicProject = toPublicProject({ ...project, companies: company })
    
    if (!publicProject) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-[1200px] px-4 py-8">
          <Link 
            href={`/companies/${params.slug}/`}
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to All Projects
          </Link>
          <ProjectDetails
            project={publicProject}
            company={publicCompany}
            pledgeOptions={pledgeOptions}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading project:", error)
    notFound()
  }
}

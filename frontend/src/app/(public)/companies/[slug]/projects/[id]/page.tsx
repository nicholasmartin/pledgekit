import { notFound } from "next/navigation"
import Link from "next/link"
import { getCompany, getCompanyProjects } from "@/lib/supabase/server"
import { getPledgeOptions, getUserProjectPledges } from "@/lib/supabase/server/pledge"
import { ProjectDetails } from "@/components/projects/project-details"
import { toPublicCompany } from "@/types/transformers/company"
import { toPublicProject } from "@/types/transformers/project"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from "@/types/generated/database"

interface PageProps {
  params: {
    slug: string
    id: string
  }
}

export default async function ProjectPage({ params }: PageProps) {
  try {
    // Get current user from Supabase
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    
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

    // Fetch user's pledges if authenticated
    const userPledges = user ? await getUserProjectPledges(user.id, project.id) : []

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
            userPledges={userPledges}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading project:", error)
    notFound()
  }
}

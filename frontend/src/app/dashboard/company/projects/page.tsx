import { createServer } from "@/lib/supabase/server"
import { ProjectsClient } from "@/components/dashboard/projects/projects-client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusIcon } from "lucide-react"
import { getSession } from "@/lib/server-auth"
import { redirect } from "next/navigation"

export default async function ProjectsPage() {
  const session = await getSession()
  if (!session?.user) {
    redirect('/login')
  }
  
  const supabase = createServer()
  
  // Get the company_id for the current user from company_members table
  const { data: companyMember, error: memberError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", session.user.id)
    .single()

  if (memberError || !companyMember) {
    return <div>You must be part of a company to view projects.</div>
  }

  // Get all projects for the company
  const { data: projects, error: projectsError } = await supabase
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
    .eq("company_id", companyMember.company_id)
    .order("created_at", { ascending: false })

  if (projectsError) {
    return <div>Failed to load projects. Please try again later.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
        <Button asChild>
          <Link href="/dashboard/company/projects/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>
      <ProjectsClient projects={projects || []} />
    </div>
  )
}

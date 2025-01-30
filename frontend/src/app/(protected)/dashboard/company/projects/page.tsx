import { createServer } from "@/lib/supabase/server"
import { ProjectsClient } from "@/components/dashboard/projects/projects-client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusIcon } from "lucide-react"
import { getUser } from "@/lib/supabase/server/auth"

export default async function ProjectsPage() {
  const supabase = createServer()
  const user = await getUser(supabase)
  
  // We know user exists because we're in a protected route
  if (!user) throw new Error("User not found in protected route")
  
  // Get the company_id for the current user from company_members table
  const { data: companyMember, error: memberError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single()

  if (memberError) {
    if (memberError.code !== 'PGRST116') {
      console.error('Error fetching company member:', memberError)
    }
    return (
      <div className="p-4 text-red-600">
        You must be part of a company to view projects.
      </div>
    )
  }

  if (!companyMember?.company_id) {
    return (
      <div className="p-4 text-red-600">
        No company found. Please contact support if this is unexpected.
      </div>
    )
  }

  // Get all projects for the company
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select(`
      *,
      pledge_options (*)
    `)
    .eq("company_id", companyMember.company_id)
    .order("created_at", { ascending: false })

  if (projectsError) {
    console.error('Error fetching projects:', projectsError)
    return (
      <div className="p-4 text-red-600">
        Failed to load projects. Please try again later.
      </div>
    )
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
      
      <ProjectsClient
        projects={projects || []}
      />
    </div>
  )
}

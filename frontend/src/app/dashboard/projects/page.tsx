import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { ProjectsClient } from "@/components/dashboard/projects/projects-client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusIcon } from "lucide-react"

export default async function ProjectsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get the company_id for the current user from company_members table
  const { data: companyMember, error: companyError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user?.id)
    .single()

  console.log("User ID:", user?.id)
  console.log("Company Member:", companyMember)
  console.log("Company Error:", companyError)

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
    .eq("company_id", companyMember?.company_id)
    .order("created_at", { ascending: false })

  console.log("Projects:", projects)
  console.log("Projects Error:", projectsError)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>
      <ProjectsClient projects={projects || []} />
    </div>
  )
}

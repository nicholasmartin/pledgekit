import { createServer } from "@/lib/supabase/server"
import { ProjectFormTabs } from "@/components/dashboard/projects/project-form-tabs"
import { getUser } from "@/lib/supabase/server/auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function NewProjectPage() {
  // Call cookies() before any Supabase calls
  cookies()
  
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  
  const supabase = createServer()

  // Get the company_id for the current user
  const { data: companyMember, error: memberError } = await supabase
    .from("company_members")
    .select(`
      company_id,
      company:companies (
        name
      )
    `)
    .eq("user_id", user.id)
    .single()

  if (memberError) {
    if (memberError.code !== 'PGRST116') {
      console.error('Error fetching company member:', memberError)
    }
    return (
      <div className="max-w-4xl mx-auto py-6">
        <div className="p-4 text-red-600 bg-red-50 rounded-md">
          You must be part of a company to create projects.
        </div>
      </div>
    )
  }

  if (!companyMember?.company_id) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <div className="p-4 text-red-600 bg-red-50 rounded-md">
          No company found. Please contact support if this is unexpected.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold">New Project</h1>
        {companyMember.company?.name && (
          <p className="text-muted-foreground">
            Creating a new project for {companyMember.company.name}
          </p>
        )}
      </div>
      <ProjectFormTabs companyId={companyMember.company_id} />
    </div>
  )
}

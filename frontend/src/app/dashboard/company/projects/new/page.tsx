import { createServer } from "@/lib/supabase/server"
import { ProjectFormTabs } from "@/components/dashboard/projects/project-form-tabs"
import { getSession } from "@/lib/server-auth"
import { redirect } from "next/navigation"

export default async function NewProjectPage() {
  const session = await getSession()
  if (!session?.user) {
    redirect('/login')
  }
  
  const supabase = createServer()

  // Get the company_id for the current user
  const { data: companyMember, error: memberError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", session.user.id)
    .single()

  if (memberError || !companyMember?.company_id) {
    return <div>You must be part of a company to create projects.</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">New Project</h1>
      <ProjectFormTabs companyId={companyMember.company_id} />
    </div>
  )
}

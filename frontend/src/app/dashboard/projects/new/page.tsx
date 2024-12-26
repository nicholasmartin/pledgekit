import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { ProjectFormTabs } from "@/components/dashboard/projects/project-form-tabs"

export default async function NewProjectPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get the company_id for the current user
  const { data: companyMember } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user?.id)
    .single()

  if (!companyMember) {
    return <div>You must be part of a company to create projects.</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">New Project</h1>
      <ProjectFormTabs companyId={companyMember.company_id} />
    </div>
  )
}

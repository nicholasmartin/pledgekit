import { getUser } from '@/lib/supabase/server'
import { createServer } from '@/lib/supabase/server'
import { CompanyDashboard } from '@/components/companies/company-dashboard'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { toProjectWithPledges } from '@/types/transformers/project'
import type { Tables } from '@/types/helpers/database'

export default async function Page() {
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
    .select("company_id")
    .eq('user_id', user.id)
    .single()

  if (memberError || !companyMember || !companyMember.company_id) {
    console.error('Error fetching company member:', memberError)
    return <div>Error fetching company member.</div>
  }

  // Get the company details
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq('id', companyMember.company_id)
    .single()

  if (companyError || !company) {
    console.error('Error fetching company:', companyError)
    return <div>Company not found.</div>
  }

  // Get all published projects for the company with their pledge options
  const { data: dbProjects, error: projectsError } = await supabase
    .from('projects')
    .select('*, pledge_options(*)')
    .eq('company_id', company.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (projectsError) {
    console.error('Error fetching projects:', projectsError)
    return <div>Error fetching projects.</div>
  }

  // Transform database projects to domain projects with pledge options
  const projects = (dbProjects as (Tables<'projects'> & { 
    pledge_options: Tables<'pledge_options'>[] 
  })[]).map(toProjectWithPledges)

  return (
    <CompanyDashboard
      companySlug={company.slug}
      projects={projects}
    />
  )
}

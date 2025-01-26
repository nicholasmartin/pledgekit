import { getUser } from '@/lib/server-auth'
import { createServerSupabase } from '@/lib/server-supabase'
import { CompanyDashboard } from './components/company-dashboard'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function Page() {
  // Call cookies() before any Supabase calls
  cookies()
  
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  
  const supabase = createServerSupabase()

  // Get the company_id for the current user
  const { data: companyMember, error: memberError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single()

  if (memberError || !companyMember?.company_id) {
    if (memberError?.code !== 'PGRST116') {
      console.error('Error fetching company member:', memberError)
    }
    return <div>You must be part of a company to view this dashboard.</div>
  }

  // Get company details including slug
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name, slug')
    .eq('id', companyMember.company_id)
    .single()

  if (companyError || !company) {
    console.error('Error fetching company:', companyError)
    return <div>Company not found.</div>
  }

  // Get all published projects for the company
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      description,
      goal,
      amount_pledged,
      end_date,
      header_image_url,
      status
    `)
    .eq('company_id', company.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (projectsError) {
    console.error('Error fetching projects:', projectsError)
  }

  return (
    <CompanyDashboard
      company={company}
      projects={projects || []}
    />
  )
}

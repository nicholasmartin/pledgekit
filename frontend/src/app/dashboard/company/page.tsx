import { getSession } from '@/lib/server-auth'
import { createServer } from '@/lib/supabase/server'
import { CompanyDashboard } from './components/company-dashboard'
import { redirect } from 'next/navigation'

export default async function Page() {
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

  if (memberError || !companyMember || !companyMember.company_id) {
    return <div>You must be part of a company to view this dashboard.</div>
  }

  // Get company details including slug
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name, slug')
    .eq('id', companyMember.company_id)
    .single()

  if (companyError || !company) {
    return <div>Company not found.</div>
  }

  // Get all published projects for the company
  const { data: projects } = await supabase
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

  return (
    <CompanyDashboard 
      companySlug={company.slug}
      projects={(projects || []).map(project => ({
        ...project,
        pledge_options: [],
        status: project.status || 'draft'
      }))}
    />
  )
}

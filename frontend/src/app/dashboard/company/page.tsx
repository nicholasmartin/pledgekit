import { getSession } from '@/lib/server-auth'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { CompanyDashboard } from './components/company-dashboard'

export default async function Page() {
  const session = await getSession()
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  
  // Get the company_id for the current user
  const { data: companyMember } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user?.id)
    .single()

  if (!companyMember) {
    return <div>You must be part of a company to view this dashboard.</div>
  }

  // Get company details including slug
  const { data: company } = await supabase
    .from('companies')
    .select('id, name, slug')
    .eq('id', companyMember.company_id)
    .single()

  if (!company) {
    return <div>Company not found.</div>
  }

  // Get all published projects for the company
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      status,
      pledge_options (
        id,
        title,
        amount,
        benefits
      )
    `)
    .eq('company_id', companyMember.company_id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return <CompanyDashboard 
    companySlug={company.slug} 
    projects={projects || []} 
  />
}

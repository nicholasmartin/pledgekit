import { getSession } from '@/lib/server-auth'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card } from '@/components/ui/card'
import { ProjectsClient } from '@/components/dashboard/projects/projects-client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export default async function CompanyDashboard() {
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

  // Get all published projects for the company
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
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

  const activeProjectsCount = projects?.length || 0

  return (
    <div className="space-y-6 max-w-[1200px]">
      <DashboardHeader
        heading="Company Dashboard"
        text="Manage your projects and view pledge statistics."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="p-6">
            <h3 className="font-semibold">Active Projects</h3>
            <p className="mt-2 text-3xl font-bold">{activeProjectsCount}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="font-semibold">Total Pledges</h3>
            {/* Add pledge stats */}
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="font-semibold">Completion Rate</h3>
            {/* Add completion stats */}
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="font-semibold">User Engagement</h3>
            {/* Add engagement stats */}
          </div>
        </Card>
      </div>

      
    </div>
  )
}

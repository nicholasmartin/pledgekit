import { getSession } from '@/lib/server-auth'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card } from '@/components/ui/card'
import { ProjectsClient } from '@/components/dashboard/projects/projects-client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export default async function CompanyDashboard() {
  const session = await getSession()
  const supabase = createServerComponentClient({ cookies })

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('company_id', session?.user?.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Company Dashboard"
        text="Manage your projects and view pledge statistics."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="p-6">
            <h3 className="font-semibold">Active Projects</h3>
            {/* Add project stats */}
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

      <div className="grid gap-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold">Recent Projects</h3>
            <ProjectsClient projects={projects || []} limit={5} />
          </div>
        </Card>
      </div>
    </div>
  )
}

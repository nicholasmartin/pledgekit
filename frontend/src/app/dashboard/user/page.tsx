import { getSession } from '@/lib/server-auth'
import { createServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { formatCurrency } from '@/lib/utils'

export default async function UserDashboard() {
  const session = await getSession()
  if (!session?.user) {
    redirect('/login')
  }

  const supabase = createServer()

  // Get user's pledges
  const { data: pledges, error: pledgesError } = await supabase
    .from('pledges')
    .select(`
      id,
      amount,
      status,
      created_at,
      project:projects (
        id,
        title
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (pledgesError) {
    console.error('Error fetching pledges:', pledgesError)
  }

  // Get user's watchlist
  const { data: watchlist, error: watchlistError } = await supabase
    .from('project_watchlist')
    .select(`
      project:projects (
        id,
        title,
        description,
        goal,
        amount_pledged
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (watchlistError) {
    console.error('Error fetching watchlist:', watchlistError)
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="My Dashboard"
        text="Track your pledges and watch your favorite projects."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Pledged
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(pledges?.reduce((sum, p) => sum + p.amount, 0) || 0)}
            </p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Active Pledges
            </p>
            <p className="text-2xl font-bold">
              {pledges?.filter(p => p.status === 'active').length || 0}
            </p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Watching
            </p>
            <p className="text-2xl font-bold">
              {watchlist?.length || 0}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">My Pledges</h2>
          <div className="space-y-4">
            {pledges?.length ? (
              pledges.map((pledge) => (
                <div key={pledge.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{pledge.project.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Pledged {formatCurrency(pledge.amount)} • {pledge.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No pledges yet</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Watching</h2>
          <div className="space-y-4">
            {watchlist?.length ? (
              watchlist.map((item) => (
                <div key={item.project.id} className="space-y-2">
                  <div className="flex justify-between">
                    <p className="font-medium">{item.project.title}</p>
                    <p className="text-sm">
                      {formatCurrency(item.project.amount_pledged)} / {formatCurrency(item.project.goal)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.project.description}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No projects in watchlist</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
import { getUser } from '@/lib/server-auth'
import { createServerSupabase } from '@/lib/server-supabase'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { formatCurrency } from '@/lib/utils'
import { cookies } from 'next/headers'

export default async function UserDashboard() {
  // Call cookies() before any Supabase calls
  cookies()
  
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }

  const supabase = createServerSupabase()

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
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (pledgesError) {
    console.error('Error fetching pledges:', pledgesError)
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="User Dashboard"
        text="View your pledges and support history"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Your Pledges</h3>
          <div className="mt-4 space-y-4">
            {pledges?.map((pledge) => (
              <div key={pledge.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{pledge.project.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {pledge.created_at ? new Date(pledge.created_at).toLocaleDateString() : 'Date not available'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(pledge.amount)}</p>
                  <p className="text-sm text-muted-foreground">{pledge.status}</p>
                </div>
              </div>
            ))}
            {!pledges?.length && (
              <p className="text-sm text-muted-foreground">No pledges yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
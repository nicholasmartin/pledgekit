import { getSession } from '@/lib/server-auth'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card } from '@/components/ui/card'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

// Mock data
const mockPledges = [
  {
    id: '1',
    projectTitle: 'Project Alpha',
    amount: 100,
    status: 'active',
    pledgedAt: '2024-12-20',
  },
  {
    id: '2',
    projectTitle: 'Project Beta',
    amount: 250,
    status: 'active',
    pledgedAt: '2024-12-25',
  },
]

const mockWatchlist = [
  {
    id: '1',
    title: 'Project Gamma',
    description: 'An exciting new feature',
    goal: 5000,
    amountPledged: 2500,
  },
  {
    id: '2',
    title: 'Project Delta',
    description: 'Revolutionary enhancement',
    goal: 3000,
    amountPledged: 1500,
  },
]

export default async function UserDashboard() {
  const session = await getSession()

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="My Dashboard"
        text="Track your pledges and watch your favorite projects."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="p-6">
            <h3 className="font-semibold">Active Pledges</h3>
            <p className="text-2xl font-bold">{mockPledges.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="font-semibold">Total Pledged</h3>
            <p className="text-2xl font-bold">
              ${mockPledges.reduce((sum, pledge) => sum + pledge.amount, 0)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="font-semibold">Watching</h3>
            <p className="text-2xl font-bold">{mockWatchlist.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="font-semibold">Projects Completed</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold">Recent Pledges</h3>
            <div className="mt-4 space-y-4">
              {mockPledges.map((pledge) => (
                <div
                  key={pledge.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{pledge.projectTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      Pledged on {new Date(pledge.pledgedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold">${pledge.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold">Watchlist</h3>
            <div className="mt-4 space-y-4">
              {mockWatchlist.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${project.amountPledged} / ${project.goal}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((project.amountPledged / project.goal) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
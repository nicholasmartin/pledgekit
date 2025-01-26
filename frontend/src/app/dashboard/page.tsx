import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DollarSign, Users, LineChart, Rocket } from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { getUser } from "@/lib/server-auth"

export default async function DashboardPage() {
  // Call cookies() before any Supabase calls
  cookies()
  
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardClient>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pledged</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$4,231</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Rocket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                2 completed this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,350</div>
              <p className="text-xs text-muted-foreground">
                +180 new users
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">
                +2.5% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your project's latest updates and pledges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "New pledge received",
                    description: "John Doe pledged $50 to API Integration",
                    timestamp: "2 hours ago",
                  },
                  {
                    title: "Project completed",
                    description: "Mobile App Redesign reached its goal",
                    timestamp: "1 day ago",
                  },
                  {
                    title: "New comment",
                    description: "Jane Smith commented on OAuth Implementation",
                    timestamp: "2 days ago",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {item.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.timestamp}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Popular Features</CardTitle>
              <CardDescription>
                Most requested features this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "OAuth Integration",
                    pledges: 45,
                    amount: "$2,250",
                  },
                  {
                    title: "Dark Mode Support",
                    pledges: 32,
                    amount: "$1,600",
                  },
                  {
                    title: "API Documentation",
                    pledges: 28,
                    amount: "$1,400",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {item.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.pledges} pledges
                      </p>
                    </div>
                    <div className="font-medium">{item.amount}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardClient>
  )
}

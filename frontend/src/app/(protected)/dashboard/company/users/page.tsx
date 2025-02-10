import { Metadata } from "next"
import { 
  PageHeader, 
  PageHeaderDescription, 
  PageHeaderHeading 
} from "@/components/page-header"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserTable } from "@/components/tables/user-table"
import { UserInviteForm } from "@/components/dashboard/company/user-invite-form"
import { createServer } from "@/lib/supabase/server"
import { getUser } from "@/lib/supabase/server/auth"

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage approved users and invitations",
}

export default async function UsersPage() {
  const supabase = createServer()
  const user = await getUser(supabase)

  // We know user exists because we're in a protected route
  if (!user) throw new Error("User not found in protected route")

  // Get the company_id for the current user from company_members table
  const { data: companyMember, error: memberError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq('user_id', user.id)
    .single()

  if (memberError) {
    console.error('Error fetching company member:', memberError)
    return (
      <div className="p-4 text-red-600">
        You must be part of a company to view users.
      </div>
    )
  }

  // Fetch approved users
  const { data: approvedUsers, error: approvedError } = await supabase
    .from('user_invites')
    .select('*')
    .eq('company_id', companyMember.company_id)
    .eq('status', 'accepted')
    .order('invited_at', { ascending: false })

  // Fetch pending invites
  const { data: pendingUsers, error: pendingError } = await supabase
    .from('user_invites')
    .select('*')
    .eq('company_id', companyMember.company_id)
    .eq('status', 'pending')
    .order('invited_at', { ascending: false })

  if (approvedError || pendingError) {
    console.error('Error fetching users:', { approvedError, pendingError })
    return (
      <div className="p-4 text-red-600">
        Error loading users. Please try again later.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader separated>
        <div className="flex flex-col gap-2">
          <PageHeaderHeading size="sm">User Management</PageHeaderHeading>
          <PageHeaderDescription size="sm">
            Manage approved users and send invitations to new users
          </PageHeaderDescription>
        </div>
      </PageHeader>

      <Tabs defaultValue="approved" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approved">Approved Users</TabsTrigger>
          <TabsTrigger value="pending">Pending Invites</TabsTrigger>
        </TabsList>
        <TabsContent value="approved">
          <Card>
            <UserTable type="approved" users={approvedUsers || []} />
          </Card>
        </TabsContent>
        <TabsContent value="pending">
          <Card>
            <div className="p-6 space-y-6">
              <UserInviteForm />
              <UserTable type="pending" users={pendingUsers || []} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

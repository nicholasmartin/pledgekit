import { createServer } from "@/lib/supabase/server"
import { getUser } from "@/lib/supabase/server/auth"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

interface Pledge {
  id: string
  created_at: string | null
  amount: number
  status: 'pending' | 'completed' | 'cancelled' | 'failed'
  projects: {
    title: string
  }
  pledge_options: {
    title: string
  }
  user_profiles: {
    display_name: string | null
  }
}

export default async function PledgesPage() {
  const supabase = createServer()
  const user = await getUser(supabase)
  
  // We know user exists because we're in a protected route
  if (!user) throw new Error("User not found in protected route")
  
  // Get the company_id for the current user from company_members table
  const { data: companyMember, error: memberError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single()

  if (memberError) {
    if (memberError.code !== 'PGRST116') {
      console.error('Error fetching company member:', memberError)
    }
    return (
      <div className="p-4 text-red-600">
        You must be part of a company to view pledges.
      </div>
    )
  }

  if (!companyMember?.company_id) {
    return (
      <div className="p-4 text-red-600">
        No company found. Please contact support if this is unexpected.
      </div>
    )
  }

  // Fetch pledges for the company
  const { data: pledges, error: pledgesError } = await supabase
    .from('pledges')
    .select(`
      id,
      created_at,
      amount,
      status,
      projects!inner (
        title
      ),
      pledge_options!inner (
        title
      ),
      user_profiles (
        display_name
      )
    `)
    .eq('projects.company_id', companyMember.company_id)
    .order('created_at', { ascending: false })

  if (pledgesError) {
    console.error('Error fetching pledges:', pledgesError)
    return (
      <div className="p-4 text-red-600">
        Error loading pledges. Please try again later.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Pledges</h2>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Pledge Option</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>User</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pledges?.map((pledge) => (
            <TableRow key={pledge.id}>
              <TableCell>
                {pledge.created_at ? new Date(pledge.created_at).toLocaleDateString() : '-'}
              </TableCell>
              <TableCell>{pledge.projects.title}</TableCell>
              <TableCell>{pledge.pledge_options.title}</TableCell>
              <TableCell>${pledge.amount}</TableCell>
              <TableCell>{pledge.status}</TableCell>
              <TableCell>{pledge.user_profiles?.display_name || '-'}</TableCell>
            </TableRow>
          ))}
          {!pledges?.length && (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No pledges found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
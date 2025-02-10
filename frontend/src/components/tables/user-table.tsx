'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, UserX } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface UserTableProps {
  type: 'approved' | 'pending'
  title?: string
  description?: string
  users: UserInvite[]
}

interface UserInvite {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  invited_at: string
  status: 'pending' | 'accepted'
  company_id: string
}

export function UserTable({ type, title, description, users }: UserTableProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserInvite | null>(null)

  // Handle revoking access
  const handleRevokeAccess = async () => {
    if (!selectedUser) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('user_invites')
        .delete()
        .eq('id', selectedUser.id)

      if (error) throw error

      toast({
        title: "Access Revoked",
        description: `Successfully revoked access for ${selectedUser.email}`
      })
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to revoke access"
      })
      console.error('Error:', error)
    } finally {
      setLoading(false)
      setSelectedUser(null)
    }
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Invited</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.first_name || user.last_name
                  ? `${user.first_name || ''} ${user.last_name || ''}`
                  : '-'}
              </TableCell>
              <TableCell>
                {new Date(user.invited_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault()
                            setSelectedUser(user)
                          }}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Revoke Access
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke User Access</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to revoke access for {selectedUser?.email}?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => setSelectedUser(null)}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleRevokeAccess}
                            className={cn(
                              buttonVariants({ variant: "destructive" }),
                              "bg-red-600 hover:bg-red-700"
                            )}
                            disabled={loading}
                          >
                            {loading ? "Revoking..." : "Revoke Access"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

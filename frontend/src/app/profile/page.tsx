"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getProfile() {
      try {
        setIsLoading(true)
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          throw error
        }

        setUser(user)
        setError(null)
      } catch (err) {
        console.error("Error fetching user profile:", err)
        setError(err instanceof Error ? err : new Error("Failed to load user profile"))
      } finally {
        setIsLoading(false)
      }
    }

    getProfile()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium">Name</label>
            <p className="text-muted-foreground">{user?.user_metadata?.name || 'Not set'}</p>
          </div>

          <div>
            <label className="text-sm font-medium">Last Sign In</label>
            <p className="text-muted-foreground">
              {user?.last_sign_in_at 
                ? new Date(user.last_sign_in_at).toLocaleString()
                : 'Not available'}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Account Created</label>
            <p className="text-muted-foreground">
              {user?.created_at 
                ? new Date(user.created_at).toLocaleString()
                : 'Not available'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

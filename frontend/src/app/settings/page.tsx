"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
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
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          {user && (
            <div className="space-y-2">
              <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
              <p><span className="text-muted-foreground">Last Sign In:</span> {new Date(user.last_sign_in_at || "").toLocaleString()}</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <p className="text-muted-foreground">Notification settings coming soon.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          <p className="text-muted-foreground">User preferences coming soon.</p>
        </div>
      </div>
    </div>
  )
}

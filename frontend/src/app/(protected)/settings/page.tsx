"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/providers/auth-provider"
import { useState } from "react"

export default function SettingsPage() {
  const { user } = useAuth()
  const [error, setError] = useState<Error | null>(null)

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

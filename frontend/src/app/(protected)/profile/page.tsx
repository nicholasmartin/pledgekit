"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/providers/auth-provider"
import { useState } from "react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [error, setError] = useState<Error | null>(null)

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

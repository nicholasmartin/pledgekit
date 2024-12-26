"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getProfile()
  }, [supabase])

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
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

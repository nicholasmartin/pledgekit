"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"

export default function ProfilePage() {
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
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium">Name</label>
          <p className="text-muted-foreground">{user?.user_metadata?.name || 'Not set'}</p>
        </div>
      </div>
    </div>
  )
}

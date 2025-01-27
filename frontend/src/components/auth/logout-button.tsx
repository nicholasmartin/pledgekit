'use client'

import { useState } from 'react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useSupabase } from '@/lib/supabase/hooks'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const supabase = useSupabase()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      router.refresh()
    } catch (error) {
      setIsLoggingOut(false)
      console.error('Error logging out:', error)
    }
  }

  return (
    <DropdownMenuItem
      disabled={isLoggingOut}
      onSelect={(e) => {
        e.preventDefault()
        handleLogout()
      }}
    >
      {isLoggingOut ? 'Logging out...' : 'Log out'}
    </DropdownMenuItem>
  )
}

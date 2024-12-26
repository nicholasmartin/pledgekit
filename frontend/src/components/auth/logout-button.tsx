'use client'

import { useState } from 'react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth-context'

export function LogoutButton() {
  const { signOut } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await signOut()
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

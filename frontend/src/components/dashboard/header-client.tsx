'use client'

import { Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { UserDetails } from "@/lib/server-auth"
import { useEffect, useState } from 'react'
import { LogoutButton } from "@/components/auth/logout-button"

interface HeaderClientProps {
  initialUserDetails: UserDetails
}

export function HeaderClient({ initialUserDetails }: HeaderClientProps) {
  const { userDetails } = useAuth()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const currentUserDetails = mounted ? userDetails : initialUserDetails
  
  if (!currentUserDetails) {
    return null
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <div className="flex-1">
        <h1 className="text-lg font-semibold">
          {currentUserDetails.membership?.company?.name || ''}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                2
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium">New pledge received</div>
                <div className="text-xs text-muted-foreground">
                  Someone pledged $50 to your feature request
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium">Project goal reached</div>
                <div className="text-xs text-muted-foreground">
                  Your project "API Integration" reached its funding goal
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{currentUserDetails.user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <LogoutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

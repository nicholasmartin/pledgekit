'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { NotificationsMenu } from "./notifications-menu"
import { LogoutButton } from "@/components/auth/logout-button"
import { useSafeAuth } from "@/components/providers/auth-provider"

export function AuthenticatedNav() {
  const { userDetails } = useSafeAuth()
  
  // If no user details, render public navigation items
  if (!userDetails) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Get Started</Link>
        </Button>
      </div>
    )
  }

  const dashboardRoute = userDetails?.membership ? '/dashboard/company' : '/dashboard/user'

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" asChild>
        <Link href={dashboardRoute}>Dashboard</Link>
      </Button>
      <NotificationsMenu />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {userDetails.user.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{userDetails.user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <LogoutButton />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
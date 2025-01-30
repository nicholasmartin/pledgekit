'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { NotificationsMenu } from "./notifications-menu"
import { LogoutButton } from "@/components/auth/logout-button"
import { useAuth } from "@/components/providers/auth-provider"

// Safe version of useAuth that returns null when context is unavailable
function useSafeAuth() {
  try {
    return useAuth()
  } catch {
    return {
      user: null,
      userDetails: null,
      userType: null
    }
  }
}

export function MainNav() {
  const pathname = usePathname()
  const { user, userDetails } = useSafeAuth()

  const dashboardRoute = userDetails?.membership ? '/dashboard/company' : '/dashboard/user'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="content-container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">
              PledgeKit
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/how-it-works"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith('/how-it-works')
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              How it Works
            </Link>
            <Link
              href="/explore"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith('/explore')
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Explore
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-2">
          {userDetails ? (
            <>
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
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

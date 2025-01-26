'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
import type { UserDetails } from "@/lib/server-auth"
import { NotificationsMenu } from "./notifications-menu"
import { LogoutButton } from "@/components/auth/logout-button"

interface MainNavClientProps {
  initialUserDetails: UserDetails | null
}

export function MainNavClient({ initialUserDetails }: MainNavClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userDetails, setUserDetails] = useState<UserDetails | null>(initialUserDetails)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUserDetails(null)
          router.refresh()
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          try {
            // Fetch latest user details
            const response = await fetch('/api/user')
            if (!response.ok) {
              throw new Error('Failed to fetch user details')
            }
            const details = await response.json()
            setUserDetails(details)
            router.refresh()
          } catch (error) {
            console.error('Error fetching user details:', error)
            // Keep existing user details on error
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router])

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

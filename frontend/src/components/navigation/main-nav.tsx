"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function MainNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Feature Pledger</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link
                href="/explore"
                className={cn(
                  "hover:text-foreground/80",
                  pathname === "/explore" ? "text-foreground" : "text-foreground/60"
                )}
              >
                Explore
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link
                href="/pricing"
                className={cn(
                  "hover:text-foreground/80",
                  pathname === "/pricing" ? "text-foreground" : "text-foreground/60"
                )}
              >
                Pricing
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link
                href="/login"
                className="text-foreground/60 hover:text-foreground/80"
              >
                Login
              </Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}

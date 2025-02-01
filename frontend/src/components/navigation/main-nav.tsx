'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { AuthenticatedNav } from "./authenticated-nav"

export function MainNav() {
  const pathname = usePathname()

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
        <AuthenticatedNav />
      </div>
    </header>
  )
}

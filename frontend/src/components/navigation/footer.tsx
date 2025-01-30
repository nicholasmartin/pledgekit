/**
 * Footer Component
 * 
 * A reusable footer component that provides consistent bottom navigation
 * and branding across the application. Used in both public and protected layouts.
 * 
 * Features:
 * - Responsive design (mobile-first)
 * - Dynamic copyright year
 * - Configurable positioning via className prop
 * - Links to legal pages
 * 
 * Usage:
 * ```tsx
 * <Footer className="absolute bottom-0 w-full" />
 * ```
 */

'use client'

import { cn } from "@/lib/utils"

interface FooterProps {
  /** Optional className for custom styling and positioning */
  className?: string
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("border-t py-6 md:py-0", className)}>
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        {/* Copyright notice with dynamic year */}
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} PledgeKit. All rights reserved.
        </p>
        
        {/* Legal links */}
        <div className="flex items-center gap-4">
          <a
            href="/terms"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Terms
          </a>
          <a
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Privacy
          </a>
        </div>
      </div>
    </footer>
  )
}

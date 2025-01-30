'use client'

import { cn } from '@/lib/utils'
import { UserType } from '@/types/external/supabase/auth'
import { Navigation } from './navigation'
import { MobileNav } from './navigation/mobile-nav'
import { Header } from './header/'

interface ShellProps {
  userType: UserType | null
  children: React.ReactNode
  className?: string
}

/**
 * DashboardShell component that provides the main layout structure for the dashboard.
 * Includes responsive navigation and header with user-specific content.
 */
export function DashboardShell({ userType, children, className }: ShellProps) {
  return (
    <div className={cn('flex min-h-screen flex-col', className)}>
      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-border lg:block">
          <Navigation userType={userType} className="py-6" />
        </aside>
        
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-50 border-b border-border bg-background">
            <div className="flex h-16 items-center">
              <MobileNav userType={userType} />
              <Header userType={userType} />
            </div>
          </header>
          
          <main className="flex-1 space-y-4 p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

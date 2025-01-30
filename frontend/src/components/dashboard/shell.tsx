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
    <div className={cn('flex h-screen flex-col', className)}>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background">
        <div className="flex h-16 items-center px-4">
          <MobileNav userType={userType} />
          <Header userType={userType} />
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        <aside className="hidden lg:block w-64 border-r border-border">
          <div className="fixed w-64 top-16 bottom-0 overflow-y-auto">
            <Navigation userType={userType} className="py-6" />
          </div>
        </aside>
        
        <main className="flex-1 overflow-auto">
          <div className="space-y-4 p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

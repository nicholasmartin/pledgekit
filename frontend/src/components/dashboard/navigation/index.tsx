'use client'

import { cn } from '@/lib/utils'
import { UserType } from '@/types/external/supabase/auth'
import { companyNavigation, userNavigation } from '@/config/navigation'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavigationProps {
  userType: UserType | null
  className?: string
}

export function Navigation({ userType, className }: NavigationProps) {
  const pathname = usePathname()
  const navigation = userType === UserType.COMPANY ? companyNavigation : userNavigation

  return (
    <nav className={cn('flex flex-col gap-4 p-4', className)}>
      <div className="flex-1 space-y-4">
        {navigation.mainItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-2',
                pathname === item.href && 'bg-muted'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Button>
          </Link>
        ))}
      </div>
      
      <div className="space-y-4">
        {navigation.bottomItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-2',
                pathname === item.href && 'bg-muted'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  )
}

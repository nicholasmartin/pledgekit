'use client'

import { cn } from '@/lib/utils'
import { UserNav } from './user-nav'
import { UserType } from '@/types/external/supabase/auth'
import Link from 'next/link'

interface HeaderProps {
  userType: UserType | null
  className?: string
}

export function Header({ userType, className }: HeaderProps) {
  const getDashboardPath = () => {
    return userType === UserType.COMPANY ? '/dashboard/company' : '/dashboard/user'
  }

  return (
    <div className={cn('flex h-full w-full items-center justify-between px-4', className)}>
      <div className="flex items-center gap-4">
        <Link 
          href={getDashboardPath()}
          className="text-lg font-semibold tracking-tight"
        >
          PledgeKit
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <UserNav />
      </div>
    </div>
  )
}

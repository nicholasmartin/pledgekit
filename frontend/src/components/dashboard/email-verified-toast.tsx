'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle } from 'lucide-react'

export function EmailVerifiedToast() {
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('emailVerified') === 'true') {
      toast({
        title: 'Email verified successfully!',
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Your account is now fully set up.</span>
          </div>
        ),
        duration: 5000,
      })
    }
  }, [searchParams, toast])

  return null
}

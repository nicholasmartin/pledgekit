'use client'

import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function ConfirmPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <h1 className="text-2xl font-semibold">Verifying your email...</h1>
        <p className="mt-2 text-muted-foreground">
          Please wait while we confirm your email address.
        </p>
      </div>
    </div>
  )
}

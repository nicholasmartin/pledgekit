'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const router = useRouter()

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by boundary:', event.error)
      
      // Handle auth-related errors by redirecting to login
      if (event.error?.message?.toLowerCase().includes('auth') || 
          event.error?.message?.toLowerCase().includes('unauthorized')) {
        router.push('/login')
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [router])

  return <>{children}</>
}

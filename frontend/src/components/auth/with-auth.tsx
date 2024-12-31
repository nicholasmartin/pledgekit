import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccessControl, UserType } from '@/hooks/use-access-control'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface WithAuthProps {
  requiredUserType?: UserType
  fallbackPath?: string
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { requiredUserType, fallbackPath }: WithAuthProps = {}
) {
  return function WithAuthComponent(props: P) {
    const { isLoading, isAuthorized, getDashboardPath } = useAccessControl()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthorized(requiredUserType)) {
        router.replace(fallbackPath || getDashboardPath())
      }
    }, [isLoading, isAuthorized, requiredUserType, router, fallbackPath, getDashboardPath])

    if (isLoading) {
      return (
        <div className="flex h-screen w-screen items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )
    }

    if (!isAuthorized(requiredUserType)) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}

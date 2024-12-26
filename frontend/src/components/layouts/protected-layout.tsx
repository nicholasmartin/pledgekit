import { redirect } from 'next/navigation'
import { getSession, getUserDetails } from '@/lib/server-auth'

interface ProtectedLayoutProps {
  children: React.ReactNode
  requireCompany?: boolean
}

export async function ProtectedLayout({ 
  children,
  requireCompany = false 
}: ProtectedLayoutProps) {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  if (requireCompany) {
    const userDetails = await getUserDetails()
    if (!userDetails?.membership) {
      // If company access is required but user isn't a company member,
      // redirect to user dashboard
      redirect('/dashboard/user')
    }
  }

  return <>{children}</>
}

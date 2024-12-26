import { getUserDetails } from '@/lib/server-auth'
import { HeaderClient } from './header-client'
import { redirect } from 'next/navigation'

export async function Header() {
  const userDetails = await getUserDetails()
  
  if (!userDetails) {
    redirect('/login')
  }

  return <HeaderClient initialUserDetails={userDetails} />
}

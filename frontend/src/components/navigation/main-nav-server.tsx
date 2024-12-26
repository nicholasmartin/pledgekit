import { getUserDetails } from '@/lib/server-auth'
import { MainNavClient } from './main-nav-client'

export async function MainNav() {
  const userDetails = await getUserDetails()
  
  return <MainNavClient initialUserDetails={userDetails} />
}

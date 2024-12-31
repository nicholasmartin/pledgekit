import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getUserDetails } from '@/lib/server-auth'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const userDetails = await getUserDetails()
    return NextResponse.json(userDetails)
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json(null)
  }
}

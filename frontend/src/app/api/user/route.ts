import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getUserDetails } from '@/lib/supabase/server'
import { createServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Must call cookies() before any Supabase calls
    cookies()
    const supabase = createServer()

    // First verify the user session is valid
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Error verifying user session:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get detailed user info including company membership
    const userDetails = await getUserDetails()
    if (!userDetails) {
      return NextResponse.json(
        { error: 'Failed to fetch user details' },
        { status: 404 }
      )
    }

    return NextResponse.json(userDetails)
  } catch (error) {
    console.error('Error in user API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

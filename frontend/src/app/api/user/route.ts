import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getUserDetails } from '@/lib/server-auth'

export async function GET() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        }
      }
    }
  )
  
  try {
    const userDetails = await getUserDetails()
    return NextResponse.json(userDetails)
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json(null)
  }
}

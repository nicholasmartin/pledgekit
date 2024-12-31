import { UserType } from "./types/user"
import { supabase } from "./supabase"

interface RegisterUserParams {
  email: string
  password: string
  firstName: string
  lastName: string
  userType: UserType
  metadata?: Record<string, any>
}

export async function registerUser({
  email,
  password,
  firstName,
  lastName,
  userType,
  metadata = {}
}: RegisterUserParams) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login?verified=true`,
      data: {
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
        ...metadata
      },
    },
  })

  if (error) throw error
  return data
}

export async function getUserType(): Promise<UserType> {
  const { data: { user } } = await supabase.auth.getUser()
  return (user?.user_metadata?.user_type as UserType) || UserType.PUBLIC_USER
}

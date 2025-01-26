import type { Database } from './database'

/**
 * Constant values for user types
 */
export const UserTypeValues = {
  COMPANY: 'company' as const,
  USER: 'user' as const,
} as const

/**
 * User type definition for the application.
 * Used to determine user roles and access levels.
 */
export type UserType = typeof UserTypeValues[keyof typeof UserTypeValues]

/**
 * Extended user details including company membership information.
 * Used for server-side user information retrieval.
 */
export type UserDetails = {
  user: {
    id: string
    email?: string
    user_metadata: {
      company_name?: string
    }
  }
  membership?: {
    role: string
    company: {
      name: string
    } | null
  } | null
}

/**
 * Type guard to check if a value is a valid UserType
 */
export function isUserType(value: unknown): value is UserType {
  return value === UserTypeValues.COMPANY || value === UserTypeValues.USER
}

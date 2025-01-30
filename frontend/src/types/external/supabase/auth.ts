import type { Database } from './database'

/**
 * User type enum for the application.
 * Used to determine user roles and access levels.
 */
export enum UserType {
  COMPANY = 'company',
  USER = 'user'
}

/**
 * Constant values for user types, matching the UserType enum
 */
export const UserTypeValues = {
  COMPANY: UserType.COMPANY,
  USER: UserType.USER
} as const

/**
 * Extended user details including company membership information.
 * Used for server-side user information retrieval.
 * Company is returned as a single object due to database constraints ensuring only one company per user.
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
    company: { name: string }
  } | null
}

/**
 * Type guard to check if a value is a valid UserType
 */
export function isUserType(value: unknown): value is UserType {
  return value === UserType.COMPANY || value === UserType.USER
}

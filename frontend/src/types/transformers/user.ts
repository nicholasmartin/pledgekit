/**
 * User Type Transformers
 * 
 * This file contains functions to transform between database and domain types
 * for user-related entities.
 */

import { Tables } from '../helpers/database'
import { User, UserWithCompany } from '../domain/user/types'
import { userSchema } from '../domain/user/schema'

export function toUser(
  dbUser: Tables<'user_profiles'> & {
    company_members?: Tables<'company_members'>[]
  },
  authUser?: { email: string }
): User {
  const membership = dbUser.company_members?.[0]

  return userSchema.parse({
    id: dbUser.id,
    email: authUser?.email || '',
    metadata: {
      user_type: 'public_user',
      first_name: dbUser.first_name || undefined,
      last_name: dbUser.last_name || undefined
    },
    membership: membership ? {
      company_id: membership.company_id || '',
      role: membership.role
    } : undefined
  })
}

export function toDbUser(
  user: User
): Omit<Tables<'user_profiles'>, 'id' | 'created_at' | 'updated_at'> {
  return {
    first_name: user.metadata.first_name || null,
    last_name: user.metadata.last_name || null,
    display_name: null,
    settings: {}
  }
}

export function toUserWithCompany(
  dbUser: Tables<'user_profiles'> & {
    company_members?: (Tables<'company_members'> & {
      companies?: Tables<'companies'>
    })[]
  }
): UserWithCompany {
  const user = toUser(dbUser)
  const companyMember = dbUser.company_members?.[0]
  const company = companyMember?.companies

  return {
    ...user,
    company: company ? {
      id: company.id,
      name: company.name,
      slug: company.slug
    } : undefined
  }
}

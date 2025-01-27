/**
 * Company Schema Definitions
 * 
 * This file contains Zod schemas for validating company-related data.
 * These schemas define the shape and validation rules for our domain types.
 */

import { z } from 'zod'

export const companySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  logoUrl: z.string().optional(),  // URL to company logo
  website: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  createdAt: z.string().or(z.date()).transform(val => {
    if (val instanceof Date) return val;
    return new Date(val);
  })
})

export type Company = z.infer<typeof companySchema>

export type CompanyWithProjects = Company & {
  projects: Array<{
    id: string
    title: string
    description: string | null
    goal: number
    amountPledged: number
    status: 'draft' | 'published' | 'completed' | 'cancelled'
  }>
}

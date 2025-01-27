/**
 * Project Schema Definitions
 * 
 * This file contains Zod schemas for validating project-related data.
 * These schemas define the shape and validation rules for our domain types.
 */

import { z } from 'zod'

export const projectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable(),
  goal: z.number().int().positive(),
  amountPledged: z.number().int().min(0),  // Must be non-negative
  status: z.enum(['draft', 'published', 'completed', 'cancelled']),
  endDate: z.string().or(z.date()).transform(val => {
    if (val instanceof Date) return val;
    return new Date(val);
  }),
  headerImageUrl: z.string(),  // Empty string if no image
  visibility: z.enum(['public', 'private']),
  companyId: z.string().uuid()
})

export type Project = z.infer<typeof projectSchema>

export type ProjectWithPledges = Project & {
  pledgeOptions: {
    id: string
    title: string
    amount: number
    benefits: string[]
  }[]
}

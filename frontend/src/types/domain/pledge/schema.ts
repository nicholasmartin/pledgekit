/**
 * Pledge Schema Definitions
 * 
 * This file contains Zod schemas for validating pledge-related data.
 * These schemas define the shape and validation rules for our domain types.
 */

import { z } from 'zod'

// Schema for benefits array in pledge options
export const benefitsSchema = z.array(z.string())

// Schema for pledge options
export const pledgeOptionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().nullable(),
  benefits: benefitsSchema.nullable(),
  projectId: z.string()
})

// Schema for pledges
export const pledgeSchema = z.object({
  id: z.string(),
  amount: z.number().positive(),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']),
  projectId: z.string(),
  pledgeOptionId: z.string(),
  userId: z.string(),
  paymentIntentId: z.string().nullable(),
  paymentMethodId: z.string().nullable(),
  createdAt: z.string().transform(str => new Date(str)),
  updatedAt: z.string().nullable().transform(str => str ? new Date(str) : null)
})

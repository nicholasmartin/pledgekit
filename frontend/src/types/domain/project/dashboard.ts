import { z } from 'zod'

export const dashboardProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable(),
  goal: z.number().int().positive(),
  amount_pledged: z.number().int().min(0).nullable(),
  end_date: z.string(),
  header_image_url: z.string().nullable(),
  company_id: z.string().uuid(),
  status: z.enum(["draft", "published", "completed", "cancelled"]),
  visibility: z.enum(["public", "private"]),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export type DashboardProject = z.infer<typeof dashboardProjectSchema>

// Helper function to validate a project is a dashboard project
export function isDashboardProject(project: unknown): project is DashboardProject {
  return dashboardProjectSchema.safeParse(project).success
}

"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase/hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(1000).optional(),
  goal: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Goal must be a positive number",
  }),
  end_date: z.string().refine((val) => {
    const date = new Date(val)
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.setDate(now.getDate() + 30))
    return date <= thirtyDaysFromNow && date > new Date()
  }, {
    message: "End date must be within the next 30 days",
  }),
  status: z.enum(["draft", "published", "completed", "cancelled"]),
})

interface ProjectFormProps {
  companyId: string
  project?: {
    id: string
    title: string
    description: string | null
    goal: number
    end_date: string
    status: 'draft' | 'published' | 'completed' | 'cancelled'
  }
}

export function ProjectForm({ companyId, project }: ProjectFormProps) {
  const router = useRouter()
  const supabase = useSupabase()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      goal: project?.goal?.toString() || "",
      end_date: project?.end_date?.split('T')[0] || "",
      status: project?.status || "draft",
    },
  })

  const onSubmit = async (values: z.infer<typeof projectFormSchema>) => {
    try {
      setIsSubmitting(true)
      const projectData = {
        title: values.title,
        description: values.description || null,
        goal: Number(values.goal),
        end_date: new Date(values.end_date).toISOString(),
        status: values.status,
        company_id: companyId,
      }

      if (project) {
        await supabase
          .from("projects")
          .update(projectData)
          .eq("id", project.id)
      } else {
        await supabase
          .from("projects")
          .insert([projectData])
      }

      router.push("/dashboard/projects")
      router.refresh()
    } catch (error) {
      console.error("Error saving project:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The name of your project.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                Describe what this project aims to achieve.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Funding Goal</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="0.01" {...field} />
              </FormControl>
              <FormDescription>
                The amount of money you want to raise.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>
                Project must end within 30 days.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Draft projects are only visible to you.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : project ? "Update Project" : "Create Project"}
        </Button>
      </form>
    </Form>
  )
}

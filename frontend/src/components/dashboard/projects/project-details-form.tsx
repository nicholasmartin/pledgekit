"use client"

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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

const projectDetailsSchema = z.object({
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

interface ProjectDetailsFormProps {
  companyId: string
  project?: {
    id: string
    title: string
    description: string | null
    goal: number
    end_date: string
    status: "draft" | "published" | "completed" | "cancelled"
  }
  onSave?: (projectId: string) => void
}

export function ProjectDetailsForm({ companyId, project, onSave }: ProjectDetailsFormProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof projectDetailsSchema>>({
    resolver: zodResolver(projectDetailsSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      goal: project?.goal?.toString() || "",
      end_date: project?.end_date ? new Date(project.end_date).toISOString().split('T')[0] : "",
      status: project?.status || "draft",
    },
  })

  const onSubmit = async (values: z.infer<typeof projectDetailsSchema>) => {
    try {
      if (project?.id) {
        const { error } = await supabase
          .from("projects")
          .update({
            title: values.title,
            description: values.description,
            goal: Number(values.goal),
            end_date: new Date(values.end_date).toISOString(),
            status: values.status,
          })
          .eq("id", project.id)

        if (error) throw error
        onSave?.(project.id)
      } else {
        const { data, error } = await supabase.from("projects").insert({
          company_id: companyId,
          title: values.title,
          description: values.description,
          goal: Number(values.goal),
          end_date: new Date(values.end_date).toISOString(),
          status: values.status,
        }).select().single()

        if (error) throw error
        if (data) {
          onSave?.(data.id)
        }
      }

      router.refresh()
    } catch (error) {
      console.error("Error saving project:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
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
                Must be within the next 30 days
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
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save and Continue</Button>
      </form>
    </Form>
  )
}

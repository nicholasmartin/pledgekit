"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

const pledgeOptionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(1000).optional(),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
})

interface PledgeOptionsFormProps {
  projectId?: string
  onSave?: () => void
}

interface PledgeOption {
  id: string
  title: string
  description: string | null
  amount: number
}

export function PledgeOptionsForm({ projectId, onSave }: PledgeOptionsFormProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [pledgeOptions, setPledgeOptions] = useState<PledgeOption[]>([])
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<z.infer<typeof pledgeOptionSchema>>({
    resolver: zodResolver(pledgeOptionSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: "",
    },
  })

  useEffect(() => {
    if (projectId) {
      loadPledgeOptions()
    }
  }, [projectId])

  const loadPledgeOptions = async () => {
    if (!projectId) return

    const { data, error } = await supabase
      .from("pledge_options")
      .select("*")
      .eq("project_id", projectId)
      .order("amount", { ascending: true })

    if (error) {
      console.error("Error loading pledge options:", error)
      return
    }

    setPledgeOptions(data || [])
  }

  const onSubmit = async (values: z.infer<typeof pledgeOptionSchema>) => {
    if (!projectId) return

    try {
      const { error } = await supabase.from("pledge_options").insert({
        project_id: projectId,
        title: values.title,
        description: values.description,
        amount: Number(values.amount),
      })

      if (error) throw error

      form.reset()
      loadPledgeOptions()
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving pledge option:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("pledge_options")
        .delete()
        .eq("id", id)

      if (error) throw error

      loadPledgeOptions()
    } catch (error) {
      console.error("Error deleting pledge option:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Pledge Options</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          disabled={isEditing}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </Button>
      </div>

      {/* Existing pledge options */}
      <div className="grid gap-4">
        {pledgeOptions.map((option) => (
          <Card key={option.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                {option.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(option.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                {option.description}
              </p>
              <p className="font-medium">
                ${option.amount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit form */}
      {isEditing && (
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setIsEditing(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Save Option</Button>
            </div>
          </form>
        </Form>
      )}

      {pledgeOptions.length > 0 && !isEditing && (
        <div className="flex justify-end">
          <Button onClick={onSave}>Continue to Benefits</Button>
        </div>
      )}
    </div>
  )
}

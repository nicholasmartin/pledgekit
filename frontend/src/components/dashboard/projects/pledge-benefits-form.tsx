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
import { useSupabase } from "@/lib/supabase/hooks"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

const benefitSchema = z.object({
  benefit: z.string().min(1, "Benefit description is required").max(200),
})

interface PledgeBenefitsFormProps {
  projectId?: string
}

interface PledgeOption {
  id: string
  title: string
  amount: number
  benefits: string[]
}

export function PledgeBenefitsForm({ projectId }: PledgeBenefitsFormProps) {
  const router = useRouter()
  const supabase = useSupabase()
  const [pledgeOptions, setPledgeOptions] = useState<PledgeOption[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const form = useForm<z.infer<typeof benefitSchema>>({
    resolver: zodResolver(benefitSchema),
    defaultValues: {
      benefit: "",
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

    setPledgeOptions(
      data.map((option) => ({
        id: option.id,
        title: option.title,
        amount: option.amount,
        benefits: Array.isArray(option.benefits) 
          ? option.benefits.map(b => String(b))
          : option.benefits 
            ? [String(option.benefits)]
            : []
      }))
    )

    if (data.length > 0 && !selectedOption) {
      setSelectedOption(data[0].id)
    }
  }

  const onSubmit = async (values: z.infer<typeof benefitSchema>) => {
    if (!projectId || !selectedOption) return

    try {
      const option = pledgeOptions.find((o) => o.id === selectedOption)
      if (!option) return

      const updatedBenefits = [...option.benefits, values.benefit]

      const { error } = await supabase
        .from("pledge_options")
        .update({
          benefits: updatedBenefits,
        })
        .eq("id", selectedOption)

      if (error) throw error

      form.reset()
      loadPledgeOptions()
    } catch (error) {
      console.error("Error saving benefit:", error)
    }
  }

  const handleDeleteBenefit = async (optionId: string, benefitIndex: number) => {
    try {
      const option = pledgeOptions.find((o) => o.id === optionId)
      if (!option) return

      const updatedBenefits = option.benefits.filter((_, i) => i !== benefitIndex)

      const { error } = await supabase
        .from("pledge_options")
        .update({
          benefits: updatedBenefits,
        })
        .eq("id", optionId)

      if (error) throw error

      loadPledgeOptions()
    } catch (error) {
      console.error("Error deleting benefit:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Pledge Benefits</h3>
      </div>

      {/* Pledge options list */}
      <div className="grid gap-4">
        {pledgeOptions.map((option) => (
          <Card
            key={option.id}
            className={`cursor-pointer ${
              selectedOption === option.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedOption(option.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                {option.title} - ${option.amount.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {option.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between group"
                  >
                    <span className="text-sm">• {benefit}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteBenefit(option.id, index)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add benefit form */}
      {selectedOption && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="benefit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add Benefit</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <Button type="submit">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      )}
    </div>
  )
}

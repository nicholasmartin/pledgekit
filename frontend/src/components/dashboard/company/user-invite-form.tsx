"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
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
import { useToast } from "@/components/ui/use-toast"
import { useSafeAuth } from "@/components/providers/use-safe-auth"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export function UserInviteForm() {
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
    },
  })

  async function onSubmit(values: FormData) {
    try {
      setIsLoading(true)

      // Get current user's company ID
      const { data: companyMember, error: memberError } = await supabase
        .from('company_members')
        .select('company_id')
        .single()

      if (memberError || !companyMember) {
        toast({
          title: "Error",
          description: "Company not found. Please try refreshing the page.",
          variant: "destructive",
        })
        return
      }

      // Check if user already has a pending invite
      const { data: existingInvites, error: searchError } = await supabase
        .from('user_invites')
        .select('*')
        .eq('email', values.email)
        .eq('status', 'pending')
        .single()

      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError
      }

      if (existingInvites) {
        toast({
          title: "Already Invited",
          description: "This user already has a pending invitation.",
          variant: "destructive",
        })
        return
      }

      // Create new invitation
      const { error: inviteError } = await supabase
        .from('user_invites')
        .insert({
          company_id: companyMember.company_id,
          email: values.email,
          first_name: values.firstName,
          last_name: values.lastName,
          status: 'pending'
        })

      if (inviteError) throw inviteError

      toast({
        title: "Invitation Sent",
        description: "User has been invited successfully."
      })

      form.reset()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invitation. Please try again."
      })
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter user's email address"
                  {...field}
                  type="email"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter first name"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter last name"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Invitation
        </Button>
      </form>
    </Form>
  )
}

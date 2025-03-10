"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"

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
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { UserType } from "@/types/external/supabase"
import { useSupabase } from "@/lib/supabase/hooks"
import { AuthError } from "@supabase/supabase-js"

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})

export function PublicRegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = useSupabase()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const displayName = `${values.firstName} ${values.lastName}`

      // First set up the metadata
      const metadata = {
        first_name: values.firstName,
        last_name: values.lastName,
        display_name: displayName,
        user_type: UserType.USER // Include user type in initial metadata
      }

      // Register user with complete metadata
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: metadata
        }
      })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error("Failed to create user account")
      }

      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account before logging in.",
      })
      
      router.push("/login")
    } catch (error) {
      console.error('Registration error:', error)
      
      // Handle specific error cases
      if (error instanceof AuthError && error.message.includes('User already exists')) {
        toast({
          title: "Registration Error",
          description: "An account with this email already exists. Please login or use a different email.",
          variant: "destructive"
        })
      } else if (error instanceof AuthError && error.message.includes('Database error')) {
        console.error('Database error details:', error)
        toast({
          title: "Registration Error",
          description: "There was a problem creating your account. Please try again.",
          variant: "destructive"
        })
      } else if (error instanceof AuthError && error.message === "Failed to create user account") {
        toast({
          title: "Registration Error",
          description: "Failed to create user account. Please try again.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
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
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Register
        </Button>
      </form>
    </Form>
  )
}

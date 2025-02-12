"use client"

import Link from "next/link"
import { ArrowRight, Building2, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export function RegisterOptions() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 md:right-8 md:top-8"
        )}
      >
        Login
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          PledgeKit
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Choose your account type to get started with PledgeKit
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              PledgeKit
            </h1>
            <p className="text-sm text-muted-foreground">
              Choose your account type to get started with PledgeKit
            </p>
          </div>
          <div className="grid gap-6">
            <Link
              href="/register/user"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "relative h-auto p-6 space-y-2 hover:bg-muted"
              )}
            >
              <div className="flex items-center space-x-4">
                <User className="h-6 w-6" />
                <div className="flex-1 text-left">
                  <h3 className="font-semibold">Individual Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Support and fund features you want to see
                  </p>
                </div>
                <ArrowRight className="h-5 w-5" />
              </div>
            </Link>
            <Link
              href="/register/company"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "relative h-auto p-6 space-y-2 hover:bg-muted"
              )}
            >
              <div className="flex items-center space-x-4">
                <Building2 className="h-6 w-6" />
                <div className="flex-1 text-left">
                  <h3 className="font-semibold">Company Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Crowdfund your product features
                  </p>
                </div>
                <ArrowRight className="h-5 w-5" />
              </div>
            </Link>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

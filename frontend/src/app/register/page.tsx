import { Metadata } from "next"
import { RegisterOptions } from "@/components/auth/register-options"

export const metadata: Metadata = {
  title: "Register - PledgeKit",
  description: "Create an account to get started with PledgeKit",
}

export default function RegisterPage() {
  return <RegisterOptions />
}
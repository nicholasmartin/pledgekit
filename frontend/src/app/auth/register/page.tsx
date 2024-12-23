import { Metadata } from "next"
import { RegisterOptions } from "@/components/auth/register-options"

export const metadata: Metadata = {
  title: "Register - Feature Pledger",
  description: "Create an account to get started with Feature Pledger",
}

export default function RegisterPage() {
  return <RegisterOptions />
}
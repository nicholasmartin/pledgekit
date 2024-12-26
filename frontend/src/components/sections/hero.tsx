import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            Transform Your Product Roadmap with User-Backed Features
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Empower your users to fund the features they want most. PledgeKit helps B2B SaaS companies validate and fund new features through user pledges.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/register">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link href="#pricing">
              <Button variant="outline" size="lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

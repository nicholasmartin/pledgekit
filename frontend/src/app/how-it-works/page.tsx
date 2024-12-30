import { Button } from "@/components/ui/button"
import { DetailedSteps } from "@/components/sections/detailed-steps"
import { BenefitsSection } from "@/components/sections/benefits-section"
import { FAQSection } from "@/components/sections/faq-section"
import Link from "next/link"

export const metadata = {
  title: "How It Works | PledgeKit",
  description: "Learn how PledgeKit helps B2B SaaS companies validate and fund new features through user pledges."
}

export default function HowItWorks() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative isolate px-6 pt-14 lg:px-8 bg-background">
        <div className="mx-auto max-w-4xl py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              How PledgeKit Works
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              PledgeKit transforms your feature requests into funded development projects, 
              helping you build what users actually want—and are willing to pay for.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="lg">Watch Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Steps */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            The Complete PledgeKit Process
          </h2>
          <DetailedSteps />
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-background">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Why Use PledgeKit?
          </h2>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            PledgeKit helps you build with confidence, knowing that every feature 
            you develop has validated demand and committed funding.
          </p>
          <BenefitsSection />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Got questions? We've got answers.
          </p>
          <FAQSection />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Feature Development?
          </h2>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join forward-thinking SaaS companies using PledgeKit to validate and 
            fund their feature development through user pledges.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">Start Free Trial</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}

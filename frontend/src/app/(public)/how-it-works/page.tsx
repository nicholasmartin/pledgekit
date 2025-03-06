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
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative isolate px-6 pt-14 lg:px-8 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-blue-200 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
        </div>
        
        <div className="mx-auto max-w-5xl py-20 sm:py-32">
          <div className="text-center">
            <div className="inline-block bg-blue-50 text-primary font-medium px-4 py-2 rounded-full text-sm mb-6">
              Perfect for Canny users
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              How PledgeKit Works
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              PledgeKit transforms your Canny feature requests into funded development projects, 
              helping you build what users actually want—and are willing to pay for.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all">Get Started</Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="lg" className="rounded-full px-8 border-2 hover:bg-muted/20 transition-all">Watch Demo</Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-200 to-primary opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
        </div>
      </section>

      {/* Detailed Steps */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white rounded-3xl shadow-sm relative z-10">
            <h2 className="text-3xl font-bold text-center mb-4">
              The Complete PledgeKit Process
            </h2>
            <p className="text-center text-lg text-muted-foreground max-w-3xl mx-auto mb-16">
              One-stop platform - everything you need to transform Canny feature requests into funded development projects
            </p>
            <DetailedSteps />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Why Use PledgeKit?
            </h2>
            <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              PledgeKit helps you build with confidence, knowing that every feature 
              you develop has validated demand and committed funding.
            </p>
            <BenefitsSection />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto px-8 py-12 bg-white rounded-3xl shadow-sm">
            <h2 className="text-3xl font-bold text-center mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground text-center mb-12">
              Got questions? We've got answers.
            </p>
            <FAQSection />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 mx-auto">
          <div className="max-w-5xl mx-auto mb-16 bg-gradient-to-br from-blue-50 to-white p-12 rounded-3xl shadow-lg">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Transform Your Feature Development?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join innovative SaaS companies using PledgeKit to validate and 
                fund their feature development through user pledges.
              </p>
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 rounded-full shadow-lg hover:shadow-xl transition-all">Start Free Trial</Button>
              </Link>
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-block bg-blue-50 text-primary font-medium px-4 py-2 rounded-full text-sm">
              Be an early adopter and help shape the future of PledgeKit
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

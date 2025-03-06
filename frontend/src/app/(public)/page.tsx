import { HeroSection } from "@/components/sections/hero-section"
import { ProblemSolutionSection } from "@/components/sections/problem-solution"
import { HowItWorksSection } from "@/components/sections/how-it-works"
import { FeaturesGridSection } from "@/components/sections/features-grid"
import { IntegrationSection } from "@/components/sections/integration"
import { CTASection } from "@/components/sections/cta-section"

export const metadata = {
  title: "PledgeKit - Turn Customer Demand into Development Reality",
  description: "PledgeKit helps you crowdfund your product features through user pledges. Where feature requests meet financial commitment.",
}

export default function Home() {
  return (
    <main className="flex flex-col bg-gradient-to-b from-white to-gray-50">
      <div className="flex-1">
        <HeroSection />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white rounded-3xl shadow-sm -mt-8 relative z-10">
          <ProblemSolutionSection />
        </div>
        <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <HowItWorksSection />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white rounded-3xl shadow-sm my-16">
          <FeaturesGridSection />
        </div>
        <div className="py-16 bg-gradient-to-b from-white to-gray-50">
          <IntegrationSection />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white rounded-3xl shadow-sm my-16">
          <CTASection />
        </div>
      </div>
    </main>
  )
}

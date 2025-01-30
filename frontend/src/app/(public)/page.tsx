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
    <main className="flex flex-col">
      <div className="flex-1">
        <HeroSection />
        <ProblemSolutionSection />
        <HowItWorksSection />
        <FeaturesGridSection />
        <IntegrationSection />
        <CTASection />
      </div>
    </main>
  )
}

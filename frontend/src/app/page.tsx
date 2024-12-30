import { HeroSection } from "@/components/sections/hero-section"
import { ProblemSolutionSection } from "@/components/sections/problem-solution"
import { HowItWorksSection } from "@/components/sections/how-it-works"
import { FeaturesGridSection } from "@/components/sections/features-grid"
import { IntegrationSection } from "@/components/sections/integration"
import { CTASection } from "@/components/sections/cta-section"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
      <ProblemSolutionSection />
      <HowItWorksSection />
      <FeaturesGridSection />
      <IntegrationSection />
      <CTASection />
    </main>
  )
}

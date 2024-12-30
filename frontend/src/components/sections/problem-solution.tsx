import { UnsplashImage } from "@/components/ui/unsplash-image"
import { UNSPLASH_IMAGES } from "@/config/images"

export function ProblemSolutionSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">
          The Feature Development Dilemma
        </h2>
        
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Traditional Side */}
          <div className="space-y-6">
            <div className="rounded-xl overflow-hidden">
              <UnsplashImage
                id={UNSPLASH_IMAGES.problemSolution.problem}
                alt="Traditional feature management challenges"
                width={800}
                height={500}
                className="w-full object-cover"
              />
            </div>
            <div className="p-8 rounded-lg bg-background">
              <h3 className="text-xl font-semibold text-destructive">
                Traditional Feature Management
              </h3>
              <ul className="space-y-4 mt-4 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-destructive">•</span>
                  Endless request lists
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-destructive">•</span>
                  Uncertain prioritization
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-destructive">•</span>
                  Resource allocation risks
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-destructive">•</span>
                  No clear validation
                </li>
              </ul>
            </div>
          </div>

          {/* PledgeKit Side */}
          <div className="space-y-6">
            <div className="rounded-xl overflow-hidden">
              <UnsplashImage
                id={UNSPLASH_IMAGES.problemSolution.solution}
                alt="The PledgeKit solution"
                width={800}
                height={500}
                className="w-full object-cover"
              />
            </div>
            <div className="p-8 rounded-lg bg-background">
              <h3 className="text-xl font-semibold text-primary">
                The PledgeKit Way
              </h3>
              <ul className="space-y-4 mt-4 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Customer-backed development
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Financial validation upfront
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Guaranteed user adoption
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Clear ROI metrics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

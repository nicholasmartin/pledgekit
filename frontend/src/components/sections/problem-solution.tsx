import { UnsplashImage } from "@/components/ui/unsplash-image"
import { UNSPLASH_IMAGES } from "@/config/images"

export function ProblemSolutionSection() {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-16">
        The Feature Development Dilemma
      </h2>
      
      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* Traditional Side */}
        <div className="space-y-6 transform transition-all duration-300 hover:translate-y-[-8px]">
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <UnsplashImage
              id={UNSPLASH_IMAGES.problemSolution.problem}
              alt="Traditional feature management challenges"
              width={800}
              height={500}
              className="w-full object-cover"
            />
          </div>
          <div className="p-8 rounded-xl bg-white border border-gray-100 shadow-sm">
            <h3 className="text-xl font-semibold text-destructive mb-4">
              Traditional Feature Management
            </h3>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-destructive">✕</span>
                Endless request lists
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-destructive">✕</span>
                Uncertain prioritization
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-destructive">✕</span>
                Resource allocation risks
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-destructive">✕</span>
                No clear validation
              </li>
            </ul>
          </div>
        </div>

        {/* PledgeKit Side */}
        <div className="space-y-6 transform transition-all duration-300 hover:translate-y-[-8px]">
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <UnsplashImage
              id={UNSPLASH_IMAGES.problemSolution.solution}
              alt="The PledgeKit solution"
              width={800}
              height={500}
              className="w-full object-cover"
            />
          </div>
          <div className="p-8 rounded-xl bg-white border border-gray-100 shadow-sm">
            <h3 className="text-xl font-semibold text-primary mb-4">
              The PledgeKit Way
            </h3>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-primary">✓</span>
                Customer-backed development
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-primary">✓</span>
                Financial validation upfront
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-primary">✓</span>
                Guaranteed user adoption
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-primary">✓</span>
                Clear ROI metrics
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

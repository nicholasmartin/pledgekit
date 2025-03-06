import { cn } from "@/lib/utils"
import { UnsplashImage } from "@/components/ui/unsplash-image"
import { UNSPLASH_IMAGES } from "@/config/images"

interface Step {
  number: number
  title: string
  description: string
  details: string[]
  imageId: string
  imageAlt: string
}

const steps: Step[] = [
  {
    number: 1,
    title: "Import Your Canny Requests",
    description: "Connect your Canny account and let our AI do the heavy lifting",
    details: [
      "Seamless one-click import from your Canny boards",
      "AI-powered categorization and grouping of similar requests",
      "Smart tagging and priority suggestions based on request patterns",
      "Duplicate detection and automatic merging of similar items"
    ],
    imageId: UNSPLASH_IMAGES.detailedSteps.import,
    imageAlt: "AI-powered Canny import dashboard with request categorization"
  },
  {
    number: 2,
    title: "Create Funding Projects",
    description: "Transform requests into structured funding campaigns",
    details: [
      "Set clear funding goals and development timelines",
      "Define multiple pledge tiers with unique benefits",
      "Choose between public and private campaign visibility",
      "Customize project pages with rich media and roadmaps"
    ],
    imageId: UNSPLASH_IMAGES.detailedSteps.projectCreation,
    imageAlt: "Project creation interface with pledge tier setup"
  },
  {
    number: 3,
    title: "Engage Your Users",
    description: "Share projects and collect pledges from interested users",
    details: [
      "Automated notifications to users who requested the feature in Canny",
      "Easy sharing through email and social media",
      "Real-time pledge tracking and progress updates",
      "Built-in discussion and Q&A functionality"
    ],
    imageId: UNSPLASH_IMAGES.detailedSteps.userEngagement,
    imageAlt: "User engagement dashboard with pledge statistics"
  },
  {
    number: 4,
    title: "Manage Development",
    description: "Track progress and keep backers informed",
    details: [
      "Development milestone tracking and updates",
      "Automated backer communications",
      "Sync status updates back to your Canny board",
      "Early access and beta testing management"
    ],
    imageId: UNSPLASH_IMAGES.detailedSteps.development,
    imageAlt: "Development tracking interface with milestone updates"
  }
]

export function DetailedSteps() {
  return (
    <div className="space-y-24">
      {steps.map((step, index) => (
        <div 
          key={step.number}
          className={cn(
            "grid gap-12 items-center",
            index % 2 === 0 ? "md:grid-cols-[1.5fr,1fr]" : "md:grid-cols-[1fr,1.5fr] md:flex-row-reverse"
          )}
        >
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-primary font-bold text-xl">
              {step.number}
            </div>
            <h3 className="text-2xl font-bold">{step.title}</h3>
            <p className="text-lg text-muted-foreground">{step.description}</p>
            <ul className="space-y-4">
              {step.details.map((detail, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-primary">✓</span>
                  <span className="text-muted-foreground">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl transform hover:scale-[1.02] transition-all duration-300">
            <UnsplashImage
              id={step.imageId}
              alt={step.imageAlt}
              width={600}
              height={400}
              className="w-full h-[300px] object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

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
    title: "Import Your Feature Requests",
    description: "Connect your existing tools and let our AI do the heavy lifting",
    details: [
      "Automatic import from popular tools like GitHub Issues, Canny, or ProductBoard",
      "AI-powered categorization and grouping of similar requests",
      "Smart tagging and priority suggestions based on request patterns",
      "Duplicate detection and automatic merging of similar items"
    ],
    imageId: UNSPLASH_IMAGES.detailedSteps.import,
    imageAlt: "AI-powered import dashboard with request categorization"
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
      "Automated notifications to users who requested the feature",
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
      "Integration with development tools",
      "Early access and beta testing management"
    ],
    imageId: UNSPLASH_IMAGES.detailedSteps.development,
    imageAlt: "Development tracking interface with milestone updates"
  }
]

export function DetailedSteps() {
  return (
    <div className="space-y-16">
      {steps.map((step, index) => (
        <div 
          key={step.number}
          className={cn(
            "grid gap-8 items-center",
            index % 2 === 0 ? "md:grid-cols-[1.5fr,1fr]" : "md:grid-cols-[1fr,1.5fr] flex-row-reverse"
          )}
        >
          <div className="space-y-4">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              Step {step.number}
            </div>
            <h3 className="text-2xl font-bold">{step.title}</h3>
            <p className="text-lg text-muted-foreground">{step.description}</p>
            <ul className="space-y-3">
              {step.details.map((detail, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg bg-background">
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

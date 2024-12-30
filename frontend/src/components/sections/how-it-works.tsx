import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UnsplashImage } from "@/components/ui/unsplash-image"
import { UNSPLASH_IMAGES } from "@/config/images"

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">
          Launch Customer-Backed Features in 3 Steps
        </h2>

        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto mb-16">
          {/* Step 1 */}
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden mb-6">
              <UnsplashImage
                id={UNSPLASH_IMAGES.howItWorks.step1}
                alt="Import and setup process"
                width={400}
                height={300}
                className="w-full object-cover"
              />
            </div>
            <div className="text-4xl font-bold text-primary mb-4">1</div>
            <h3 className="text-xl font-semibold">Import & Setup</h3>
            <p className="text-muted-foreground">
              Connect your existing feature request tool. Our AI automatically categorizes and groups similar requests, making setup effortless.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden mb-6">
              <UnsplashImage
                id={UNSPLASH_IMAGES.howItWorks.step2}
                alt="Launch projects visualization"
                width={400}
                height={300}
                className="w-full object-cover"
              />
            </div>
            <div className="text-4xl font-bold text-primary mb-4">2</div>
            <h3 className="text-xl font-semibold">Launch Projects</h3>
            <p className="text-muted-foreground">
              Choose features for development and set funding goals. Share privately with select clients or publicly to maximize exposure.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden mb-6">
              <UnsplashImage
                id={UNSPLASH_IMAGES.howItWorks.step3}
                alt="Track and deliver progress"
                width={400}
                height={300}
                className="w-full object-cover"
              />
            </div>
            <div className="text-4xl font-bold text-primary mb-4">3</div>
            <h3 className="text-xl font-semibold">Track & Deliver</h3>
            <p className="text-muted-foreground">
              Monitor pledges, update backers, and maintain your reputation score through successful delivery.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/register">
            <Button size="lg">See It In Action</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

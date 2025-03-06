import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UnsplashImage } from "@/components/ui/unsplash-image"
import { UNSPLASH_IMAGES } from "@/config/images"

export function HowItWorksSection() {
  return (
    <div id="how-it-works" className="py-16">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Launch Customer-Backed Features in 3 Steps
        </h2>
        <p className="text-center text-lg text-muted-foreground max-w-3xl mx-auto mb-16">
          One-stop platform - everything you need to transform feature requests into funded development projects.
        </p>

        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto mb-16">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="rounded-xl overflow-hidden mb-6">
              <UnsplashImage
                id={UNSPLASH_IMAGES.howItWorks.step1}
                alt="Import and setup process"
                width={400}
                height={300}
                className="w-full object-cover"
              />
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-primary font-bold text-xl mb-4">1</div>
            <h3 className="text-xl font-semibold mb-3">Import & Setup</h3>
            <p className="text-muted-foreground">
              Connect your existing feature request tool. Our AI automatically categorizes and groups similar requests, making setup effortless.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="rounded-xl overflow-hidden mb-6">
              <UnsplashImage
                id={UNSPLASH_IMAGES.howItWorks.step2}
                alt="Launch projects visualization"
                width={400}
                height={300}
                className="w-full object-cover"
              />
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-primary font-bold text-xl mb-4">2</div>
            <h3 className="text-xl font-semibold mb-3">Launch Projects</h3>
            <p className="text-muted-foreground">
              Choose features for development and set funding goals. Share privately with select clients or publicly to maximize exposure.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="rounded-xl overflow-hidden mb-6">
              <UnsplashImage
                id={UNSPLASH_IMAGES.howItWorks.step3}
                alt="Track and deliver progress"
                width={400}
                height={300}
                className="w-full object-cover"
              />
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-primary font-bold text-xl mb-4">3</div>
            <h3 className="text-xl font-semibold mb-3">Track & Deliver</h3>
            <p className="text-muted-foreground">
              Monitor pledges, update backers, and maintain your reputation score through successful delivery.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/register">
            <Button size="lg" className="rounded-full px-8 shadow-md hover:shadow-lg transition-all">See It In Action</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

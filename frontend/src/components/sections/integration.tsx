import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UnsplashImage } from "@/components/ui/unsplash-image"
import { UNSPLASH_IMAGES } from "@/config/images"

export function IntegrationSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">
          Seamless Integration with Your Workflow
        </h2>

        <div className="max-w-3xl mx-auto">
          <ul className="grid sm:grid-cols-2 gap-6 mb-12">
            <li className="flex items-center gap-3 text-lg">
              <span className="text-primary">•</span>
              AI-powered feature request import
            </li>
            <li className="flex items-center gap-3 text-lg">
              <span className="text-primary">•</span>
              Top platform integrations
            </li>
            <li className="flex items-center gap-3 text-lg">
              <span className="text-primary">•</span>
              Custom setup options
            </li>
            <li className="flex items-center gap-3 text-lg">
              <span className="text-primary">•</span>
              Stripe payment processing
            </li>
          </ul>

          <div className="rounded-xl overflow-hidden mb-12">
            <UnsplashImage
              id={UNSPLASH_IMAGES.integration.dashboard}
              alt="Integration dashboard showing import process"
              width={1200}
              height={675}
              className="w-full object-cover"
            />
          </div>

          <div className="text-center">
            <Link href="/register">
              <Button size="lg">Explore Integrations</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

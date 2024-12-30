import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UnsplashImage } from "@/components/ui/unsplash-image"
import { UNSPLASH_IMAGES } from "@/config/images"

export function HeroSection() {
  return (
    <section className="relative isolate px-6 pt-14 lg:px-8 bg-background">
      <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            Turn Customer Demand into Development Reality
          </h1>
          <p className="mt-6 text-xl leading-8 text-muted-foreground italic">
            Where feature requests meet financial commitment
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Your customers want new features. You need development resources. 
            PledgeKit bridges the gap with customer-backed feature funding.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-16 rounded-xl overflow-hidden">
          <UnsplashImage
            id={UNSPLASH_IMAGES.hero.main}
            alt="Modern feature management dashboard"
            width={1200}
            height={675}
            className="w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}

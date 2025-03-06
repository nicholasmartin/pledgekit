import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UnsplashImage } from "@/components/ui/unsplash-image"
import { UNSPLASH_IMAGES } from "@/config/images"

export function HeroSection() {
  return (
    <section className="relative isolate px-6 pt-14 lg:px-8 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-blue-200 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>
      
      <div className="mx-auto max-w-6xl py-20 sm:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <div className="inline-block bg-blue-50 text-primary font-medium px-4 py-2 rounded-full text-sm mb-6">
              Designed for Canny users
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl mb-6">
              Turn Customer Demand into Development Reality
            </h1>
            <p className="text-xl leading-8 text-muted-foreground italic mb-4">
              Where Canny feature requests meet financial commitment
            </p>
            <p className="text-lg leading-8 text-muted-foreground mb-8">
              Your customers want new features in Canny. You need development resources. 
              PledgeKit bridges the gap with customer-backed feature funding.
            </p>
            <div className="flex items-start gap-x-4">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 rounded-full shadow-lg hover:shadow-xl transition-all">
                  Schedule Demo
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="text-lg px-8 rounded-full border-2 hover:bg-muted/20 transition-all">
                  How It Works
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 flex items-center gap-4">
              <div className="inline-block bg-blue-50 text-primary font-medium px-4 py-2 rounded-full text-sm">
                Early adopter benefits
              </div>
              <p className="text-sm text-muted-foreground">Help shape the future of PledgeKit</p>
            </div>
          </div>
          
          <div className="rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
            <UnsplashImage
              id={UNSPLASH_IMAGES.hero.main}
              alt="Modern Canny feature management dashboard"
              width={1200}
              height={675}
              className="w-full object-cover"
            />
          </div>
        </div>
      </div>
      
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-200 to-primary opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>
    </section>
  )
}

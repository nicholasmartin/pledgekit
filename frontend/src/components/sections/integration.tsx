import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UnsplashImage } from "@/components/ui/unsplash-image"
import { UNSPLASH_IMAGES } from "@/config/images"

export function IntegrationSection() {
  return (
    <div className="py-16">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">
          Seamless Integration with Canny
        </h2>
        <p className="text-center text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
          Perfect for companies already using Canny for feature requests
        </p>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <div className="inline-block bg-blue-50 text-primary font-medium px-4 py-2 rounded-full text-sm mb-6">
                Designed for Canny users
              </div>
              <h3 className="text-2xl font-semibold mb-6">Supercharge your Canny workflow</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-lg">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-primary">✓</span>
                  Direct Canny feature request import
                </li>
                <li className="flex items-center gap-3 text-lg">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-primary">✓</span>
                  Sync status updates back to Canny
                </li>
                <li className="flex items-center gap-3 text-lg">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-primary">✓</span>
                  Maintain your existing Canny workflow
                </li>
                <li className="flex items-center gap-3 text-lg">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-primary">✓</span>
                  Secure Stripe payment processing
                </li>
              </ul>
              <Link href="/register">
                <Button size="lg" className="rounded-full px-8 shadow-md hover:shadow-lg transition-all">See Canny Integration</Button>
              </Link>
            </div>
            
            <div className="rounded-2xl overflow-hidden shadow-xl transform hover:scale-[1.02] transition-all duration-300">
              <UnsplashImage
                id={UNSPLASH_IMAGES.integration.dashboard}
                alt="Integration dashboard showing Canny import process"
                width={1200}
                height={675}
                className="w-full object-cover"
              />
            </div>
          </div>
          
          <div className="mt-16 flex justify-center">
            <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 max-w-md">
              <div className="text-center mb-4">
                <div className="text-center font-bold text-2xl mb-2">Canny</div>
                <p className="text-muted-foreground">
                  PledgeKit is built specifically to enhance your Canny experience. More integrations coming soon!
                </p>
              </div>
              <div className="text-center">
                <div className="inline-block bg-blue-50 text-primary font-medium px-4 py-2 rounded-full text-sm">
                  Early adopter benefits
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

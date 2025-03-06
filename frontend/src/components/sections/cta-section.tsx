import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTASection() {
  return (
    <div className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-6">
          Ready to Transform Your Feature Development?
        </h2>
        <p className="text-center text-lg text-muted-foreground max-w-3xl mx-auto">
          Create an account for free and start validating your Canny feature ideas today
        </p>
      </div>

      <div className="max-w-5xl mx-auto mb-16 bg-gradient-to-br from-blue-50 to-white p-12 rounded-3xl shadow-lg">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-lg">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-primary">✓</span>
                Seamless integration with your Canny boards
              </li>
              <li className="flex items-center gap-3 text-lg">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-primary">✓</span>
                Validate feature demand with real commitments
              </li>
              <li className="flex items-center gap-3 text-lg">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-primary">✓</span>
                Reduce development risk
              </li>
              <li className="flex items-center gap-3 text-lg">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-primary">✓</span>
                Strengthen customer relationships
              </li>
            </ul>

            <Link href="/register">
              <Button size="lg" className="text-lg px-8 rounded-full shadow-lg hover:shadow-xl transition-all">Get Started</Button>
            </Link>

            <p className="mt-6 text-sm text-muted-foreground italic">
              Perfect for SaaS companies using Canny to manage feature requests
            </p>
          </div>
          
          {/* Dashboard preview */}
          <div className="rounded-2xl bg-white p-8 shadow-xl border border-gray-100 text-center">
            <div className="text-sm text-muted-foreground mb-4">Canny integration preview</div>
            <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center text-muted-foreground">
              [Canny integration dashboard preview]
            </div>
            <div className="mt-4 flex justify-between">
              <div className="h-3 w-24 bg-blue-100 rounded-full"></div>
              <div className="h-3 w-16 bg-blue-100 rounded-full"></div>
              <div className="h-3 w-20 bg-blue-100 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="inline-block bg-blue-50 text-primary font-medium px-4 py-2 rounded-full text-sm">
          Be an early adopter and help shape the future of PledgeKit
        </div>
      </div>
    </div>
  )
}

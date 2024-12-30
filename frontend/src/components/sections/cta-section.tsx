import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4 mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">
          Ready to Transform Your Feature Development?
        </h2>

        <div className="max-w-3xl mx-auto mb-12">
          <ul className="text-lg text-muted-foreground space-y-4 mb-8">
            <li>• Validate feature demand with real commitments</li>
            <li>• Reduce development risk</li>
            <li>• Strengthen customer relationships</li>
            <li>• Accelerate growth</li>
          </ul>

          {/* Placeholder for dashboard preview */}
          <div className="rounded-lg bg-muted/30 p-8 text-center text-sm text-muted-foreground mb-12">
            [Product interface preview]
          </div>

          <Link href="/register">
            <Button size="lg" className="text-lg px-8">Get Started</Button>
          </Link>

          <p className="mt-8 text-sm text-muted-foreground italic">
            Perfect for established SaaS companies with 100+ customers looking to innovate efficiently.
          </p>
        </div>
      </div>
    </section>
  )
}

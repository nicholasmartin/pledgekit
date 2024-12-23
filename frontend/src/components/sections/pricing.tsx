import { Button } from "@/components/ui/button"
import Link from "next/link"

const tiers = [
  {
    name: 'Starter',
    id: 'tier-starter',
    price: '$90',
    period: '/year',
    description: 'Perfect for small teams starting to validate feature ideas.',
    features: [
      'Up to 3 active projects',
      'Basic analytics',
      'Email support',
      'Standard integrations',
    ],
    cta: 'Start with Starter',
    mostPopular: false,
  },
  {
    name: 'Growth',
    id: 'tier-growth',
    price: '$290',
    period: '/year',
    description: 'For growing companies with an active user base.',
    features: [
      'Up to 10 active projects',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'API access',
    ],
    cta: 'Start with Growth',
    mostPopular: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    price: '$990',
    period: '/year',
    description: 'Custom solutions for large organizations.',
    features: [
      'Unlimited projects',
      'Enterprise analytics',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'Custom contracts',
    ],
    cta: 'Contact Sales',
    mostPopular: false,
  },
]

export function PricingSection() {
  return (
    <div className="py-24 sm:py-32" id="pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground">
          Choose the perfect plan for your needs. All plans include a 14-day free trial.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 ring-1 ring-gray-200 ${
                tier.mostPopular ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              <h3 className="text-lg font-semibold leading-8">{tier.name}</h3>
              <p className="mt-4 text-sm leading-6">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                <span className="text-sm font-semibold leading-6">{tier.period}</span>
              </p>
              <Link href="/register" className="mt-6 block">
                <Button
                  variant={tier.mostPopular ? "secondary" : "default"}
                  className="w-full"
                >
                  {tier.cta}
                </Button>
              </Link>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <span className="text-primary">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

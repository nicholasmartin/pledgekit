export function FeaturesSection() {
  const features = [
    {
      name: 'User-Backed Features',
      description: 'Let your users vote with their wallets. Only build features with proven demand.',
      icon: '💡',
    },
    {
      name: 'Flexible Pledging',
      description: 'Create custom pledge tiers with unique benefits for different user segments.',
      icon: '🎯',
    },
    {
      name: 'Risk-Free Development',
      description: 'Secure funding before development begins. No more uncertain feature investments.',
      icon: '🛡️',
    },
    {
      name: 'Engagement Analytics',
      description: 'Track user interest and engagement with detailed analytics and insights.',
      icon: '📊',
    },
  ]

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Better Feature Planning</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to validate and fund new features
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Stop guessing what features to build next. Let your users show you exactly what they want and are willing to pay for.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <span className="text-4xl">{feature.icon}</span>
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

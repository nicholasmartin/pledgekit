const features = [
  {
    icon: "💡",
    title: "AI-Powered Setup",
    description: "Import existing feature requests automatically. Group similar items. Start fast."
  },
  {
    icon: "🎯",
    title: "Validated Development",
    description: "Real financial commitments, not just upvotes. Know it's worth building."
  },
  {
    icon: "⭐",
    title: "Reputation System",
    description: "Build trust through successful delivery. Showcase your reliability."
  },
  {
    icon: "🔒",
    title: "Flexible Privacy",
    description: "Public or private funding campaigns. You control visibility."
  },
  {
    icon: "⚡",
    title: "Quick Implementation",
    description: "30-90 day development cycles. Keep momentum strong."
  },
  {
    icon: "💪",
    title: "Customer Relationships",
    description: "Transform feature requests into collaborative development."
  },
  {
    icon: "🏆",
    title: "Exclusive Benefits",
    description: "Reward backers with lifetime access, discounts, and recognition."
  },
  {
    icon: "📈",
    title: "Clear Analytics",
    description: "Track pledges, engagement, and development progress."
  }
]

export function FeaturesGridSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">
          Why Leading SaaS Companies Choose PledgeKit
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-lg bg-background hover:shadow-lg transition-shadow duration-200"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

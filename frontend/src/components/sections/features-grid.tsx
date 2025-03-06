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
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-6">
        Why Leading SaaS Companies Choose PledgeKit
      </h2>
      <p className="text-center text-lg text-muted-foreground max-w-3xl mx-auto mb-16">
        Advanced features professional product teams love
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-16 text-center">
        <div className="inline-block bg-blue-50 text-primary font-medium px-4 py-2 rounded-full text-sm mb-4">
          Much more than just a feature request tool
        </div>
      </div>
    </div>
  )
}

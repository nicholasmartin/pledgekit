interface Benefit {
  title: string
  description: string
  icon: string
}

const benefits: Benefit[] = [
  {
    title: "De-Risk Development",
    description: "Only build features that users have financially committed to. Eliminate the guesswork from your roadmap prioritization.",
    icon: "🎯"
  },
  {
    title: "Strengthen User Relationships",
    description: "Transform feature requests into collaborative development opportunities. Build trust through transparent communication.",
    icon: "🤝"
  },
  {
    title: "Accelerate Growth",
    description: "Use pre-validated feature funding to expand your product faster. Keep your development aligned with market demands.",
    icon: "📈"
  },
  {
    title: "Optimize Resources",
    description: "Focus your development resources on features that have proven demand. Maximize the return on your development investment.",
    icon: "⚡"
  }
]

export function BenefitsSection() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {benefits.map((benefit, index) => (
        <div 
          key={index}
          className="p-6 rounded-lg bg-background hover:shadow-lg transition-shadow duration-200"
        >
          <div className="text-4xl mb-4">{benefit.icon}</div>
          <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
          <p className="text-muted-foreground">{benefit.description}</p>
        </div>
      ))}
    </div>
  )
}

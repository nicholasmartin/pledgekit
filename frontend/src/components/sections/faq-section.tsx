import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FAQ {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: "How long do funding campaigns typically run?",
    answer: "Funding campaigns on PledgeKit run for a maximum of 30 days. This timeframe helps create urgency and ensures quick validation of feature demands. You can set shorter durations if desired, but we've found 30 days to be the sweet spot for successful campaigns."
  },
  {
    question: "What happens if a feature doesn't reach its funding goal?",
    answer: "If a feature doesn't reach its funding goal, no payments are processed and pledges are automatically cancelled. This ensures zero risk for both you and your users. You can choose to relaunch the campaign later with adjusted goals or different benefits."
  },
  {
    question: "Can we run private funding campaigns?",
    answer: "Yes! PledgeKit supports both public and private campaigns. Private campaigns are perfect for enterprise features or when you want to limit participation to specific customer segments. You control who can view and pledge to your campaigns."
  },
  {
    question: "How does payment processing work?",
    answer: "We use Stripe for secure payment processing. Pledges are only charged if the campaign reaches its goal. Funds are held in escrow until the feature is delivered, protecting both developers and backers."
  },
  {
    question: "Can we import our existing feature requests?",
    answer: "Absolutely! PledgeKit integrates with popular tools like GitHub Issues, Canny, and ProductBoard. Our AI-powered import system automatically categorizes and groups similar requests, making setup quick and easy."
  },
  {
    question: "What kind of analytics do you provide?",
    answer: "We provide comprehensive analytics including pledge tracking, engagement metrics, conversion rates, and backer demographics. You'll have full visibility into campaign performance and user interest levels."
  }
]

export function FAQSection() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-left">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

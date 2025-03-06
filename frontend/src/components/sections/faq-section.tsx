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
    question: "How does the Canny integration work?",
    answer: "PledgeKit currently integrates exclusively with Canny. Our seamless integration allows you to import feature requests directly from your Canny boards, maintain your existing workflow, and sync status updates back to Canny. This makes PledgeKit the perfect companion for teams already using Canny for feature request management."
  },
  {
    question: "Will you support other tools besides Canny in the future?",
    answer: "Yes! While we currently focus on providing the best possible integration with Canny, we're actively developing integrations with other popular feature request tools. As an early adopter, you'll have the opportunity to help shape these future integrations based on your needs."
  },
  {
    question: "What kind of analytics do you provide?",
    answer: "We provide comprehensive analytics including pledge tracking, engagement metrics, conversion rates, and backer demographics. You'll have full visibility into campaign performance and user interest levels."
  }
]

export function FAQSection() {
  return (
    <Accordion type="single" collapsible className="w-full divide-y divide-gray-100">
      {faqs.map((faq, index) => (
        <AccordionItem 
          key={index} 
          value={`item-${index}`}
          className="border-none py-4"
        >
          <AccordionTrigger className="text-left hover:no-underline py-2 text-lg font-medium">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pt-2 pb-4 text-base">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const categories = [
  { id: "dev-tools", label: "Developer Tools", count: 12 },
  { id: "productivity", label: "Productivity", count: 8 },
  { id: "analytics", label: "Analytics", count: 6 },
  { id: "ai-ml", label: "AI & Machine Learning", count: 15 },
  { id: "security", label: "Security", count: 9 },
  { id: "integration", label: "Integration", count: 7 },
];

export default function CategoryFilter() {
  return (
    <Accordion type="single" collapsible defaultValue="categories">
      <AccordionItem value="categories" className="border-none">
        <AccordionTrigger className="py-2 hover:no-underline">
          <span className="text-sm font-medium">Categories</span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 pt-1">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox id={category.id} />
                <Label
                  htmlFor={category.id}
                  className="text-sm flex-1 cursor-pointer"
                >
                  {category.label}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {category.count}
                </span>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

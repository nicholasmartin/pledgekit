"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const statuses = [
  { id: "active", label: "Active", count: 25 },
  { id: "ending-soon", label: "Ending Soon", count: 8 },
  { id: "fully-funded", label: "Fully Funded", count: 12 },
  { id: "completed", label: "Completed", count: 45 },
];

export default function StatusFilter() {
  return (
    <Accordion type="single" collapsible defaultValue="status">
      <AccordionItem value="status" className="border-none">
        <AccordionTrigger className="py-2 hover:no-underline">
          <span className="text-sm font-medium">Status</span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 pt-1">
            {statuses.map((status) => (
              <div key={status.id} className="flex items-center space-x-2">
                <Checkbox id={status.id} />
                <Label
                  htmlFor={status.id}
                  className="text-sm flex-1 cursor-pointer"
                >
                  {status.label}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {status.count}
                </span>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

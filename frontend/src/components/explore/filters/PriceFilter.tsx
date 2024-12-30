"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function PriceFilter() {
  const [range, setRange] = useState([0, 1000]);

  return (
    <Accordion type="single" collapsible defaultValue="price">
      <AccordionItem value="price" className="border-none">
        <AccordionTrigger className="py-2 hover:no-underline">
          <span className="text-sm font-medium">Price Range</span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-1">
            <Slider
              defaultValue={[0, 1000]}
              max={1000}
              step={10}
              value={range}
              onValueChange={setRange}
              className="my-6"
            />
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label className="text-xs">Min ($)</Label>
                <Input
                  type="number"
                  value={range[0]}
                  onChange={(e) =>
                    setRange([Number(e.target.value), range[1]])
                  }
                  className="h-8"
                />
              </div>
              <div className="grid flex-1 gap-2">
                <Label className="text-xs">Max ($)</Label>
                <Input
                  type="number"
                  value={range[1]}
                  onChange={(e) =>
                    setRange([range[0], Number(e.target.value)])
                  }
                  className="h-8"
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

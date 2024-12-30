"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import SearchInput from "../filters/SearchInput";
import CategoryFilter from "../filters/CategoryFilter";
import StatusFilter from "../filters/StatusFilter";
import PriceFilter from "../filters/PriceFilter";

export default function FilterSidebar() {
  return (
    <div className="bg-card rounded-lg border">
      {/* Search Section */}
      <div className="p-4 border-b">
        <SearchInput />
      </div>
      
      {/* Filters Section */}
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="p-4 space-y-6">
          <CategoryFilter />
          <Separator className="my-4" />
          <StatusFilter />
          <Separator className="my-4" />
          <PriceFilter />
        </div>
      </ScrollArea>

      {/* Clear Filters Button */}
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full">
          Clear Filters
        </Button>
      </div>
    </div>
  );
}

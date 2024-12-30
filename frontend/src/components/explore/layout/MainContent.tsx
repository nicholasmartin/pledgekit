"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainContentProps {
  children: React.ReactNode;
  view?: 'projects' | 'companies';
}

export default function MainContent({ children, view = 'projects' }: MainContentProps) {
  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center gap-2 border rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort Dropdown */}
          <Select defaultValue="trending">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="ending">Ending Soon</SelectItem>
              <SelectItem value="funded">Most Funded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing 12 results
        </div>
      </div>

      {/* Grid Content */}
      <div className={cn(
        "grid gap-6",
        view === 'companies' 
          ? "grid-cols-1 md:grid-cols-2" // 2 columns max for companies
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" // 4 columns max for projects
      )}>
        {children}
      </div>
    </div>
  );
}

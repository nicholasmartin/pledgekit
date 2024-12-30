"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import FilterSidebar from "./FilterSidebar";

interface ExploreLayoutProps {
  children: React.ReactNode;
  activeView?: 'projects' | 'companies';
  onViewChange?: (view: 'projects' | 'companies') => void;
}

export default function ExploreLayout({ 
  children,
  activeView = 'projects',
  onViewChange
}: ExploreLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation Tabs */}
      <Tabs 
        defaultValue={activeView} 
        className="w-full mb-8"
        onValueChange={(value) => onViewChange?.(value as 'projects' | 'companies')}
      >
        <TabsList className="w-full max-w-[400px]">
          <TabsTrigger value="projects" className="w-1/2">
            Projects
          </TabsTrigger>
          <TabsTrigger value="companies" className="w-1/2">
            Companies
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main Content Area */}
      <div className="flex gap-8">
        {/* Sidebar - will be collapsible on mobile */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <FilterSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

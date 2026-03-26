import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  major?: string;
  cumulativeGPA?: number;
  onMajorUpdate: (major: string) => void;
  onGpaGoalClick: () => void;
}

export function AppShell({ children, major, cumulativeGPA, onMajorUpdate, onGpaGoalClick }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop/Tablet Sidebar */}
      <Sidebar major={major} onMajorUpdate={onMajorUpdate} onGpaGoalClick={onGpaGoalClick} />

      {/* Mobile Navigation */}
      <MobileNav
        cumulativeGPA={cumulativeGPA}
        major={major}
        onGpaGoalClick={onGpaGoalClick}
        onMajorUpdate={onMajorUpdate}
      />

      {/* Main Content Area */}
      <main
        className={cn(
          "min-h-screen transition-[margin] duration-300 ease-out",
          // Desktop: full sidebar (280px)
          "lg:ml-[280px]",
          // Tablet: collapsed sidebar (80px)
          "md:ml-[80px]",
          // Mobile: no margin (sidebar hidden)
          "ml-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}

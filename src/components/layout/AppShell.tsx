import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { useLayout } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { sidebarCollapsed } = useLayout();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop/Tablet Sidebar */}
      <Sidebar />

      {/* Mobile Navigation */}
      <MobileNav />

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

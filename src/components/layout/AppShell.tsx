import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { MobileBottomTabs } from "./MobileBottomTabs";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  major?: string;
  cumulativeGPA?: number;
  onMajorUpdate: (major: string) => void;
  onGpaGoalClick: () => void;
  onUploadClick: () => void;
  onExportClick: () => void;
}

export function AppShell({
  children,
  major,
  cumulativeGPA,
  onMajorUpdate,
  onGpaGoalClick,
  onUploadClick,
  onExportClick,
}: AppShellProps) {
  return (
    <div className="min-h-screen">
      {/* Desktop/Tablet Sidebar */}
      <Sidebar
        major={major}
        onMajorUpdate={onMajorUpdate}
        onGpaGoalClick={onGpaGoalClick}
        onUploadClick={onUploadClick}
        onExportClick={onExportClick}
      />

      {/* Mobile Navigation - Header + Drawer */}
      <MobileNav
        cumulativeGPA={cumulativeGPA}
        major={major}
        onGpaGoalClick={onGpaGoalClick}
        onMajorUpdate={onMajorUpdate}
        onUploadClick={onUploadClick}
        onExportClick={onExportClick}
      />

      {/* Mobile Bottom Tab Bar */}
      <MobileBottomTabs
        onUploadClick={onUploadClick}
        onGpaGoalClick={onGpaGoalClick}
      />

      {/* Main Content Area */}
      <main
        className={cn(
          "min-h-screen transition-[margin] duration-300 ease-out",
          // Desktop: full sidebar (280px)
          "lg:ml-[280px]",
          // Tablet: collapsed sidebar (80px)
          "md:ml-[80px]",
          // Mobile: no margin (sidebar hidden), but add bottom padding for tab bar
          "ml-0",
          "pb-20 md:pb-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}

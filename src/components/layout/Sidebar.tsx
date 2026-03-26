import { GraduationCap } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./SidebarNav";
import { SidebarFooter } from "./SidebarFooter";

interface SidebarProps {
  major?: string;
  onMajorUpdate: (major: string) => void;
  onGpaGoalClick: () => void;
}

export function Sidebar({ major, onMajorUpdate, onGpaGoalClick }: SidebarProps) {
  const { sidebarCollapsed } = useLayout();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-40",
        "bg-surface-container-low dark:bg-surface-container",
        "border-r border-border/5",
        "transition-[width] duration-300 ease-out",
        // Desktop: full sidebar
        "lg:w-[280px]",
        // Tablet: collapsed sidebar
        "md:w-[80px]",
        // Mobile: hidden
        "max-md:hidden"
      )}
    >
      {/* Top: Branding/Logo */}
      <div className="h-16 px-6 flex items-center gap-3 shrink-0 max-md:px-4">
        <GraduationCap className="h-7 w-7 text-primary shrink-0" />
        <span className="text-xl font-bold tracking-tight md:max-lg:hidden">
          Gradify
        </span>
      </div>

      {/* Middle: Navigation (flex-grow) */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <SidebarNav onGpaGoalClick={onGpaGoalClick} />
      </nav>

      {/* Bottom: Footer */}
      <div className="shrink-0 p-4 border-t border-border/5">
        <SidebarFooter major={major} onMajorUpdate={onMajorUpdate} />
      </div>
    </aside>
  );
}

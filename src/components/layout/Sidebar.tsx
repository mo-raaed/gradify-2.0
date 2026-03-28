import { cn } from "@/lib/utils";
import { GradifyLogo } from "@/components/branding/GradifyLogo";
import { SidebarNav } from "./SidebarNav";
import { SidebarFooter } from "./SidebarFooter";

interface SidebarProps {
  major?: string;
  onMajorUpdate: (major: string) => void;
  onGpaGoalClick: () => void;
  onUploadClick: () => void;
  onExportClick: () => void;
}

export function Sidebar({ major, onMajorUpdate, onGpaGoalClick, onUploadClick, onExportClick }: SidebarProps) {
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
      <div className="h-16 px-6 flex items-center shrink-0 max-md:px-4 min-h-16">
        <GradifyLogo
          size="lg"
          textClassName="md:max-lg:hidden"
        />
      </div>

      {/* Middle: Navigation (flex-grow) */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <SidebarNav
          onGpaGoalClick={onGpaGoalClick}
          onUploadClick={onUploadClick}
          onExportClick={onExportClick}
        />
      </nav>

      {/* Bottom: Footer */}
      <div className="shrink-0 p-4 border-t border-border/5">
        <SidebarFooter major={major} onMajorUpdate={onMajorUpdate} />
      </div>
    </aside>
  );
}

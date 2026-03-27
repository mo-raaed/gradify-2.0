import { FileText, Target, Upload, Download } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: "scroll" | "dialog" | "upload" | "export";
}

const navItems: NavItem[] = [
  {
    id: "transcript",
    label: "Transcript",
    icon: FileText,
    action: "scroll",
  },
  {
    id: "gpa-goal",
    label: "GPA Goal",
    icon: Target,
    action: "dialog",
  },
];

interface SidebarNavProps {
  onGpaGoalClick?: () => void;
  onUploadClick?: () => void;
  onExportClick?: () => void;
}

export function SidebarNav({ onGpaGoalClick, onUploadClick, onExportClick }: SidebarNavProps) {
  const { setActiveFilter, setMobileNavOpen } = useLayout();
  const [activeNav, setActiveNav] = useState("transcript");

  const handleNavClick = (item: NavItem) => {
    setActiveNav(item.id);

    if (item.action === "scroll") {
      // Scroll to top for "Transcript"
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveFilter("all");
    } else if (item.action === "dialog") {
      // Open GPA Goal dialog
      if (onGpaGoalClick) {
        onGpaGoalClick();
      }
    }

    // Close mobile nav if open
    setMobileNavOpen(false);
  };

  return (
    <div className="space-y-2">
      {/* Navigation Items */}
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeNav === item.id;

        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-[1rem]",
              "transition-all duration-200",
              "group relative",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                isActive && "text-primary"
              )}
            />
            <span className="text-sm font-medium md:max-lg:hidden">
              {item.label}
            </span>

            {/* Active indicator */}
            {isActive && (
              <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary md:max-lg:right-1/2 md:max-lg:translate-x-1/2" />
            )}
          </button>
        );
      })}

      {/* Divider */}
      <div className="my-3 border-t border-border/5" />

      {/* Upload Transcript Button - Prominent with glow */}
      <button
        onClick={() => {
          onUploadClick?.();
          setMobileNavOpen(false);
        }}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-3 rounded-full",
          "bg-gradient-to-r from-primary to-[var(--color-primary-container)]",
          "text-primary-foreground font-semibold",
          "transition-all duration-300",
          "hover:shadow-[0_0_20px_rgba(129,174,255,0.4)]",
          "btn-glow"
        )}
      >
        <Upload className="h-5 w-5 shrink-0" />
        <span className="text-sm md:max-lg:hidden">Upload Transcript</span>
      </button>

      {/* Export Button - Outline style */}
      <button
        onClick={() => {
          onExportClick?.();
          setMobileNavOpen(false);
        }}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-full",
          "border border-border/15",
          "text-muted-foreground hover:text-foreground",
          "transition-all duration-200",
          "hover:bg-secondary"
        )}
      >
        <Download className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium md:max-lg:hidden">Export Data</span>
      </button>
    </div>
  );
}

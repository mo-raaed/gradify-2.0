import { FileText, CheckCircle2, Calendar, Target } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: "scroll" | "filter" | "dialog";
  filter?: "all" | "completed" | "planned";
}

const navItems: NavItem[] = [
  {
    id: "transcript",
    label: "Transcript",
    icon: FileText,
    action: "scroll",
  },
  {
    id: "completed",
    label: "Completed",
    icon: CheckCircle2,
    action: "filter",
    filter: "completed",
  },
  {
    id: "planned",
    label: "Planned",
    icon: Calendar,
    action: "filter",
    filter: "planned",
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
}

export function SidebarNav({ onGpaGoalClick }: SidebarNavProps) {
  const { activeFilter, setActiveFilter, setMobileNavOpen } = useLayout();
  const [activeNav, setActiveNav] = useState("transcript");

  const handleNavClick = (item: NavItem) => {
    setActiveNav(item.id);

    if (item.action === "scroll") {
      // Scroll to top for "Transcript"
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveFilter("all");
    } else if (item.action === "filter" && item.filter) {
      // Set filter for "Completed" or "Planned"
      setActiveFilter(item.filter);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    <div className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.action === "filter"
            ? activeFilter === item.filter
            : activeNav === item.id;

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
    </div>
  );
}

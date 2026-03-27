import { FileText, Upload, Target, Search } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";

interface MobileBottomTabsProps {
  onUploadClick: () => void;
  onGpaGoalClick: () => void;
}

export function MobileBottomTabs({ onUploadClick, onGpaGoalClick }: MobileBottomTabsProps) {
  const { mobileSearchOpen, setMobileSearchOpen } = useLayout();

  const tabs = [
    {
      label: "Home",
      icon: FileText,
      onClick: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    },
    {
      label: "Upload",
      icon: Upload,
      onClick: onUploadClick,
    },
    {
      label: "GPA Goal",
      icon: Target,
      onClick: onGpaGoalClick,
    },
    {
      label: "Search",
      icon: Search,
      onClick: () => setMobileSearchOpen(!mobileSearchOpen),
      active: mobileSearchOpen,
    },
  ];

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "bg-background/70 backdrop-blur-xl",
        "border-t border-border/5",
        "pb-[env(safe-area-inset-bottom)]"
      )}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={tab.onClick}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full",
              "transition-colors duration-200",
              tab.active
                ? "text-primary"
                : "text-muted-foreground active:text-primary"
            )}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

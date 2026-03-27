import { FileText, Target, Upload, Download } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  onGpaGoalClick?: () => void;
  onUploadClick?: () => void;
  onExportClick?: () => void;
}

export function SidebarNav({ onGpaGoalClick, onUploadClick, onExportClick }: SidebarNavProps) {
  const { setActiveFilter, setMobileNavOpen } = useLayout();

  return (
    <div className="space-y-2">
      {/* Transcript nav item */}
      <button
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          setActiveFilter("all");
          setMobileNavOpen(false);
        }}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-[1rem]",
          "transition-all duration-200",
          "group relative",
          "bg-primary/10 text-primary"
        )}
      >
        <FileText className="h-5 w-5 shrink-0 text-primary" />
        <span className="text-sm font-medium md:max-lg:hidden">
          Transcript
        </span>
        <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary md:max-lg:right-1/2 md:max-lg:translate-x-1/2" />
      </button>

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

      {/* GPA Goal Button - Special gradient accent */}
      <button
        onClick={() => {
          onGpaGoalClick?.();
          setMobileNavOpen(false);
        }}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-full",
          "bg-gradient-to-r from-amber-500/20 to-orange-500/20",
          "text-amber-400 font-medium",
          "transition-all duration-300",
          "hover:from-amber-500/30 hover:to-orange-500/30",
          "hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]"
        )}
      >
        <Target className="h-5 w-5 shrink-0" />
        <span className="text-sm md:max-lg:hidden">GPA Goal</span>
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

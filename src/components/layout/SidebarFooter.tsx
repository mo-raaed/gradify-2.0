import { UserButton } from "@clerk/clerk-react";
import { ThemeToggle } from "../ThemeToggle";
import { cn } from "@/lib/utils";

interface SidebarFooterProps {
  major?: string;
  onMajorEdit?: () => void;
}

export function SidebarFooter({ major, onMajorEdit }: SidebarFooterProps) {
  return (
    <div className="space-y-3">
      {/* Major Text - only show on desktop */}
      {major && (
        <div className="px-2 py-1.5 rounded-lg bg-secondary/50 md:max-lg:hidden">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
            Major
          </p>
          <p className="text-sm font-medium truncate">{major}</p>
        </div>
      )}

      {/* Theme Toggle + User Button Row */}
      <div className="flex items-center justify-between gap-2">
        <ThemeToggle />
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </div>
  );
}

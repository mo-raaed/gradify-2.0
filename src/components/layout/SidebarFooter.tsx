import { UserButton, useUser } from "@clerk/clerk-react";
import { ThemeToggle } from "../ThemeToggle";
import { MajorEditor } from "../MajorEditor";

interface SidebarFooterProps {
  major?: string;
  onMajorUpdate: (major: string) => void;
}

export function SidebarFooter({ major, onMajorUpdate }: SidebarFooterProps) {
  const { user } = useUser();
  const displayName = user?.firstName || user?.username || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "";

  return (
    <div className="space-y-3">
      {/* Major Editor - only show on desktop */}
      <div className="md:max-lg:hidden">
        <MajorEditor major={major} onUpdate={onMajorUpdate} />
      </div>

      {/* Theme Toggle + User Info + Avatar Row */}
      <div className="flex items-center justify-between gap-2">
        <ThemeToggle />
        <div className="flex items-center gap-2 min-w-0 md:max-lg:hidden">
          <span className="text-xs font-medium text-muted-foreground truncate max-w-[120px]">
            {displayName}
          </span>
        </div>
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

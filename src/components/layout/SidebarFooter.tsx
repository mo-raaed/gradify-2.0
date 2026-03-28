import { UserButton, useUser } from "@clerk/clerk-react";
import { ThemeToggle } from "../ThemeToggle";
import { MajorEditor } from "../MajorEditor";

interface SidebarFooterProps {
  major?: string;
  onMajorUpdate: (major: string) => void;
  hideTopSection?: boolean;
}

export function SidebarFooter({ major, onMajorUpdate, hideTopSection = false }: SidebarFooterProps) {
  const { user } = useUser();
  const displayName = user?.firstName || user?.username || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "";

  return (
    <div className="space-y-3">
      {/* Major Editor - only show on desktop, hide when in mobile drawer */}
      {!hideTopSection && (
        <div className="md:max-lg:hidden">
          <MajorEditor major={major} onUpdate={onMajorUpdate} />
        </div>
      )}

      {/* Theme Toggle + User Info + Avatar Row */}
      {!hideTopSection && (
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
      )}

      {/* When hideTopSection is true, just show the user button (for mobile drawer) */}
      {hideTopSection && (
        <div className="flex items-center gap-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
          <span className="text-xs font-medium text-muted-foreground truncate max-w-[120px]">
            {displayName}
          </span>
        </div>
      )}
    </div>
  );
}

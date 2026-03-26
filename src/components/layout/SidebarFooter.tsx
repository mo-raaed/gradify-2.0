import { UserButton } from "@clerk/clerk-react";
import { ThemeToggle } from "../ThemeToggle";
import { MajorEditor } from "../MajorEditor";

interface SidebarFooterProps {
  major?: string;
  onMajorUpdate: (major: string) => void;
}

export function SidebarFooter({ major, onMajorUpdate }: SidebarFooterProps) {
  return (
    <div className="space-y-3">
      {/* Major Editor - only show on desktop */}
      <div className="md:max-lg:hidden">
        <MajorEditor major={major} onUpdate={onMajorUpdate} />
      </div>

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

import { Menu, GraduationCap, X, Download } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GpaDisplay } from "../GpaDisplay";
import { ThemeToggle } from "../ThemeToggle";
import { MajorEditor } from "../MajorEditor";
import { UserButton, useUser } from "@clerk/clerk-react";

interface MobileNavProps {
  cumulativeGPA?: number;
  major?: string;
  onGpaGoalClick: () => void;
  onMajorUpdate: (major: string) => void;
  onUploadClick: () => void;
  onExportClick: () => void;
}

export function MobileNav({ cumulativeGPA, major, onMajorUpdate, onExportClick }: MobileNavProps) {
  const { mobileNavOpen, setMobileNavOpen } = useLayout();
  const { user } = useUser();
  const displayName = user?.firstName || user?.username || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "";

  return (
    <>
      {/* Sticky mobile header - only visible on mobile */}
      <header className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-background/70 backdrop-blur-xl border-b border-border/5 flex items-center justify-between px-4 md:hidden">
        {/* Hamburger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span className="font-bold">Gradify</span>
        </div>

        {/* Cumulative GPA */}
        {cumulativeGPA !== undefined ? (
          <div className="scale-90">
            <GpaDisplay gpa={cumulativeGPA} label="GPA" size="sm" variant="primary" />
          </div>
        ) : (
          <div className="w-10" />
        )}
      </header>

      {/* Add padding to body content on mobile to account for fixed header */}
      <div className="h-[60px] md:hidden" />

      {/* Drawer with secondary navigation (primary actions moved to bottom tabs) */}
      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent
          className="fixed left-2 top-0 translate-x-0 translate-y-0 h-screen w-[280px] max-w-none rounded-none rounded-r-[2rem] p-0 border-r border-border/5 z-50
          transition-transform duration-200 ease-out
          data-[state=open]:animate-none data-[state=closed]:animate-none
          data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0
          data-[state=closed]:translate-y-0 data-[state=open]:translate-y-0
          overflow-x-hidden"
          hideClose
        >
          <div className="h-full flex flex-col overflow-x-hidden">
            {/* Header */}
            <div className="h-16 px-6 flex items-center justify-between shrink-0 border-b border-border/5">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-7 w-7 text-primary" />
                <span className="text-xl font-bold tracking-tight">Gradify</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileNavOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Secondary Navigation Items */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-2">
              {/* Transcript / Home */}
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setMobileNavOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[1rem] transition-all duration-200 bg-primary/10 text-primary"
              >
                <GraduationCap className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-medium">Transcript</span>
              </button>

              <div className="my-3 border-t border-border/5" />

              {/* Export Button */}
              <button
                onClick={() => {
                  onExportClick();
                  setMobileNavOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full border border-border/15 text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-secondary"
              >
                <Download className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">Export Data</span>
              </button>
            </nav>

            {/* Footer - Major Editor + Theme + Account */}
            <div className="shrink-0 p-4 border-t border-border/5 space-y-3">
              <MajorEditor major={major} onUpdate={onMajorUpdate} />
              <div className="flex items-center justify-between gap-2">
                <ThemeToggle />
                <div className="flex items-center gap-2">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8",
                      },
                    }}
                  />
                  <span className="text-xs font-medium text-muted-foreground truncate max-w-[100px]">
                    {displayName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

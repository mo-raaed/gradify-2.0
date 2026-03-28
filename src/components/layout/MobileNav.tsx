import { Menu, X } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GradifyLogo } from "@/components/branding/GradifyLogo";
import { SidebarNav } from "./SidebarNav";
import { SidebarFooter } from "./SidebarFooter";
import { GpaDisplay } from "../GpaDisplay";

interface MobileNavProps {
  cumulativeGPA?: number;
  major?: string;
  onGpaGoalClick: () => void;
  onMajorUpdate: (major: string) => void;
  onUploadClick: () => void;
  onExportClick: () => void;
}

export function MobileNav({ cumulativeGPA, major, onGpaGoalClick, onMajorUpdate, onUploadClick, onExportClick }: MobileNavProps) {
  const { mobileNavOpen, setMobileNavOpen } = useLayout();

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
        <div className="flex items-center justify-center min-w-0 flex-1 px-1">
          <GradifyLogo size="sm" className="justify-center" />
        </div>

        {/* Cumulative GPA (spacer matches hamburger width when absent so logo stays centered) */}
        {cumulativeGPA !== undefined ? (
          <div className="scale-90 shrink-0">
            <GpaDisplay gpa={cumulativeGPA} label="GPA" size="sm" variant="primary" />
          </div>
        ) : (
          <div className="w-10 shrink-0" aria-hidden />
        )}
      </header>

      {/* Add padding to body content on mobile to account for fixed header */}
      <div className="h-[60px] md:hidden" />

      {/* Drawer with sidebar content */}
      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent
          className="fixed left-0 top-0 h-screen w-[280px] rounded-none rounded-r-[2rem] p-0 border-r border-border/5 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
          hideClose
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-16 px-6 flex items-center justify-between shrink-0 border-b border-border/5 gap-2">
              <GradifyLogo size="md" className="min-w-0" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileNavOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <SidebarNav
                onGpaGoalClick={onGpaGoalClick}
                onUploadClick={onUploadClick}
                onExportClick={onExportClick}
              />
            </nav>

            {/* Footer */}
            <div className="shrink-0 p-4 border-t border-border/5">
              <SidebarFooter major={major} onMajorUpdate={onMajorUpdate} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

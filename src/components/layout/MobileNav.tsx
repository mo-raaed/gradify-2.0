import { Menu, GraduationCap, X } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./SidebarNav";
import { SidebarFooter } from "./SidebarFooter";
import { GpaDisplay } from "../GpaDisplay";

interface MobileNavProps {
  cumulativeGPA?: number;
  major?: string;
  onGpaGoalClick?: () => void;
}

export function MobileNav({ cumulativeGPA, major, onGpaGoalClick }: MobileNavProps) {
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
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span className="font-bold">Gradify</span>
        </div>

        {/* Cumulative GPA */}
        {cumulativeGPA !== undefined && (
          <div className="scale-90">
            <GpaDisplay gpa={cumulativeGPA} label="GPA" size="sm" variant="primary" />
          </div>
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

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <SidebarNav onGpaGoalClick={onGpaGoalClick} />
            </nav>

            {/* Footer */}
            <div className="shrink-0 p-4 border-t border-border/5">
              <SidebarFooter major={major} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

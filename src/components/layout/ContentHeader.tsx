import { GlobalSearch } from "../search/GlobalSearch";
import { useLayout } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";

export function ContentHeader() {
  const { mobileSearchOpen } = useLayout();

  return (
    <>
      {/* Desktop header - always visible */}
      <header className="sticky top-0 z-30 h-[80px] bg-background/70 backdrop-blur-xl border-b border-border/5 items-center justify-between px-12 max-lg:px-8 max-md:px-4 hidden md:flex">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
          <span className="text-foreground font-medium truncate">
            Transcript
          </span>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-8 max-lg:max-w-sm">
          <GlobalSearch />
        </div>

        {/* Right: spacer to keep search centered */}
        <div className="shrink-0 w-20" />
      </header>

      {/* Mobile search bar - slides in when toggled from bottom tab */}
      <div
        className={cn(
          "fixed left-0 right-0 top-[60px] z-30 bg-background/70 backdrop-blur-xl border-b border-border/5 px-4 py-3 md:hidden",
          "transition-[transform,opacity] duration-200 ease-out",
          mobileSearchOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
        )}
        aria-hidden={!mobileSearchOpen}
      >
        <GlobalSearch isOpen={mobileSearchOpen} autoFocus={mobileSearchOpen} />
      </div>
    </>
  );
}

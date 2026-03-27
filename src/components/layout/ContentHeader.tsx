import { GlobalSearch } from "../search/GlobalSearch";
import { useLayout } from "@/context/LayoutContext";

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
      {mobileSearchOpen && (
        <div className="sticky top-[60px] z-30 bg-background/70 backdrop-blur-xl border-b border-border/5 px-4 py-3 md:hidden">
          <GlobalSearch />
        </div>
      )}
    </>
  );
}

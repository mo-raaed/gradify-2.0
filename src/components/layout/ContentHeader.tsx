import { GlobalSearch } from "../search/GlobalSearch";

export function ContentHeader() {
  return (
    <header className="sticky top-0 z-30 h-[80px] bg-background/70 backdrop-blur-xl border-b border-border/5 flex items-center justify-between px-12 max-lg:px-8 max-md:px-4 max-md:hidden">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
        <span className="text-foreground font-medium truncate">
          Transcript
        </span>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-8 max-lg:max-w-sm max-md:hidden">
        <GlobalSearch />
      </div>

      {/* Right: spacer to keep search centered */}
      <div className="shrink-0 w-20" />
    </header>
  );
}

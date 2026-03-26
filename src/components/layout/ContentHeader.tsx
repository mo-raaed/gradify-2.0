import { GlobalSearch } from "../search/GlobalSearch";
import { GpaDisplay } from "../GpaDisplay";
import { useLayout } from "@/context/LayoutContext";

interface ContentHeaderProps {
  cumulativeGPA: number;
}

export function ContentHeader({ cumulativeGPA }: ContentHeaderProps) {
  const { activeFilter, activeSection } = useLayout();

  // Determine breadcrumb text based on active filter or section
  const getBreadcrumbs = () => {
    if (activeFilter === "completed") {
      return { parent: "Transcript", current: "Completed Semesters" };
    } else if (activeFilter === "planned") {
      return { parent: "Transcript", current: "Planned Semesters" };
    } else if (activeSection) {
      return { parent: "Transcript", current: activeSection };
    } else {
      return { parent: null, current: "Transcript" };
    }
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 h-[80px] bg-background/70 backdrop-blur-xl border-b border-border/5 flex items-center justify-between px-12 max-lg:px-8 max-md:px-4 max-md:hidden">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
        {breadcrumbs.parent && (
          <>
            <span>{breadcrumbs.parent}</span>
            <span>/</span>
          </>
        )}
        <span className="text-foreground font-medium truncate">
          {breadcrumbs.current}
        </span>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-8 max-lg:max-w-sm max-md:hidden">
        <GlobalSearch />
      </div>

      {/* Right: GPA Stat */}
      <div className="shrink-0">
        <GpaDisplay gpa={cumulativeGPA} label="Cumulative" size="sm" variant="primary" />
      </div>
    </header>
  );
}

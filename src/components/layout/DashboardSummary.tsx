import { GpaTrendChart } from "../charts/GpaTrendChart";
import type { Semester } from "@/lib/gpaCalculator";

interface DashboardSummaryProps {
  semesters: Semester[];
}

export function DashboardSummary({ semesters }: DashboardSummaryProps) {
  // Calculate total earned credits (only completed courses)
  const totalEarnedCredits = semesters.reduce((sum, semester) => {
    if (semester.planned === true) {
      return sum;
    }
    return (
      sum +
      semester.courses.reduce((courseSum, course) => courseSum + course.credits, 0)
    );
  }, 0);

  // Calculate planned credits (only planned courses)
  const totalPlannedCredits = semesters.reduce((sum, semester) => {
    if (semester.planned !== true) {
      return sum;
    }
    return (
      sum +
      semester.courses.reduce((courseSum, course) => courseSum + course.credits, 0)
    );
  }, 0);

  return (
    <section className="px-12 max-lg:px-8 max-md:px-4 py-8">
      <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-6">
        {/* Credits Card */}
        <div className="rounded-[2rem] bg-card p-6 shadow-tonal dark:shadow-ambient">
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
            Total Credits
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold">{totalEarnedCredits}</p>
            <p className="text-sm text-muted-foreground">earned</p>
          </div>
          {totalPlannedCredits > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              +{totalPlannedCredits} planned
            </p>
          )}
        </div>

        {/* GPA Trend Chart - spans 2 columns on desktop */}
        <div className="lg:col-span-2 max-lg:col-span-1 rounded-[2rem] bg-card p-6 shadow-tonal dark:shadow-ambient">
          <GpaTrendChart semesters={semesters} />
        </div>
      </div>
    </section>
  );
}

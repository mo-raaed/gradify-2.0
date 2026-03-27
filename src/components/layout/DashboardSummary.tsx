import { TrendingUp, TrendingDown } from "lucide-react";
import { GpaTrendChart } from "../charts/GpaTrendChart";
import type { Semester } from "@/lib/gpaCalculator";

interface DashboardSummaryProps {
  semesters: Semester[];
  cumulativeGPA: number;
  updatedAt?: number;
}

export function DashboardSummary({ semesters, cumulativeGPA, updatedAt }: DashboardSummaryProps) {
  // Calculate total earned credits (only completed courses)
  const totalEarnedCredits = semesters.reduce((sum, semester) => {
    if (semester.planned === true) return sum;
    return (
      sum +
      semester.courses.reduce((courseSum, course) => courseSum + course.credits, 0)
    );
  }, 0);

  // Count completed semesters
  const completedSemesters = semesters.filter((s) => s.planned !== true);
  const semesterCount = completedSemesters.length;

  // Calculate "Updated X days ago"
  const getUpdatedAgoText = () => {
    if (!updatedAt) return "Never updated";
    const now = Date.now();
    const diffMs = now - updatedAt;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Updated just now";
    if (diffMins < 60) return `Updated ${diffMins}m ago`;
    if (diffHours < 24) return `Updated ${diffHours}h ago`;
    if (diffDays === 1) return "Updated 1 day ago";
    return `Updated ${diffDays} days ago`;
  };

  // Calculate GPA change from previous semester
  const getGpaChange = () => {
    if (completedSemesters.length < 2) return null;
    const lastSemester = completedSemesters[completedSemesters.length - 1];
    const prevSemester = completedSemesters[completedSemesters.length - 2];
    const change = lastSemester.cumulativeGPA - prevSemester.cumulativeGPA;
    return Math.round(change * 100) / 100;
  };

  const gpaChange = getGpaChange();

  return (
    <section className="px-12 max-lg:px-8 max-md:px-4 py-6 space-y-6">
      {/* Stats Bar */}
      <div className="rounded-[2rem] bg-card p-6 shadow-tonal dark:shadow-ambient">
        <div className="grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-6">
          {/* Earned Credits */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.1em]">
              Earned Credits
            </p>
            <p className="text-2xl font-bold">{totalEarnedCredits}</p>
          </div>

          {/* Semesters */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.1em]">
              Semesters
            </p>
            <p className="text-2xl font-bold">{semesterCount}</p>
          </div>

          {/* Updated Ago */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.1em]">
              Last Update
            </p>
            <p className="text-2xl font-bold text-muted-foreground text-sm mt-1">
              {getUpdatedAgoText()}
            </p>
          </div>

          {/* Cumulative GPA */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.1em]">
              Cumulative GPA
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{cumulativeGPA.toFixed(2)}</p>
              {gpaChange !== null && gpaChange !== 0 && (
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    gpaChange > 0
                      ? "text-emerald-500"
                      : "text-destructive"
                  }`}
                >
                  {gpaChange > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {gpaChange > 0 ? "+" : ""}
                  {gpaChange.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GPA Trend Chart */}
      <div className="rounded-[2rem] bg-card p-6 shadow-tonal dark:shadow-ambient">
        <GpaTrendChart semesters={semesters} />
      </div>
    </section>
  );
}

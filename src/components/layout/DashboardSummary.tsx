import { TrendingUp, TrendingDown } from "lucide-react";

import type { Semester } from "@/lib/gpaCalculator";

interface DashboardSummaryProps {
  semesters: Semester[];
  cumulativeGPA: number;
  updatedAt?: number;
}

export function DashboardSummary({ semesters, cumulativeGPA, updatedAt }: DashboardSummaryProps) {
  const numberHoverStyles = "inline-block text-gray-900 dark:text-white tracking-tight [text-shadow:0_0_15px_rgba(73,147,250,0.2)] dark:[text-shadow:0_0_20px_rgba(255,255,255,0.4)] transition-transform duration-300 hover:scale-[1.10] cursor-default origin-center";
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
      <div className="rounded-[2rem] bg-white dark:bg-[#131a26] p-8 shadow-2xl border border-black/5 dark:border-white/5">
        <div className="grid grid-cols-4 max-lg:grid-cols-2 gap-8">
          {/* Earned Credits */}
          <div className="space-y-3">
            <p className="text-sm text-primary dark:text-[#6891C3] font-bold uppercase tracking-[0.1em]">
              Earned Credits
            </p>
            <p className={`text-5xl font-extrabold ${numberHoverStyles}`}>{totalEarnedCredits}</p>
          </div>

          {/* Semesters */}
          <div className="space-y-3">
            <p className="text-sm text-primary dark:text-[#6891C3] font-bold uppercase tracking-[0.1em]">
              Semesters
            </p>
            <p className={`text-5xl font-extrabold ${numberHoverStyles}`}>{semesterCount}</p>
          </div>

          {/* Updated Ago */}
          <div className="space-y-3">
            <p className="text-sm text-primary dark:text-[#6891C3] font-bold uppercase tracking-[0.1em]">
              Last Update
            </p>
            <p className="text-lg font-bold text-gray-800 dark:text-white mt-1 opacity-90">
              {getUpdatedAgoText()}
            </p>
          </div>

          {/* Cumulative GPA */}
          <div className="space-y-3">
            <p className="text-sm text-primary dark:text-[#6891C3] font-bold uppercase tracking-[0.1em]">
              Cumulative GPA
            </p>
            <div className="flex flex-col items-start gap-2">
              <p className={`text-[3.5rem] leading-none font-extrabold ${numberHoverStyles}`}>{cumulativeGPA.toFixed(2)}</p>
              {gpaChange !== null && gpaChange !== 0 && (
                <span
                  className={`flex items-center gap-1.5 text-sm font-bold ${
                    gpaChange > 0
                      ? "text-[#9EEBDB]"
                      : "text-red-400"
                  }`}
                >
                  {gpaChange > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {gpaChange > 0 ? "+" : ""}
                  {gpaChange.toFixed(2)} from last term
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

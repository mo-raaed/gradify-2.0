import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { GpaDisplay } from "./GpaDisplay";
import {
  BookOpen,
  Save,
  Lightbulb,
} from "lucide-react";
import {
  separatePlannedSemesters,
  type PathwayResult,
} from "@/lib/goalCalculator";

interface PathwayDisplayProps {
  pathway: PathwayResult;
  currentStats: {
    totalCredits: number;
    totalQualityPoints: number;
    currentGPA: number;
  };
  targetGPA: number;
  onClose: () => void;
}

export function PathwayDisplay({
  pathway,
  currentStats,
  targetGPA,
  onClose,
}: PathwayDisplayProps) {
  const numberHoverStyles = "inline-block text-white tracking-tight [text-shadow:0_0_20px_rgba(255,255,255,0.4)] transition-transform duration-300 hover:scale-[1.10] cursor-default origin-center";
  const savePlannedSemesters = useMutation(api.transcripts.savePlannedSemesters);

  const handleSave = async () => {
    const { existingUpdates, newPlannedSemesters } = separatePlannedSemesters(pathway.semesters);
    await savePlannedSemesters({ 
      plannedSemesters: newPlannedSemesters,
      existingUpdates,
    });
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-[2rem] bg-[#131a26] border border-white/5 text-center">
          <p className="text-xs text-[#6891C3] font-bold uppercase tracking-[0.1em] mb-2">Semesters Needed</p>
          <p className={`text-3xl font-extrabold ${numberHoverStyles}`}>{pathway.semesters.length}</p>
        </div>
        <div className="p-4 rounded-[2rem] bg-[#131a26] border border-white/5 text-center">
          <p className="text-xs text-[#6891C3] font-bold uppercase tracking-[0.1em] mb-2">New Credits</p>
          <p className={`text-3xl font-extrabold ${numberHoverStyles}`}>{pathway.totalNewCredits}</p>
        </div>
        <div className="p-4 rounded-[2rem] bg-[#131a26] border border-white/5 text-center">
          <p className="text-xs text-[#6891C3] font-bold uppercase tracking-[0.1em] mb-2">Projected GPA</p>
          <p className={`text-3xl font-extrabold text-[#9EEBDB] ${numberHoverStyles}`}>
            {pathway.finalProjectedGPA.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Winter/Summer Recommendation */}
      {pathway.winterSummerRecommended && (
        <div className="flex items-start gap-2 p-4 rounded-[2rem] bg-blue-500/10">
          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-800">
            Consider taking winter or summer courses to reach your goal faster or
            reduce your semester load.
          </p>
        </div>
      )}

      {/* Semester Breakdown */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {pathway.semesters.map((semester) => (
          <div
            key={semester.id}
            className={`p-4 rounded-[2rem] ${
              semester.isExisting
                ? "bg-amber-500/10"
                : "bg-secondary"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className={`h-4 w-4 ${semester.isExisting ? "text-amber-600" : "text-primary"}`} />
                <span className="font-medium">{semester.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  semester.isExisting
                    ? "bg-amber-500/20 text-amber-700"
                    : "bg-primary/10 text-primary"
                }`}>
                  {semester.isExisting ? "Current (IP)" : "Planned"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <GpaDisplay
                  gpa={semester.semesterGPA}
                  label="Semester"
                  size="sm"
                  variant="secondary"
                />
                <GpaDisplay
                  gpa={semester.projectedCumulativeGPA}
                  label="Cumulative"
                  size="sm"
                  variant="primary"
                />
              </div>
            </div>

            {/* Courses */}
            <div className="space-y-1">
              {semester.courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-card/50"
                >
                  <span className="text-muted-foreground">
                    {course.courseCode} - {course.courseName}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {course.credits} cr
                    </span>
                    <span className="font-medium w-8 text-center">{course.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress to Goal</span>
          <span>
            {currentStats.currentGPA.toFixed(2)} → {pathway.finalProjectedGPA.toFixed(2)}{" "}
            <span className="text-muted-foreground">/ {targetGPA.toFixed(2)}</span>
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{
              width: `${Math.min(100, (pathway.finalProjectedGPA / targetGPA) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save as Planned Semesters
        </Button>
      </div>
    </div>
  );
}

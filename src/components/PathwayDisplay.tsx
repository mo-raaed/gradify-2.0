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
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground">Semesters Needed</p>
          <p className="text-2xl font-bold">{pathway.semesters.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground">New Credits</p>
          <p className="text-2xl font-bold">{pathway.totalNewCredits}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground">Projected GPA</p>
          <p className="text-2xl font-bold text-primary">
            {pathway.finalProjectedGPA.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Winter/Summer Recommendation */}
      {pathway.winterSummerRecommended && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
          <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
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
            className={`p-4 rounded-lg border border-dashed ${
              semester.isExisting
                ? "border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20"
                : "border-primary/30 bg-primary/5"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className={`h-4 w-4 ${semester.isExisting ? "text-amber-600" : "text-primary"}`} />
                <span className="font-medium">{semester.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  semester.isExisting
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
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
                  className="flex items-center justify-between text-sm py-1 px-2 rounded bg-background/50"
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
        <div className="h-2 bg-muted rounded-full overflow-hidden">
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

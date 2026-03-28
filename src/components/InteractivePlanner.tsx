import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GpaDisplay } from "./GpaDisplay";
import {
  BookOpen,
  Save,
  Plus,
  Trash2,
  Lightbulb,
  Gauge,
} from "lucide-react";
import {
  recalculatePathway,
  applyEffortLevel,
  separatePlannedSemesters,
  generateId,
  GRADES_ORDERED,
  type PathwayResult,
  type PlannedSemester,
  type PlannedCourse,
} from "@/lib/goalCalculator";

interface InteractivePlannerProps {
  initialPathway: PathwayResult;
  currentStats: {
    totalCredits: number;
    totalQualityPoints: number;
    currentGPA: number;
  };
  targetGPA: number;
  onClose: () => void;
}

export function InteractivePlanner({
  initialPathway,
  currentStats,
  targetGPA,
  onClose,
}: InteractivePlannerProps) {
  const numberHoverStyles = "inline-block text-white tracking-tight [text-shadow:0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-[1.15] hover:[text-shadow:0_0_40px_rgba(255,255,255,0.8)] cursor-default origin-center";
  const [semesters, setSemesters] = useState<PlannedSemester[]>(
    initialPathway.semesters
  );
  const [effortLevel, setEffortLevel] = useState(50);

  const savePlannedSemesters = useMutation(api.transcripts.savePlannedSemesters);

  // Recalculate totals
  const totals = useMemo(() => {
    let totalNewCredits = 0;
    let finalProjectedGPA = currentStats.currentGPA;

    if (semesters.length > 0) {
      totalNewCredits = semesters.reduce(
        (sum, sem) => sum + sem.courses.reduce((s, c) => s + c.credits, 0),
        0
      );
      finalProjectedGPA = semesters[semesters.length - 1].projectedCumulativeGPA;
    }

    return { totalNewCredits, finalProjectedGPA };
  }, [semesters, currentStats.currentGPA]);

  // Handle effort slider change
  const handleEffortChange = (value: number) => {
    setEffortLevel(value);
    const updated = applyEffortLevel(
      semesters,
      value,
      currentStats.totalCredits,
      currentStats.totalQualityPoints
    );
    setSemesters(updated);
  };

  // Update a course grade
  const handleGradeChange = (
    semesterIndex: number,
    courseIndex: number,
    newGrade: string
  ) => {
    const updated = [...semesters];
    updated[semesterIndex] = {
      ...updated[semesterIndex],
      courses: updated[semesterIndex].courses.map((c, i) =>
        i === courseIndex ? { ...c, grade: newGrade } : c
      ),
    };
    const recalculated = recalculatePathway(
      updated,
      currentStats.totalCredits,
      currentStats.totalQualityPoints
    );
    setSemesters(recalculated);
  };

  // Update course details
  const handleCourseUpdate = (
    semesterIndex: number,
    courseIndex: number,
    field: keyof PlannedCourse,
    value: string | number
  ) => {
    const updated = [...semesters];
    updated[semesterIndex] = {
      ...updated[semesterIndex],
      courses: updated[semesterIndex].courses.map((c, i) =>
        i === courseIndex ? { ...c, [field]: value } : c
      ),
    };
    const recalculated = recalculatePathway(
      updated,
      currentStats.totalCredits,
      currentStats.totalQualityPoints
    );
    setSemesters(recalculated);
  };

  // Add a course to a semester
  const handleAddCourse = (semesterIndex: number) => {
    const updated = [...semesters];
    const newCourse: PlannedCourse = {
      id: generateId(),
      courseCode: `PLN ${Math.floor(Math.random() * 900) + 100}`,
      courseName: "New Course",
      credits: 3,
      grade: "B",
      gradePoints: 9,
    };
    updated[semesterIndex] = {
      ...updated[semesterIndex],
      courses: [...updated[semesterIndex].courses, newCourse],
    };
    const recalculated = recalculatePathway(
      updated,
      currentStats.totalCredits,
      currentStats.totalQualityPoints
    );
    setSemesters(recalculated);
  };

  // Remove a course from a semester
  const handleRemoveCourse = (semesterIndex: number, courseIndex: number) => {
    const updated = [...semesters];
    updated[semesterIndex] = {
      ...updated[semesterIndex],
      courses: updated[semesterIndex].courses.filter((_, i) => i !== courseIndex),
    };

    // Remove semester if no courses
    if (updated[semesterIndex].courses.length === 0) {
      updated.splice(semesterIndex, 1);
    }

    const recalculated =
      updated.length > 0
        ? recalculatePathway(
            updated,
            currentStats.totalCredits,
            currentStats.totalQualityPoints
          )
        : [];
    setSemesters(recalculated);
  };

  // Save planned semesters
  const handleSave = async () => {
    const { existingUpdates, newPlannedSemesters } = separatePlannedSemesters(semesters);
    await savePlannedSemesters({ 
      plannedSemesters: newPlannedSemesters,
      existingUpdates,
    });
    onClose();
  };

  // Effort level description
  const effortDescription = useMemo(() => {
    if (effortLevel < 25) return "Minimal Effort (~C average)";
    if (effortLevel < 45) return "Conservative (~B- average)";
    if (effortLevel < 55) return "Balanced (~B average)";
    if (effortLevel < 75) return "High Effort (~B+ average)";
    return "Maximum Effort (~A average)";
  }, [effortLevel]);

  return (
    <div className="space-y-4">
      {/* Effort Slider */}
      <div className="p-4 rounded-[2rem] bg-secondary space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Effort Level
          </Label>
          <span className="text-sm font-medium">{effortDescription}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={effortLevel}
          onChange={(e) => handleEffortChange(parseInt(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Lower Effort</span>
          <span>Higher Effort</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-[2rem] bg-[#131a26] border border-white/5 text-center">
          <p className="text-xs text-[#6891C3] font-bold uppercase tracking-[0.1em] mb-2">Semesters</p>
          <p className={`text-4xl font-extrabold ${numberHoverStyles}`}>{semesters.length}</p>
        </div>
        <div className="p-4 rounded-[2rem] bg-[#131a26] border border-white/5 text-center">
          <p className="text-xs text-[#6891C3] font-bold uppercase tracking-[0.1em] mb-2">New Credits</p>
          <p className={`text-4xl font-extrabold ${numberHoverStyles}`}>{totals.totalNewCredits}</p>
        </div>
        <div className="p-4 rounded-[2rem] bg-[#131a26] border border-white/5 text-center">
          <p className="text-xs text-[#6891C3] font-bold uppercase tracking-[0.1em] mb-2">Projected GPA</p>
          <p
            className={`text-4xl font-extrabold ${numberHoverStyles} ${
              totals.finalProjectedGPA >= targetGPA
                ? "text-[#9EEBDB]"
                : "text-red-400 opacity-90"
            }`}
          >
            {totals.finalProjectedGPA.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Goal Status */}
      {totals.finalProjectedGPA < targetGPA && (
        <div className="flex items-start gap-2 p-4 rounded-[2rem] bg-amber-500/10">
          <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5" />
          <p className="text-sm text-amber-800">
            Your current plan projects to{" "}
            <strong>{totals.finalProjectedGPA.toFixed(2)}</strong>, which is below
            your target of <strong>{targetGPA.toFixed(2)}</strong>. Try increasing
            grades or adding more courses with higher grades.
          </p>
        </div>
      )}

      {/* Interactive Semesters */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
        {semesters.map((semester, semIndex) => (
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
                  label="Sem"
                  size="sm"
                  variant="secondary"
                />
                <GpaDisplay
                  gpa={semester.projectedCumulativeGPA}
                  label="Cum"
                  size="sm"
                  variant="primary"
                />
              </div>
            </div>

            {/* Editable Courses */}
            <div className="space-y-2">
              {semester.courses.map((course, courseIndex) => (
                <div
                  key={course.id}
                  className="py-2 px-3 rounded-lg bg-card/50 space-y-2"
                >
                  {/* Row 1: Code + Name */}
                  <div className="flex items-center gap-2">
                    <Input
                      value={course.courseCode}
                      onChange={(e) =>
                        handleCourseUpdate(semIndex, courseIndex, "courseCode", e.target.value)
                      }
                      className="w-20 max-md:w-16 h-8 text-xs shrink-0"
                      placeholder="Code"
                    />
                    <Input
                      value={course.courseName}
                      onChange={(e) =>
                        handleCourseUpdate(semIndex, courseIndex, "courseName", e.target.value)
                      }
                      className="flex-1 h-8 text-xs"
                      placeholder="Course Name"
                    />
                  </div>
                  {/* Row 2: Credits + Grade + Delete */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={course.credits.toString()}
                      onValueChange={(v) =>
                        handleCourseUpdate(semIndex, courseIndex, "credits", parseInt(v))
                      }
                    >
                      <SelectTrigger className="w-16 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((cr) => (
                          <SelectItem key={cr} value={cr.toString()}>
                            {cr} cr
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={course.grade}
                      onValueChange={(v) => handleGradeChange(semIndex, courseIndex, v)}
                    >
                      <SelectTrigger className="w-16 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADES_ORDERED.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveCourse(semIndex, courseIndex)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Add Course Button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 bg-card/30 hover:bg-card/50"
                onClick={() => handleAddCourse(semIndex)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Course
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress to Goal</span>
          <span>
            {currentStats.currentGPA.toFixed(2)} → {totals.finalProjectedGPA.toFixed(2)}{" "}
            <span className="text-muted-foreground">/ {targetGPA.toFixed(2)}</span>
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              totals.finalProjectedGPA >= targetGPA ? "bg-green-500" : "bg-primary"
            }`}
            style={{
              width: `${Math.min(100, (totals.finalProjectedGPA / targetGPA) * 100)}%`,
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

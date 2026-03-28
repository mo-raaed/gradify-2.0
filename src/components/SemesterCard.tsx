import { useState, forwardRef } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, BookOpen, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GpaDisplay } from "./GpaDisplay";
import { CourseRow } from "./CourseRow";
import { AddCourseDialog } from "./AddCourseDialog";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Semester, Course } from "@/lib/gpaCalculator";

interface SemesterCardProps {
  semester: Semester;
  onUpdateCourse: (courseId: string, updates: Partial<Course>) => void;
  onAddCourse: (course: {
    courseCode: string;
    courseName: string;
    credits: number;
    grade: string;
  }) => void;
  onRemoveCourse: (courseId: string) => void;
  onRemoveSemester: () => void;
  highlighted?: boolean;
  highlightedCourseIds?: Set<string>;
}

const grades = [
  "IP", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "W", "WF"
];

const creditOptions = ["1", "2", "3", "4", "5"];

export const SemesterCard = forwardRef<HTMLDivElement, SemesterCardProps>(
  function SemesterCard(
    {
      semester,
      onUpdateCourse,
      onAddCourse,
      onRemoveCourse,
      onRemoveSemester,
      highlighted = false,
      highlightedCourseIds = new Set(),
    },
    ref
  ) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);

  // Check if this is a planned semester
  const isPlanned = semester.planned === true;

  // Filter out retaken courses for display count
  const displayedCourses = semester.courses.filter((c) => !c.retaken);
  const totalCredits = displayedCourses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div
      ref={ref}
      id={`semester-${semester.id}`}
      className={cn(
        "rounded-[2rem] overflow-hidden transition-all duration-300 hover:scale-[1.01] max-md:hover:scale-100",
        isPlanned
          ? "bg-primary/5"
          : "bg-card shadow-tonal dark:shadow-ambient",
        highlighted && "ring-2 ring-primary ring-offset-4 ring-offset-background"
      )}
    >
      {/* Header - Desktop: single row, Mobile: two rows */}
      <div
        className={cn(
          "cursor-pointer select-none",
          isPlanned ? "bg-primary/10" : "bg-secondary"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Desktop Header (single row) */}
        <div className="hidden md:flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {isPlanned ? (
              <Calendar className="h-5 w-5 text-primary" />
            ) : (
              <BookOpen className="h-5 w-5 text-primary" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{semester.name}</h3>
                {isPlanned && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-xs font-medium text-primary">
                    Planned
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {displayedCourses.length} courses · {totalCredits} credits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <GpaDisplay
                gpa={semester.semesterGPA}
                label={isPlanned ? "Projected" : "Semester"}
                size="sm"
                variant="secondary"
              />
              <GpaDisplay
                gpa={semester.cumulativeGPA}
                label="Cumulative"
                size="sm"
                variant="primary"
              />
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddCourseOpen(true);
                }}
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add course</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSemester();
                }}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 btn-glow-red"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove semester</span>
              </Button>

              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Header (two rows) */}
        <div className="md:hidden px-4 py-3 space-y-2">
          {/* Row 1: Name + Chevron */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {isPlanned ? (
                <Calendar className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <BookOpen className="h-4 w-4 text-primary shrink-0" />
              )}
              <h3 className="font-semibold text-base truncate">{semester.name}</h3>
              {isPlanned && (
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-[10px] font-medium text-primary shrink-0">
                  Planned
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddCourseOpen(true);
                }}
                className="h-7 w-7"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSemester();
                }}
                className="h-7 w-7 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Row 2: Stats + GPA badges */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {displayedCourses.length} courses · {totalCredits} cr
            </p>
            <div className="flex gap-1.5">
              <GpaDisplay
                gpa={semester.semesterGPA}
                label={isPlanned ? "Proj" : "Sem"}
                size="sm"
                variant="secondary"
              />
              <GpaDisplay
                gpa={semester.cumulativeGPA}
                label="Cum"
                size="sm"
                variant="primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Courses - Desktop: table, Mobile: cards */}
      {isExpanded && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            {displayedCourses.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Course Name
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-4 py-3 w-[50px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCourses.map((course) => (
                    <CourseRow
                      key={course.id}
                      course={course}
                      onUpdate={(updates) => onUpdateCourse(course.id, updates)}
                      onRemove={() => onRemoveCourse(course.id)}
                      highlighted={highlightedCourseIds.has(course.id)}
                    />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No courses in this semester</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddCourseOpen(true)}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Course
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-3 space-y-2">
            {displayedCourses.length > 0 ? (
              displayedCourses.map((course) => (
                <MobileCourseCard
                  key={course.id}
                  course={course}
                  onUpdate={(updates) => onUpdateCourse(course.id, updates)}
                  onRemove={() => onRemoveCourse(course.id)}
                  highlighted={highlightedCourseIds.has(course.id)}
                />
              ))
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">No courses in this semester</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddCourseOpen(true)}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Course
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Course Dialog */}
      <AddCourseDialog
        open={isAddCourseOpen}
        onOpenChange={setIsAddCourseOpen}
        onAddCourse={onAddCourse}
        semesterName={semester.name}
      />
    </div>
  );
});


/* ─── Mobile Course Card ─── */

interface MobileCourseCardProps {
  course: Course;
  onUpdate: (updates: Partial<Course>) => void;
  onRemove: () => void;
  highlighted?: boolean;
}

function MobileCourseCard({ course, onUpdate, onRemove, highlighted = false }: MobileCourseCardProps) {
  const isInProgress = course.gradeType === "in_progress";
  const isSimulated = isInProgress && course.grade !== "IP";

  return (
    <div
      className={cn(
        "rounded-xl p-3 transition-colors",
        isSimulated ? "bg-primary/5" : "bg-secondary/30",
        course.retaken && "opacity-50",
        highlighted && "bg-primary/10 ring-1 ring-primary/30"
      )}
    >
      {/* Top row: course code + name */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground font-medium">{course.courseCode}</p>
          <p className="text-sm font-medium whitespace-normal break-words leading-snug">
            {course.courseName}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-7 w-7 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Bottom row: credits + grade selects */}
      <div className="flex items-center gap-1.5">
        <Select
          value={course.credits.toString()}
          onValueChange={(v) => onUpdate({ credits: parseInt(v) })}
        >
          <SelectTrigger className="h-8 w-[6.75rem] shrink-0 text-xs whitespace-nowrap">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {creditOptions.map((c) => (
              <SelectItem key={c} value={c}>
                {c} credits
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={course.grade}
          onValueChange={(v) => onUpdate({ grade: v })}
        >
          <SelectTrigger
            className={cn(
              "h-8 w-[5rem] shrink-0 text-xs font-medium",
              isSimulated && "ring-2 ring-primary/50 ring-offset-1"
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {grades.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

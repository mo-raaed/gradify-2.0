import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, BookOpen, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GpaDisplay } from "./GpaDisplay";
import { CourseRow } from "./CourseRow";
import { AddCourseDialog } from "./AddCourseDialog";
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
}

export function SemesterCard({
  semester,
  onUpdateCourse,
  onAddCourse,
  onRemoveCourse,
  onRemoveSemester,
}: SemesterCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);

  // Check if this is a planned semester
  const isPlanned = semester.planned === true;

  // Filter out retaken courses for display count
  const displayedCourses = semester.courses.filter((c) => !c.retaken);
  const totalCredits = displayedCourses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div
      className={`rounded-xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${
        isPlanned
          ? "border-dashed border-primary/40 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer select-none ${
          isPlanned ? "bg-primary/10" : "bg-muted/30"
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {isPlanned ? (
            <Calendar className="h-5 w-5 text-primary" />
          ) : (
            <BookOpen className="h-5 w-5 text-primary" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-semibold text-lg">{semester.name}</h3>
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
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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

      {/* Courses Table */}
      {isExpanded && (
        <div className="overflow-x-auto">
          {displayedCourses.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Course Name
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-3 py-2 w-[50px]"></th>
                </tr>
              </thead>
              <tbody>
                {displayedCourses.map((course) => (
                  <CourseRow
                    key={course.id}
                    course={course}
                    onUpdate={(updates) => onUpdateCourse(course.id, updates)}
                    onRemove={() => onRemoveCourse(course.id)}
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
}


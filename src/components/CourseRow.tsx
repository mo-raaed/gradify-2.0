import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/gpaCalculator";

interface CourseRowProps {
  course: Course;
  onUpdate: (updates: Partial<Course>) => void;
  onRemove: () => void;
  highlighted?: boolean;
}

const grades = [
  "IP", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "W", "WF"
];

const creditOptions = ["1", "2", "3", "4", "5"];

export function CourseRow({ course, onUpdate, onRemove, highlighted = false }: CourseRowProps) {
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editCode, setEditCode] = useState(course.courseCode);
  const [editName, setEditName] = useState(course.courseName);

  const handleCodeSubmit = () => {
    if (editCode.trim() !== course.courseCode) {
      onUpdate({ courseCode: editCode.trim() || "XXX 000" });
    }
    setIsEditingCode(false);
  };

  const handleNameSubmit = () => {
    if (editName.trim() !== course.courseName) {
      onUpdate({ courseName: editName.trim() || "Untitled Course" });
    }
    setIsEditingName(false);
  };

  const handleGradeChange = (newGrade: string) => {
    onUpdate({ grade: newGrade });
  };

  const handleCreditsChange = (newCredits: string) => {
    onUpdate({ credits: parseInt(newCredits) });
  };

  // Determine row styling based on course state
  const isInProgress = course.gradeType === "in_progress";
  const isSimulated = isInProgress && course.grade !== "IP";

  return (
    <tr
      className={cn(
        "group transition-colors hover:bg-secondary/50",
        isSimulated && "bg-primary/5",
        course.retaken && "opacity-50",
        highlighted && "bg-primary/10 ring-1 ring-primary/30"
      )}
    >
      {/* Course Code */}
      <td className="px-4 py-3 w-[120px]">
        {isEditingCode ? (
          <Input
            value={editCode}
            onChange={(e) => setEditCode(e.target.value)}
            onBlur={handleCodeSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCodeSubmit();
              if (e.key === "Escape") {
                setEditCode(course.courseCode);
                setIsEditingCode(false);
              }
            }}
            className="h-8 text-sm"
            autoFocus
          />
        ) : (
          <button
            onClick={() => {
              setEditCode(course.courseCode);
              setIsEditingCode(true);
            }}
            className="text-left font-medium text-sm hover:text-primary transition-colors"
          >
            {course.courseCode}
          </button>
        )}
      </td>

      {/* Course Name */}
      <td className="px-4 py-3">
        {isEditingName ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNameSubmit();
              if (e.key === "Escape") {
                setEditName(course.courseName);
                setIsEditingName(false);
              }
            }}
            className="h-8 text-sm"
            autoFocus
          />
        ) : (
          <button
            onClick={() => {
              setEditName(course.courseName);
              setIsEditingName(true);
            }}
            className="text-left text-sm whitespace-normal break-words hover:text-primary transition-colors"
          >
            {course.courseName}
          </button>
        )}
      </td>

      {/* Credits */}
      <td className="px-4 py-3 w-[80px] text-center">
        <Select
          value={course.credits.toString()}
          onValueChange={handleCreditsChange}
        >
          <SelectTrigger className="h-8 w-16 mx-auto text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {creditOptions.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>

      {/* Grade */}
      <td className="px-4 py-3 w-[100px] text-center">
        <Select value={course.grade} onValueChange={handleGradeChange}>
          <SelectTrigger
            className={cn(
              "h-8 w-20 mx-auto text-sm font-medium",
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
      </td>

      {/* Delete Button */}
      <td className="px-4 py-3 w-[50px] text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 btn-glow-red"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove course</span>
        </Button>
      </td>
    </tr>
  );
}

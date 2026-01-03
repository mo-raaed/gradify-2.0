import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface AddCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCourse: (course: {
    courseCode: string;
    courseName: string;
    credits: number;
    grade: string;
  }) => void;
  semesterName: string;
}

const grades = [
  { value: "IP", label: "IP (In Progress)" },
  { value: "A", label: "A" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B", label: "B" },
  { value: "B-", label: "B-" },
  { value: "C+", label: "C+" },
  { value: "C", label: "C" },
  { value: "C-", label: "C-" },
  { value: "D+", label: "D+" },
  { value: "D", label: "D" },
  { value: "F", label: "F" },
  { value: "W", label: "W (Withdrawn)" },
  { value: "WF", label: "WF (Withdraw Fail)" },
];

const creditOptions = ["1", "2", "3", "4", "5"];

export function AddCourseDialog({
  open,
  onOpenChange,
  onAddCourse,
  semesterName,
}: AddCourseDialogProps) {
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState("3");
  const [grade, setGrade] = useState("IP");

  const handleSubmit = () => {
    onAddCourse({
      courseCode: courseCode.trim() || "XXX 000",
      courseName: courseName.trim() || "Untitled Course",
      credits: parseInt(credits),
      grade,
    });
    
    // Reset form
    setCourseCode("");
    setCourseName("");
    setCredits("3");
    setGrade("IP");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Add Course</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Adding to {semesterName}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="course-code">Course Code</Label>
            <Input
              id="course-code"
              placeholder="e.g., CS 101"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-name">Course Name</Label>
            <Input
              id="course-name"
              placeholder="e.g., Introduction to Computer Science"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credits">Credits</Label>
              <Select value={credits} onValueChange={setCredits}>
                <SelectTrigger id="credits">
                  <SelectValue placeholder="Credits" />
                </SelectTrigger>
                <SelectContent>
                  {creditOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Course</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


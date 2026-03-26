import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Upload,
  Plus,
  Download,
  RotateCcw,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SemesterCard } from "./SemesterCard";
import { TranscriptUploader } from "./TranscriptUploader";
import { AddSemesterDialog } from "./AddSemesterDialog";
import { GpaGoalPlanner } from "./GpaGoalPlanner";
import { ContentHeader } from "./layout/ContentHeader";
import { DashboardSummary } from "./layout/DashboardSummary";
import { useLayout } from "@/context/LayoutContext";
import { useSearch } from "@/hooks/useSearch";
import type { TranscriptData } from "@/lib/gpaCalculator";

interface DashboardProps {
  isGoalPlannerOpen: boolean;
  setIsGoalPlannerOpen: (open: boolean) => void;
}

export function Dashboard({ isGoalPlannerOpen, setIsGoalPlannerOpen }: DashboardProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAddSemesterOpen, setIsAddSemesterOpen] = useState(false);

  // Convex queries and mutations
  const transcript = useQuery(api.transcripts.getMyTranscript);
  const saveTranscript = useMutation(api.transcripts.saveTranscript);
  const updateCourse = useMutation(api.transcripts.updateCourse);
  const addSemester = useMutation(api.transcripts.addSemester);
  const removeSemester = useMutation(api.transcripts.removeSemester);
  const addCourse = useMutation(api.transcripts.addCourse);
  const removeCourse = useMutation(api.transcripts.removeCourse);
  const resetSimulatedGrades = useMutation(api.transcripts.resetSimulatedGrades);

  // Layout context
  const {
    activeFilter,
    highlightedCourses,
    highlightedSemesters,
    registerSemesterRef,
  } = useLayout();

  // Search hook - updates context with results
  useSearch(transcript?.semesters || []);

  // Loading state
  if (transcript === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your transcript...</p>
        </div>
      </div>
    );
  }

  // Handle PDF transcript parsed
  const handleTranscriptParsed = async (data: TranscriptData) => {
    await saveTranscript({
      semesters: data.semesters,
      cumulativeGPA: data.cumulativeGPA,
      major: data.major,
    });
  };

  // Handle add semester
  const handleAddSemester = async (name: string) => {
    await addSemester({ name });
  };

  // Handle export
  const handleExport = () => {
    if (!transcript) return;

    const jsonString = JSON.stringify(transcript, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "gradify-export.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle reset
  const handleReset = async () => {
    if (!transcript) return;
    await resetSimulatedGrades();
  };

  // Empty state - no transcript yet
  if (transcript === null) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary/20 to-[var(--color-primary-container)]/20 mb-4">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome to Gradify
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload your AUIS unofficial transcript to get started, or manually add
              your semesters and courses.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="w-full h-14 text-lg"
              size="lg"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Transcript
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsAddSemesterOpen(true)}
              className="w-full h-12"
            >
              <Plus className="mr-2 h-4 w-4" />
              Start from Scratch
            </Button>
          </div>

          <TranscriptUploader
            open={isUploadOpen}
            onOpenChange={setIsUploadOpen}
            onTranscriptParsed={handleTranscriptParsed}
          />

          <AddSemesterDialog
            open={isAddSemesterOpen}
            onOpenChange={setIsAddSemesterOpen}
            onAddSemester={handleAddSemester}
            existingSemesterCount={0}
          />
        </div>
      </div>
    );
  }

  // Filter semesters based on active filter
  const filteredSemesters = transcript.semesters.filter((semester) => {
    if (activeFilter === "completed") {
      return semester.planned !== true;
    } else if (activeFilter === "planned") {
      return semester.planned === true;
    }
    return true; // "all" filter
  });

  // Main dashboard with transcript data
  return (
    <>
      {/* Zone 1: Content Header */}
      <ContentHeader cumulativeGPA={transcript.cumulativeGPA} />

      {/* Zone 2: Dashboard Summary */}
      <DashboardSummary semesters={transcript.semesters} />

      {/* Zone 3: Primary Feed - Action Bar */}
      <section className="px-12 max-lg:px-8 max-md:px-4 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">
              {activeFilter === "completed"
                ? "Completed Semesters"
                : activeFilter === "planned"
                ? "Planned Semesters"
                : "Your Transcript"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredSemesters.length} semesters
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsUploadOpen(true)}
              title="Upload new transcript"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsAddSemesterOpen(true)}
              title="Add semester"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleExport}
              title="Export data"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              title="Reset simulated grades"
              className="text-destructive hover:text-destructive"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Zone 3: Primary Feed - Semester Cards */}
      <section className="px-12 max-lg:px-8 max-md:px-4 pb-12 space-y-8">
        {filteredSemesters.map((semester) => (
          <SemesterCard
            key={semester.id}
            ref={(element) => registerSemesterRef(semester.id, element)}
            semester={semester}
            onUpdateCourse={(courseId, updates) =>
              updateCourse({
                semesterId: semester.id,
                courseId,
                updates,
              })
            }
            onAddCourse={(course) =>
              addCourse({
                semesterId: semester.id,
                ...course,
              })
            }
            onRemoveCourse={(courseId) =>
              removeCourse({
                semesterId: semester.id,
                courseId,
              })
            }
            onRemoveSemester={() => removeSemester({ semesterId: semester.id })}
            highlighted={highlightedSemesters.has(semester.id)}
            highlightedCourseIds={highlightedCourses}
          />
        ))}

        {filteredSemesters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {activeFilter === "completed"
                ? "No completed semesters yet"
                : activeFilter === "planned"
                ? "No planned semesters yet"
                : "No semesters yet"}
            </p>
            <Button onClick={() => setIsAddSemesterOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Semester
            </Button>
          </div>
        )}
      </section>

      {/* Dialogs */}
      <TranscriptUploader
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onTranscriptParsed={handleTranscriptParsed}
      />

      <AddSemesterDialog
        open={isAddSemesterOpen}
        onOpenChange={setIsAddSemesterOpen}
        onAddSemester={handleAddSemester}
        existingSemesterCount={transcript.semesters.length}
      />

      <GpaGoalPlanner
        open={isGoalPlannerOpen}
        onOpenChange={setIsGoalPlannerOpen}
        semesters={transcript.semesters}
      />
    </>
  );
}

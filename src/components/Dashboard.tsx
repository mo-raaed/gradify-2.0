import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Plus,
  RotateCcw,
  Loader2,
  Upload,
} from "lucide-react";
import { GradifyLogo } from "@/components/branding/GradifyLogo";
import { Button } from "@/components/ui/button";
import { SemesterCard } from "./SemesterCard";
import { TranscriptUploader } from "./TranscriptUploader";
import { AddSemesterDialog } from "./AddSemesterDialog";
import { GpaGoalPlanner } from "./GpaGoalPlanner";
import { ContentHeader } from "./layout/ContentHeader";
import { DashboardSummary } from "./layout/DashboardSummary";
import { GpaTrendChart } from "./charts/GpaTrendChart";
import { useLayout } from "@/context/LayoutContext";
import { useSearch } from "@/hooks/useSearch";
import type { TranscriptData, Semester } from "@/lib/gpaCalculator";

// Stable empty array to avoid new reference on every render
const EMPTY_SEMESTERS: Semester[] = [];

interface DashboardProps {
  isGoalPlannerOpen: boolean;
  setIsGoalPlannerOpen: (open: boolean) => void;
  isUploadOpen: boolean;
  setIsUploadOpen: (open: boolean) => void;
}

export function Dashboard({
  isGoalPlannerOpen,
  setIsGoalPlannerOpen,
  isUploadOpen,
  setIsUploadOpen,
}: DashboardProps) {
  const [isAddSemesterOpen, setIsAddSemesterOpen] = useState(false);

  // Convex queries and mutations
  const transcript = useQuery(api.transcripts.getMyTranscript);
  const saveTranscript = useMutation(api.transcripts.saveTranscript);
  const updateCourse = useMutation(api.transcripts.updateCourse);
  const addSemester = useMutation(api.transcripts.addSemester);
  const removeSemester = useMutation(api.transcripts.removeSemester);
  const addCourse = useMutation(api.transcripts.addCourse);
  const removeCourse = useMutation(api.transcripts.removeCourse);
  const deleteTranscript = useMutation(api.transcripts.deleteTranscript);

  // Layout context
  const {
    highlightedCourses,
    highlightedSemesters,
    registerSemesterRef,
  } = useLayout();

  // Search hook - updates context with results
  useSearch(transcript?.semesters ?? EMPTY_SEMESTERS);

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

  // Handle reset - deletes entire transcript and returns to welcome screen
  const handleReset = async () => {
    if (!transcript) return;
    const confirmed = window.confirm(
      "Are you sure you want to reset? This will delete all your transcript data and return to the welcome screen."
    );
    if (!confirmed) return;
    await deleteTranscript();
  };

  // Empty state - no transcript yet
  if (transcript === null) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <GradifyLogo size="lg" className="justify-center" />
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

  // Show all semesters (no more completed/planned filter)
  const allSemesters = transcript.semesters;

  // Main dashboard with transcript data
  return (
    <>
      {/* Zone 1: Content Header */}
      <ContentHeader />

      {/* Zone 2: Dashboard Summary */}
      <DashboardSummary
        semesters={transcript.semesters}
        cumulativeGPA={transcript.cumulativeGPA}
        updatedAt={transcript.updatedAt}
      />

      {/* Zone 3: Primary Feed - Action Bar */}
      <section className="px-12 max-lg:px-8 max-md:px-4 pb-4">
        <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch">
          <div>
            <h2 className="text-xl font-bold">Academic History</h2>
            <p className="text-sm text-muted-foreground">
              {allSemesters.length} semesters
            </p>
          </div>

          <div className="flex gap-3 max-md:flex-col">
            <Button
              onClick={() => setIsAddSemesterOpen(true)}
              className="h-10 px-4 max-md:w-full rounded-full bg-white text-primary border border-primary/20 hover:bg-primary/10 dark:bg-[#131a26] dark:text-[#4993FA] dark:border-[#4993FA]/20 dark:hover:bg-[#4993FA] dark:hover:text-[#131a26] transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Add Semester</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="h-10 px-4 rounded-full text-destructive hover:text-destructive btn-glow-red max-md:w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Reset</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Zone 3: Primary Feed - Semester Cards */}
      <section className="px-12 max-lg:px-8 max-md:px-4 pb-12 space-y-8">
        {allSemesters.map((semester) => (
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

        {allSemesters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No semesters yet</p>
            <Button 
              onClick={() => setIsAddSemesterOpen(true)}
              className="rounded-full bg-white text-primary border border-primary/20 hover:bg-primary/10 dark:bg-[#131a26] dark:text-[#4993FA] dark:border-[#4993FA]/20 dark:hover:bg-[#4993FA] dark:hover:text-[#131a26] transition-colors cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Semester
            </Button>
          </div>
        )}
      </section>

      {/* Zone 4: GPA Trend Analysis */}
      <section className="px-12 max-lg:px-8 max-md:px-4 pb-12">
        <div className="rounded-[2rem] bg-white dark:bg-[#131a26] p-8 shadow-2xl border border-black/5 dark:border-white/5 h-[400px] flex flex-col">
          <GpaTrendChart semesters={allSemesters} />
        </div>
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

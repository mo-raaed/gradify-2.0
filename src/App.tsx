import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { useEffect, useState, useCallback } from "react";
import { api } from "../convex/_generated/api";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { GraduationCap, FileText, BarChart3, Target } from "lucide-react";
import { Dashboard } from "@/components/Dashboard";
import { AppShell } from "@/components/layout/AppShell";
import { LayoutProvider } from "@/context/LayoutContext";
import { FluidBackground } from "@/components/effects/FluidBackground";
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <div className="min-h-screen relative z-0">
      <FluidBackground />
      <Authenticated>
        <AuthenticatedContent />
      </Authenticated>
      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
    </div>
  );
}

function AuthenticatedContent() {
  const upsertUser = useMutation(api.users.upsertUser);
  const updateMajor = useMutation(api.transcripts.updateMajor);
  const transcript = useQuery(api.transcripts.getMyTranscript);
  const [isGoalPlannerOpen, setIsGoalPlannerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Ensure user exists in database on first load
  useEffect(() => {
    upsertUser();
  }, [upsertUser]);

  // Handle major update
  const handleMajorUpdate = async (major: string) => {
    await updateMajor({ major });
  };

  // Handle export
  const handleExport = useCallback(() => {
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
  }, [transcript]);

  return (
    <LayoutProvider>
      <AppShell
        major={transcript?.major}
        cumulativeGPA={transcript?.cumulativeGPA}
        onMajorUpdate={handleMajorUpdate}
        onGpaGoalClick={() => setIsGoalPlannerOpen(true)}
        onUploadClick={() => setIsUploadOpen(true)}
        onExportClick={handleExport}
      >
        <Dashboard
          isGoalPlannerOpen={isGoalPlannerOpen}
          setIsGoalPlannerOpen={setIsGoalPlannerOpen}
          isUploadOpen={isUploadOpen}
          setIsUploadOpen={setIsUploadOpen}
        />
      </AppShell>
    </LayoutProvider>
  );
}

function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary/20 to-[var(--color-primary-container)]/20 mb-6">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Track Your Academic Journey
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Upload your AUIS transcript, track your GPA in real-time, and simulate
            future grades to plan your path to success.
          </p>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-[2rem] bg-secondary">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">PDF Import</h3>
            <p className="text-sm text-muted-foreground">
              Upload your unofficial transcript and we'll parse it automatically
            </p>
          </div>
          <div className="p-6 rounded-[2rem] bg-secondary">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">GPA Tracking</h3>
            <p className="text-sm text-muted-foreground">
              See your semester and cumulative GPA update in real-time
            </p>
          </div>
          <div className="p-6 rounded-[2rem] bg-secondary">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Grade Simulation</h3>
            <p className="text-sm text-muted-foreground">
              Predict your GPA by simulating grades for in-progress courses
            </p>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <SignInButton mode="modal">
            <Button size="lg" className="w-full sm:w-auto min-w-[160px]">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto min-w-[160px]"
            >
              Create Account
            </Button>
          </SignUpButton>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Built for AUIS students · Your data stays private
        </p>
      </div>
    </div>
  );
}

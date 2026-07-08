import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { useEffect, useState, useCallback } from "react";
import { api } from "../convex/_generated/api";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { GraduationCap, FileText, BarChart3, Target, UserRound } from "lucide-react";
import { LazyMotion, MotionConfig } from "motion/react";
import { Dashboard } from "@/components/Dashboard";
import { AppShell } from "@/components/layout/AppShell";
import { LayoutProvider } from "@/context/LayoutContext";
import { Button } from "@/components/ui/button";
import { GuestProvider, useGuest } from "@/context/GuestContext";

export default function App() {
  return (
    <LazyMotion features={() => import("./motionFeatures").then(m => m.default)} strict>
      <MotionConfig reducedMotion="user">
        <GuestProvider>
          <div className="min-h-screen relative z-0">
            <AppContent />
          </div>
        </GuestProvider>
      </MotionConfig>
    </LazyMotion>
  );
}

/**
 * Routes between guest mode, authenticated, and unauthenticated states.
 * Guest mode takes priority — if the user is in guest mode, show the
 * dashboard regardless of Clerk auth state.
 */
function AppContent() {
  const { isGuest } = useGuest();

  if (isGuest) {
    return <GuestContent />;
  }

  return (
    <>
      <Authenticated>
        <AuthenticatedContent />
      </Authenticated>
      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
    </>
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

/**
 * Guest mode content — renders the same Dashboard + AppShell,
 * but data comes from localStorage via GuestContext.
 */
function GuestContent() {
  const guest = useGuest();
  const [isGoalPlannerOpen, setIsGoalPlannerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleMajorUpdate = (major: string) => {
    guest.updateMajor(major);
  };

  const handleExport = useCallback(() => {
    if (!guest.transcript) return;
    const jsonString = JSON.stringify(guest.transcript, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gradify-export.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [guest.transcript]);

  return (
    <LayoutProvider>
      <AppShell
        major={guest.transcript?.major}
        cumulativeGPA={guest.transcript?.cumulativeGPA}
        onMajorUpdate={handleMajorUpdate}
        onGpaGoalClick={() => setIsGoalPlannerOpen(true)}
        onUploadClick={() => setIsUploadOpen(true)}
        onExportClick={handleExport}
        isGuest
      >
        {/* Guest banner */}
        <GuestBanner />
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

/**
 * Persistent banner shown to guest users encouraging sign-up.
 */
function GuestBanner() {
  const { exitGuestMode } = useGuest();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mx-12 max-lg:mx-8 max-md:mx-4 mb-4">
      <div className="rounded-2xl bg-primary/10 border border-primary/20 px-5 py-3 flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
        <div className="flex items-center gap-3 min-w-0">
          <UserRound className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">Guest mode</span> — your data is stored locally in this browser.{" "}
            <SignInButton mode="modal">
              <button
                className="text-primary hover:underline font-medium cursor-pointer"
                onClick={() => exitGuestMode()}
              >
                Sign in
              </button>
            </SignInButton>{" "}
            to save permanently.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

function LandingPage() {
  const { enterGuestMode } = useGuest();

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
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto min-w-[160px]"
            onClick={enterGuestMode}
          >
            <UserRound className="mr-2 h-4 w-4" />
            Sign In as Guest
          </Button>
        </div>

        {/* Sign-up text link */}
        <p className="mt-5 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <SignUpButton mode="modal">
            <button className="text-primary hover:underline font-medium cursor-pointer">
              Create one
            </button>
          </SignUpButton>
        </p>

        <p className="mt-6 text-xs text-muted-foreground">
          Built for AUIS students · Your data stays private
        </p>
      </div>
    </div>
  );
}

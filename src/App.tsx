import {
  Authenticated,
  Unauthenticated,
  useMutation,
} from "convex/react";
import { useEffect } from "react";
import { api } from "../convex/_generated/api";
import { SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Authenticated>
          <AuthenticatedContent />
        </Authenticated>
        <Unauthenticated>
          <LandingPage />
        </Unauthenticated>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="text-xl font-serif font-bold tracking-tight">
            Gradify
          </span>
        </div>
        <Authenticated>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
        </Authenticated>
      </div>
    </header>
  );
}

function AuthenticatedContent() {
  const upsertUser = useMutation(api.users.upsertUser);

  // Ensure user exists in database on first load
  useEffect(() => {
    upsertUser();
  }, [upsertUser]);

  return <Dashboard />;
}

function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-6 ring-1 ring-primary/20">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight mb-4">
            Track Your Academic Journey
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Upload your AUIS transcript, track your GPA in real-time, and simulate 
            future grades to plan your path to success.
          </p>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="text-3xl mb-2">📄</div>
            <h3 className="font-semibold mb-1">PDF Import</h3>
            <p className="text-sm text-muted-foreground">
              Upload your unofficial transcript and we'll parse it automatically
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold mb-1">GPA Tracking</h3>
            <p className="text-sm text-muted-foreground">
              See your semester and cumulative GPA update in real-time
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold mb-1">Grade Simulation</h3>
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

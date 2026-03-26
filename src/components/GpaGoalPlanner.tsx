import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import {
  Target,
  Settings,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { PathwayDisplay } from "./PathwayDisplay";
import { InteractivePlanner } from "./InteractivePlanner";
import {
  calculateCurrentStats,
  generatePathway,
  STRATEGY_TARGETS,
  type GradeStrategy,
  type GoalCalculationInput,
  type PathwayResult,
} from "@/lib/goalCalculator";
import type { Semester } from "@/lib/gpaCalculator";

interface GpaGoalPlannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semesters: Semester[];
}

type PlanningMode = "breakdown" | "interactive";
type Step = "settings" | "goal" | "results";

export function GpaGoalPlanner({
  open,
  onOpenChange,
  semesters,
}: GpaGoalPlannerProps) {
  const [step, setStep] = useState<Step>("settings");
  const [planningMode, setPlanningMode] = useState<PlanningMode>("breakdown");

  // Settings state
  const [graduationCredits, setGraduationCredits] = useState<string>("");
  const [maxSemesters, setMaxSemesters] = useState<string>("");
  const [coursesPerSemester, setCoursesPerSemester] = useState<string>("5");
  const [creditsPerCourse, setCreditsPerCourse] = useState<string>("3");
  const [includeWinterSummer, setIncludeWinterSummer] = useState(true);

  // Goal state
  const [targetGPA, setTargetGPA] = useState<string>("");
  const [strategy, setStrategy] = useState<GradeStrategy>("balanced");
  const [customTargetGrade, setCustomTargetGrade] = useState<string>("3.0");

  // Results
  const [pathway, setPathway] = useState<PathwayResult | null>(null);

  // Load saved settings
  const savedSettings = useQuery(api.users.getGraduationSettings);
  const updateSettings = useMutation(api.users.updateGraduationSettings);

  // Calculate current stats (includes IP credits and semesters)
  const currentStats = useMemo(() => calculateCurrentStats(semesters), [semesters]);

  // Credits remaining calculation (includes IP credits that need grades)
  const creditsRemaining = useMemo(() => {
    const gradCredits = parseInt(graduationCredits) || 0;
    // Subtract only completed credits (not IP credits) from graduation total
    return Math.max(0, gradCredits - currentStats.totalCredits);
  }, [graduationCredits, currentStats.totalCredits]);

  // Get last completed semester name for generating future names
  // (skip semesters that only have IP courses)
  const lastCompletedSemesterName = useMemo(() => {
    const actualSemesters = semesters.filter((s) => !s.planned);
    // Find the last semester that has at least one non-IP course
    for (let i = actualSemesters.length - 1; i >= 0; i--) {
      const sem = actualSemesters[i];
      const hasCompletedCourse = sem.courses.some(
        (c) => c.gradeType !== "in_progress" && c.grade !== "IP"
      );
      if (hasCompletedCourse) {
        return sem.name;
      }
    }
    // If all semesters have only IP courses, return the last one before the IP semesters
    // or undefined if there are no completed semesters
    const nonIpSemesters = actualSemesters.filter((sem) =>
      sem.courses.some((c) => c.gradeType !== "in_progress" && c.grade !== "IP")
    );
    return nonIpSemesters.length > 0
      ? nonIpSemesters[nonIpSemesters.length - 1].name
      : undefined;
  }, [semesters]);

  // Load saved settings when they become available
  useEffect(() => {
    if (savedSettings) {
      if (savedSettings.graduationCredits) {
        setGraduationCredits(savedSettings.graduationCredits.toString());
      }
      if (savedSettings.maxSemesters) {
        setMaxSemesters(savedSettings.maxSemesters.toString());
      }
      if (savedSettings.coursesPerSemester) {
        setCoursesPerSemester(savedSettings.coursesPerSemester.toString());
      }
      if (savedSettings.creditsPerCourse) {
        setCreditsPerCourse(savedSettings.creditsPerCourse.toString());
      }
      if (savedSettings.includeWinterSummer !== undefined) {
        setIncludeWinterSummer(savedSettings.includeWinterSummer);
      }
    }
  }, [savedSettings]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep("settings");
      setPathway(null);
    }
  }, [open]);

  // Save settings
  const handleSaveSettings = async () => {
    await updateSettings({
      graduationCredits: parseInt(graduationCredits) || undefined,
      maxSemesters: parseInt(maxSemesters) || undefined,
      coursesPerSemester: parseInt(coursesPerSemester) || 5,
      creditsPerCourse: parseInt(creditsPerCourse) || 3,
      includeWinterSummer,
    });
  };

  // Calculate pathway
  const handleCalculate = () => {
    const input: GoalCalculationInput = {
      currentCredits: currentStats.totalCredits,
      currentQualityPoints: currentStats.totalQualityPoints,
      currentGPA: currentStats.currentGPA,
      targetGPA: parseFloat(targetGPA) || 3.0,
      creditsRemaining,
      strategy,
      customTargetGrade: strategy === "custom" ? parseFloat(customTargetGrade) : undefined,
      coursesPerSemester: parseInt(coursesPerSemester) || 5,
      creditsPerCourse: parseInt(creditsPerCourse) || 3,
      includeWinterSummer,
      lastSemesterName: lastCompletedSemesterName,
      inProgressSemesters: currentStats.inProgressSemesters,
    };


    const result = generatePathway(input);
    setPathway(result);
    setStep("results");
  };

  // Settings validation
  const settingsValid = graduationCredits && parseInt(graduationCredits) > currentStats.totalCredits;

  // Goal validation
  const goalValid = targetGPA && parseFloat(targetGPA) > 0 && parseFloat(targetGPA) <= 4.0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="h-5 w-5 text-primary" />
            GPA Goal Planner
          </DialogTitle>
          <DialogDescription>
            Plan your pathway to reach your target GPA
          </DialogDescription>
        </DialogHeader>

        {/* Step: Settings */}
        {step === "settings" && (
          <div className="space-y-6">
            {/* Current Status */}
            <div className="p-6 rounded-[2rem] bg-secondary space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Info className="h-4 w-4" />
                Current Status
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Current GPA:</span>{" "}
                  <span className="font-semibold">{currentStats.currentGPA.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Credits Earned:</span>{" "}
                  <span className="font-semibold">{currentStats.totalCredits}</span>
                </div>
                {currentStats.inProgressCredits > 0 && (
                  <>
                    <div>
                      <span className="text-muted-foreground">In-Progress Credits:</span>{" "}
                      <span className="font-semibold text-amber-600">
                        {currentStats.inProgressCredits}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IP Semesters:</span>{" "}
                      <span className="font-semibold text-amber-600">
                        {currentStats.inProgressSemesters.length}
                      </span>
                    </div>
                  </>
                )}
              </div>
              {currentStats.inProgressCredits > 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  Your in-progress courses will be included in the plan with suggested grades.
                </p>
              )}
            </div>

            {/* Graduation Settings */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Graduation Requirements
              </h3>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="graduationCredits">
                    Total Credits Required to Graduate *
                  </Label>
                  <Input
                    id="graduationCredits"
                    type="number"
                    min={currentStats.totalCredits + 1}
                    placeholder="e.g., 127 for Engineering"
                    value={graduationCredits}
                    onChange={(e) => setGraduationCredits(e.target.value)}
                  />
                  {graduationCredits && (
                    <p className="text-xs text-muted-foreground">
                      Credits remaining: <span className="font-medium">{creditsRemaining}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxSemesters">
                    Maximum Semesters Remaining (optional)
                  </Label>
                  <Input
                    id="maxSemesters"
                    type="number"
                    min={1}
                    placeholder="Leave empty if flexible"
                    value={maxSemesters}
                    onChange={(e) => setMaxSemesters(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Set this if you have a graduation timeline
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coursesPerSemester">Courses per Semester</Label>
                    <Input
                      id="coursesPerSemester"
                      type="number"
                      min={1}
                      max={8}
                      value={coursesPerSemester}
                      onChange={(e) => setCoursesPerSemester(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creditsPerCourse">Credits per Course</Label>
                    <Input
                      id="creditsPerCourse"
                      type="number"
                      min={1}
                      max={6}
                      value={creditsPerCourse}
                      onChange={(e) => setCreditsPerCourse(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary">
                  <div>
                    <Label htmlFor="includeWinterSummer" className="cursor-pointer">
                      Include Winter/Summer Terms
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Suggest extra terms if needed to reach goal faster
                    </p>
                  </div>
                  <input
                    id="includeWinterSummer"
                    type="checkbox"
                    checked={includeWinterSummer}
                    onChange={(e) => setIncludeWinterSummer(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  handleSaveSettings();
                  setStep("goal");
                }}
                disabled={!settingsValid}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Goal */}
        {step === "goal" && (
          <div className="space-y-6">
            {/* Target GPA */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetGPA">Target GPA *</Label>
                <Input
                  id="targetGPA"
                  type="number"
                  step="0.01"
                  min={0}
                  max={4}
                  placeholder="e.g., 3.5"
                  value={targetGPA}
                  onChange={(e) => setTargetGPA(e.target.value)}
                />
              </div>

              {/* Strategy Selection */}
              <div className="space-y-2">
                <Label>Grade Strategy</Label>
                <Select value={strategy} onValueChange={(v) => setStrategy(v as GradeStrategy)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">
                      <div className="flex flex-col items-start">
                        <span>Conservative (~{STRATEGY_TARGETS.conservative.toFixed(1)} avg)</span>
                        <span className="text-xs text-muted-foreground">
                          Mostly B/B- grades, achievable with moderate effort
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="balanced">
                      <div className="flex flex-col items-start">
                        <span>Balanced (~{STRATEGY_TARGETS.balanced.toFixed(1)} avg)</span>
                        <span className="text-xs text-muted-foreground">
                          Mix of A's and B's, consistent effort required
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ambitious">
                      <div className="flex flex-col items-start">
                        <span>Ambitious (~{STRATEGY_TARGETS.ambitious.toFixed(1)} avg)</span>
                        <span className="text-xs text-muted-foreground">
                          Mostly A/A- grades, high effort required
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="custom">
                      <div className="flex flex-col items-start">
                        <span>Custom Target</span>
                        <span className="text-xs text-muted-foreground">
                          Set your own target grade average
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {strategy === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="customTargetGrade">Custom Target Grade Average</Label>
                  <Input
                    id="customTargetGrade"
                    type="number"
                    step="0.1"
                    min={0}
                    max={4}
                    value={customTargetGrade}
                    onChange={(e) => setCustomTargetGrade(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a GPA value (0.0 - 4.0) you aim to average in future courses
                  </p>
                </div>
              )}

              {/* Planning Mode */}
              <div className="space-y-2">
                <Label>Planning Mode</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPlanningMode("breakdown")}
                    className={`p-4 rounded-[2rem] text-left transition-all hover:scale-[1.02] ${
                      planningMode === "breakdown"
                        ? "bg-gradient-to-br from-primary/20 to-[var(--color-primary-container)]/20"
                        : "bg-secondary hover:bg-muted"
                    }`}
                  >
                    <h4 className="font-medium">Semester Breakdown</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      View a semester-by-semester plan with suggested grades
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanningMode("interactive")}
                    className={`p-4 rounded-[2rem] text-left transition-all hover:scale-[1.02] ${
                      planningMode === "interactive"
                        ? "bg-gradient-to-br from-primary/20 to-[var(--color-primary-container)]/20"
                        : "bg-secondary hover:bg-muted"
                    }`}
                  >
                    <h4 className="font-medium">Interactive Planner</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Adjust grades and courses with live GPA updates
                    </p>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("settings")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleCalculate} disabled={!goalValid}>
                Calculate Pathway
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Results */}
        {step === "results" && pathway && (
          <div className="space-y-6">
            {/* Feasibility Status */}
            <div
              className={`p-4 rounded-[2rem] ${
                pathway.feasibility.isAchievable
                  ? "bg-green-500/10"
                  : "bg-amber-500/10"
              }`}
            >
              <div className="flex items-start gap-3">
                {pathway.feasibility.isAchievable ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                )}
                <div>
                  <h3 className="font-medium">
                    {pathway.feasibility.isAchievable
                      ? "Goal is Achievable!"
                      : "Goal Not Achievable"}
                  </h3>
                  <p className="text-sm mt-1">{pathway.feasibility.message}</p>
                  {!pathway.feasibility.isAchievable && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Maximum Possible GPA: </span>
                      {pathway.feasibility.maxPossibleGPA.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Planning Mode Content */}
            {planningMode === "breakdown" ? (
              <PathwayDisplay
                pathway={pathway}
                currentStats={currentStats}
                targetGPA={parseFloat(targetGPA)}
                onClose={() => onOpenChange(false)}
              />
            ) : (
              <InteractivePlanner
                initialPathway={pathway}
                currentStats={currentStats}
                targetGPA={parseFloat(targetGPA)}
                onClose={() => onOpenChange(false)}
              />
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("goal")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Adjust Goal
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

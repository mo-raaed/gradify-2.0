/**
 * GPA Goal Calculator
 * Functions for calculating pathways to reach a target GPA
 */

import {
  GRADE_POINTS,
  generateId,
  roundToTwoDecimals,
  type Semester,
} from "./gpaCalculator";

// Re-export for use in components
export { generateId };

// ============================================================================
// TYPES
// ============================================================================

export type GradeStrategy = "conservative" | "balanced" | "ambitious" | "custom";

export interface GraduationSettings {
  graduationCredits?: number;
  maxSemesters?: number;
  coursesPerSemester?: number;
  creditsPerCourse?: number;
  includeWinterSummer?: boolean;
}

export interface GoalCalculationInput {
  currentCredits: number;
  currentQualityPoints: number;
  currentGPA: number;
  targetGPA: number;
  creditsRemaining: number;
  strategy: GradeStrategy;
  customTargetGrade?: number; // For custom strategy
  coursesPerSemester: number;
  creditsPerCourse: number;
  includeWinterSummer: boolean;
  lastSemesterName?: string; // To generate next semester names
  inProgressSemesters?: Semester[]; // Semesters with IP courses to include in plan
}

export interface GoalFeasibility {
  isAchievable: boolean;
  requiredGradeAverage: number;
  maxPossibleGPA: number;
  minPossibleGPA: number;
  creditsNeeded: number;
  semestersNeeded: number;
  message: string;
}

export interface PlannedCourse {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  gradePoints: number;
}

export interface PlannedSemester {
  id: string;
  name: string;
  type: "regular" | "winter" | "summer";
  courses: PlannedCourse[];
  semesterGPA: number;
  projectedCumulativeGPA: number;
  isExisting?: boolean; // True if this is an existing semester with IP courses
}

export interface PathwayResult {
  feasibility: GoalFeasibility;
  semesters: PlannedSemester[];
  finalProjectedGPA: number;
  totalNewCredits: number;
  winterSummerRecommended: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Strategy grade targets (average GPA to aim for)
export const STRATEGY_TARGETS: Record<Exclude<GradeStrategy, "custom">, number> = {
  conservative: 2.85, // ~B- to B average
  balanced: 3.15, // ~B to B+ average
  ambitious: 3.6, // ~A- average
};

// Grade distribution templates for each strategy
// These define the mix of grades that achieve the target average
export const STRATEGY_DISTRIBUTIONS: Record<Exclude<GradeStrategy, "custom">, string[]> = {
  conservative: ["B", "B", "B-", "C+", "B+"], // avg ~2.86
  balanced: ["B+", "B+", "B", "B", "A-"], // avg ~3.14
  ambitious: ["A", "A", "A-", "A-", "B+"], // avg ~3.6
};

// All available grades in order
export const GRADES_ORDERED = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get grade from GPA value (find closest grade)
 */
export function gradeFromGPA(gpa: number): string {
  let closestGrade = "F";
  let closestDiff = Infinity;

  for (const [grade, points] of Object.entries(GRADE_POINTS)) {
    if (["IP", "W", "WF", "P"].includes(grade)) continue;
    const diff = Math.abs(points - gpa);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestGrade = grade;
    }
  }

  return closestGrade;
}

/**
 * Generate a distribution of grades that averages to a target GPA
 */
export function generateGradeDistribution(
  targetAvgGPA: number,
  courseCount: number
): string[] {
  const grades: string[] = [];
  let remainingPoints = targetAvgGPA * courseCount;

  for (let i = 0; i < courseCount; i++) {
    const isLast = i === courseCount - 1;
    const remainingCourses = courseCount - i;

    if (isLast) {
      // For the last course, just pick the closest grade
      grades.push(gradeFromGPA(remainingPoints));
    } else {
      // Calculate what grade we need
      const avgNeeded = remainingPoints / remainingCourses;

      // Pick a grade slightly above or at the average to allow flexibility
      let bestGrade = "B";
      let bestPoints = GRADE_POINTS["B"];

      for (const grade of GRADES_ORDERED) {
        const points = GRADE_POINTS[grade];
        // Prefer grades close to but not exceeding what we need
        if (points <= avgNeeded + 0.5 && points >= avgNeeded - 0.5) {
          bestGrade = grade;
          bestPoints = points;
          break;
        }
      }

      grades.push(bestGrade);
      remainingPoints -= bestPoints;
    }
  }

  return grades;
}

/**
 * Parse semester name to extract year and term
 */
export function parseSemesterName(name: string): { year: number; term: string } | null {
  const match = /^(\d{4})\/\d{2} (Fall|Winter|Spring|Summer)$/.exec(name);
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    term: match[2],
  };
}

/**
 * Generate the next semester name based on the last semester
 * Academic year order: Fall -> Winter -> Spring -> Summer (all same academic year)
 * Academic year increments only when going from Summer to Fall
 * Example: 2026/27 Fall -> 2026/27 Winter -> 2026/27 Spring -> 2026/27 Summer -> 2027/28 Fall
 */
export function getNextSemesterName(
  lastSemesterName: string | undefined,
  termType: "regular" | "winter" | "summer" = "regular"
): string {
  const now = new Date();
  let year = now.getFullYear();
  let term: string;

  if (lastSemesterName) {
    const parsed = parseSemesterName(lastSemesterName);
    if (parsed) {
      year = parsed.year;

      if (termType === "winter") {
        // Winter follows Fall (same academic year)
        if (parsed.term === "Fall") {
          term = "Winter";
          // Same academic year
        } else if (parsed.term === "Summer") {
          // After Summer, go to next academic year's Winter (skip Fall)
          term = "Winter";
          year += 1;
        } else {
          // From Winter or Spring, stay in same year
          term = "Winter";
        }
      } else if (termType === "summer") {
        // Summer follows Spring (same academic year)
        if (parsed.term === "Summer") {
          // After Summer, go to next year's Summer
          term = "Summer";
          year += 1;
        } else {
          // From Fall, Winter, or Spring - same academic year
          term = "Summer";
        }
      } else {
        // Regular semesters: Fall -> Spring -> Fall (skipping Winter and Summer)
        if (parsed.term === "Fall" || parsed.term === "Winter") {
          // After Fall/Winter comes Spring (same academic year)
          term = "Spring";
        } else {
          // After Spring/Summer comes Fall (NEXT academic year)
          term = "Fall";
          year += 1;
        }
      }
    } else {
      // Default if can't parse
      term = termType === "winter" ? "Winter" : termType === "summer" ? "Summer" : "Fall";
    }
  } else {
    // No previous semester, start based on current date
    const month = now.getMonth();
    if (month >= 8) {
      term = "Fall";
    } else if (month >= 5) {
      term = termType === "summer" ? "Summer" : "Fall";
    } else if (month >= 1) {
      term = "Spring";
    } else {
      term = termType === "winter" ? "Winter" : "Spring";
    }
  }

  // Format as "2024/25 Fall"
  const yearStr = `${year}/${(year + 1).toString().slice(-2)}`;
  return `${yearStr} ${term!}`;
}

/**
 * Generate a sequence of semester names
 */
export function generateSemesterSequence(
  startAfter: string | undefined,
  count: number,
  includeWinterSummer: boolean
): Array<{ name: string; type: "regular" | "winter" | "summer" }> {
  const semesters: Array<{ name: string; type: "regular" | "winter" | "summer" }> = [];
  let lastSemester = startAfter;

  for (let i = 0; i < count; i++) {
    // Determine if this should be a special term
    let type: "regular" | "winter" | "summer" = "regular";

    if (includeWinterSummer && lastSemester) {
      const parsed = parseSemesterName(lastSemester);
      if (parsed) {
        // After Fall, consider Winter
        if (parsed.term === "Fall" && i > 0) {
          type = "winter";
        }
        // After Spring, consider Summer
        if (parsed.term === "Spring") {
          type = "summer";
        }
      }
    }

    const name = getNextSemesterName(lastSemester, type);
    semesters.push({ name, type });
    lastSemester = name;
  }

  return semesters;
}

// ============================================================================
// MAIN CALCULATION FUNCTIONS
// ============================================================================

/**
 * Find semesters that contain in-progress (IP) courses
 */
export function findInProgressSemesters(semesters: Semester[]): Semester[] {
  return semesters.filter((semester) => {
    // Skip already planned semesters
    if ((semester as Semester & { planned?: boolean }).planned) return false;
    
    // Check if semester has any IP courses
    return semester.courses.some(
      (course) => course.gradeType === "in_progress" || course.grade === "IP"
    );
  });
}

/**
 * Calculate the quality points from existing semesters
 * Excludes IP courses and planned semesters from the calculation
 */
export function calculateCurrentStats(semesters: Semester[]): {
  totalCredits: number;
  totalQualityPoints: number;
  currentGPA: number;
  inProgressCredits: number;
  inProgressSemesters: Semester[];
} {
  let totalCredits = 0;
  let totalQualityPoints = 0;
  let inProgressCredits = 0;

  for (const semester of semesters) {
    // Skip planned semesters
    if ((semester as Semester & { planned?: boolean }).planned) continue;

    for (const course of semester.courses) {
      // Track IP credits separately
      if (course.gradeType === "in_progress" || course.grade === "IP") {
        inProgressCredits += course.credits;
        continue;
      }
      
      if (course.includeInGpa && !course.retaken) {
        totalCredits += course.credits;
        totalQualityPoints += course.credits * (GRADE_POINTS[course.grade] ?? 0);
      }
    }
  }

  const currentGPA = totalCredits > 0 ? roundToTwoDecimals(totalQualityPoints / totalCredits) : 0;
  const inProgressSemesters = findInProgressSemesters(semesters);

  return { totalCredits, totalQualityPoints, currentGPA, inProgressCredits, inProgressSemesters };
}

/**
 * Check if a GPA goal is achievable and calculate requirements
 */
export function checkGoalFeasibility(input: GoalCalculationInput): GoalFeasibility {
  const { currentCredits, currentQualityPoints, targetGPA, creditsRemaining } = input;

  // Calculate max possible GPA (all A's for remaining credits)
  const maxPossiblePoints = currentQualityPoints + creditsRemaining * 4.0;
  const maxPossibleGPA = roundToTwoDecimals(maxPossiblePoints / (currentCredits + creditsRemaining));

  // Calculate min possible GPA (all F's for remaining credits)
  const minPossiblePoints = currentQualityPoints + creditsRemaining * 0;
  const minPossibleGPA = roundToTwoDecimals(minPossiblePoints / (currentCredits + creditsRemaining));

  // Calculate required quality points to reach target
  const totalCreditsAfter = currentCredits + creditsRemaining;
  const requiredTotalPoints = targetGPA * totalCreditsAfter;
  const requiredNewPoints = requiredTotalPoints - currentQualityPoints;
  const requiredGradeAverage = creditsRemaining > 0 ? roundToTwoDecimals(requiredNewPoints / creditsRemaining) : 0;

  // Check feasibility
  const isAchievable = requiredGradeAverage <= 4.0 && requiredGradeAverage >= 0;

  // Calculate semesters needed
  const creditsPerSemester = input.coursesPerSemester * input.creditsPerCourse;
  const semestersNeeded = Math.ceil(creditsRemaining / creditsPerSemester);

  let message: string;
  if (isAchievable) {
    if (requiredGradeAverage >= 3.7) {
      message = `Achievable but challenging! You need an average of ${requiredGradeAverage.toFixed(2)} (mostly A's) across your remaining ${creditsRemaining} credits.`;
    } else if (requiredGradeAverage >= 3.0) {
      message = `Achievable with consistent effort. You need an average of ${requiredGradeAverage.toFixed(2)} (B+ range) across your remaining ${creditsRemaining} credits.`;
    } else {
      message = `Very achievable! You need an average of ${requiredGradeAverage.toFixed(2)} across your remaining ${creditsRemaining} credits.`;
    }
  } else if (requiredGradeAverage > 4.0) {
    message = `This goal is not achievable with ${creditsRemaining} remaining credits. The maximum GPA you can reach is ${maxPossibleGPA.toFixed(2)}.`;
  } else {
    message = `This goal is already below your projected minimum GPA of ${minPossibleGPA.toFixed(2)}.`;
  }

  return {
    isAchievable,
    requiredGradeAverage,
    maxPossibleGPA,
    minPossibleGPA,
    creditsNeeded: creditsRemaining,
    semestersNeeded,
    message,
  };
}

/**
 * Generate a pathway of planned semesters to reach the goal
 * Includes existing semesters with IP courses first, then adds new planned semesters
 */
export function generatePathway(input: GoalCalculationInput): PathwayResult {
  const feasibility = checkGoalFeasibility(input);

  // If not achievable, still generate best-effort pathway
  const targetAvgGrade = feasibility.isAchievable
    ? getTargetGradeForStrategy(input.strategy, input.customTargetGrade, feasibility.requiredGradeAverage)
    : 4.0; // Max effort if goal not achievable

  const {
    creditsRemaining,
    coursesPerSemester,
    creditsPerCourse,
    includeWinterSummer,
    lastSemesterName,
    currentCredits,
    currentQualityPoints,
    inProgressSemesters,
  } = input;

  const semesters: PlannedSemester[] = [];
  let remainingCredits = creditsRemaining;
  let runningCredits = currentCredits;
  let runningQualityPoints = currentQualityPoints;
  let lastSemName = lastSemesterName;
  let winterSummerRecommended = false;

  // First, include existing semesters with IP courses
  if (inProgressSemesters && inProgressSemesters.length > 0) {
    for (const ipSemester of inProgressSemesters) {
      // Get IP courses from this semester
      const ipCourses = ipSemester.courses.filter(
        (c) => c.gradeType === "in_progress" || c.grade === "IP"
      );

      if (ipCourses.length === 0) continue;

      // Calculate how many grades we need for this semester
      const courseCount = ipCourses.length;
      const grades = generateGradeDistribution(targetAvgGrade, courseCount);

      // Create planned courses from IP courses
      const courses: PlannedCourse[] = ipCourses.map((course, i) => {
        const grade = grades[i] || "B";
        const gradePoints = course.credits * (GRADE_POINTS[grade] ?? 0);
        return {
          id: course.id,
          courseCode: course.courseCode,
          courseName: course.courseName,
          credits: course.credits,
          grade,
          gradePoints,
        };
      });

      // Calculate semester stats
      let semesterCredits = 0;
      let semesterQualityPoints = 0;
      for (const course of courses) {
        semesterCredits += course.credits;
        semesterQualityPoints += course.gradePoints;
      }

      remainingCredits -= semesterCredits;
      runningCredits += semesterCredits;
      runningQualityPoints += semesterQualityPoints;

      const semesterGPA = semesterCredits > 0 
        ? roundToTwoDecimals(semesterQualityPoints / semesterCredits) 
        : 0;
      const projectedCumulativeGPA = runningCredits > 0 
        ? roundToTwoDecimals(runningQualityPoints / runningCredits) 
        : 0;

      // Determine semester type from name
      let semesterType: "regular" | "winter" | "summer" = "regular";
      const parsed = parseSemesterName(ipSemester.name);
      if (parsed) {
        if (parsed.term === "Winter") semesterType = "winter";
        else if (parsed.term === "Summer") semesterType = "summer";
      }

      semesters.push({
        id: ipSemester.id,
        name: ipSemester.name,
        type: semesterType,
        courses,
        semesterGPA,
        projectedCumulativeGPA,
        isExisting: true,
      });

      lastSemName = ipSemester.name;
    }
  }

  // Now generate additional planned semesters if needed
  let semesterIndex = 0;

  while (remainingCredits > 0) {
    semesterIndex++;

    // Determine semester type
    let semesterType: "regular" | "winter" | "summer" = "regular";
    const maxCourses = coursesPerSemester;

    // After generating a few regular semesters, check if winter/summer would help
    if (includeWinterSummer && semesterIndex > 2 && lastSemName) {
      const parsed = parseSemesterName(lastSemName);
      if (parsed && (parsed.term === "Fall" || parsed.term === "Spring")) {
        // Could add a winter or summer term
        winterSummerRecommended = true;
      }
    }

    // Generate semester name
    const semesterName = getNextSemesterName(lastSemName, semesterType);

    // Determine courses for this semester
    const coursesThisSemester = Math.min(
      maxCourses,
      Math.ceil(remainingCredits / creditsPerCourse)
    );

    // Generate grades for courses
    const grades = generateGradeDistribution(targetAvgGrade, coursesThisSemester);

    // Create courses
    const courses: PlannedCourse[] = [];
    let semesterQualityPoints = 0;
    let semesterCredits = 0;

    for (let i = 0; i < coursesThisSemester; i++) {
      const credits = Math.min(creditsPerCourse, remainingCredits - semesterCredits);
      if (credits <= 0) break;

      const grade = grades[i] || "B";
      const gradePoints = credits * (GRADE_POINTS[grade] ?? 0);

      courses.push({
        id: generateId(),
        courseCode: `PLN ${100 + semesters.length * 10 + i}`,
        courseName: `Planned Course ${i + 1}`,
        credits,
        grade,
        gradePoints,
      });

      semesterCredits += credits;
      semesterQualityPoints += gradePoints;
    }

    remainingCredits -= semesterCredits;
    runningCredits += semesterCredits;
    runningQualityPoints += semesterQualityPoints;

    const semesterGPA = roundToTwoDecimals(semesterQualityPoints / semesterCredits);
    const projectedCumulativeGPA = roundToTwoDecimals(runningQualityPoints / runningCredits);

    semesters.push({
      id: generateId(),
      name: semesterName,
      type: semesterType,
      courses,
      semesterGPA,
      projectedCumulativeGPA,
      isExisting: false,
    });

    lastSemName = semesterName;

    // Safety limit
    if (semesters.length > 20) break;
  }

  return {
    feasibility,
    semesters,
    finalProjectedGPA: semesters.length > 0
      ? semesters[semesters.length - 1].projectedCumulativeGPA
      : input.currentGPA,
    totalNewCredits: creditsRemaining - remainingCredits,
    winterSummerRecommended: winterSummerRecommended && includeWinterSummer,
  };
}

/**
 * Get the target grade average based on strategy
 */
function getTargetGradeForStrategy(
  strategy: GradeStrategy,
  customTarget: number | undefined,
  requiredAverage: number
): number {
  if (strategy === "custom" && customTarget !== undefined) {
    return customTarget;
  }

  const strategyTarget = STRATEGY_TARGETS[strategy as Exclude<GradeStrategy, "custom">] ?? 3.0;

  // Use the higher of strategy target or required average
  // This ensures we at least meet the goal
  return Math.max(strategyTarget, requiredAverage);
}

/**
 * Separate planned semesters into updates for existing IP semesters and new planned semesters
 */
export function separatePlannedSemesters(
  plannedSemesters: PlannedSemester[]
): {
  existingUpdates: Array<{
    semesterName: string;
    courses: Array<{
      id: string;
      courseCode: string;
      courseName: string;
      credits: number;
      grade: string;
      gradePoints: number;
      includeInGpa: boolean;
      gradeType: "normal" | "in_progress" | "withdrawn" | "withdraw_fail";
      retaken: boolean;
    }>;
  }>;
  newPlannedSemesters: Semester[];
} {
  const existingUpdates: Array<{
    semesterName: string;
    courses: Array<{
      id: string;
      courseCode: string;
      courseName: string;
      credits: number;
      grade: string;
      gradePoints: number;
      includeInGpa: boolean;
      gradeType: "normal" | "in_progress" | "withdrawn" | "withdraw_fail";
      retaken: boolean;
    }>;
  }> = [];
  
  const newPlannedSemesters: Semester[] = [];

  plannedSemesters.forEach((planned) => {
    const courses = planned.courses.map((course) => ({
      id: course.id,
      courseCode: course.courseCode,
      courseName: course.courseName,
      credits: course.credits,
      grade: course.grade,
      gradePoints: course.gradePoints,
      includeInGpa: true,
      gradeType: "normal" as const,
      retaken: false,
    }));

    if (planned.isExisting) {
      // This is an existing IP semester - update it in place
      existingUpdates.push({
        semesterName: planned.name,
        courses,
      });
    } else {
      // This is a new planned semester
      newPlannedSemesters.push({
        id: planned.id,
        name: planned.name,
        semesterGPA: planned.semesterGPA,
        cumulativeGPA: planned.projectedCumulativeGPA,
        courses,
        planned: true,
      });
    }
  });

  return { existingUpdates, newPlannedSemesters };
}

/**
 * Convert planned semesters to saveable format (legacy - for backward compatibility)
 */
export function convertToSaveableSemesters(
  plannedSemesters: PlannedSemester[]
): Semester[] {
  return plannedSemesters.map((planned, index) => ({
    id: planned.id,
    name: planned.name,
    semesterGPA: planned.semesterGPA,
    cumulativeGPA: index === plannedSemesters.length - 1
      ? planned.projectedCumulativeGPA
      : plannedSemesters[index].projectedCumulativeGPA,
    courses: planned.courses.map((course) => ({
      id: course.id,
      courseCode: course.courseCode,
      courseName: course.courseName,
      credits: course.credits,
      grade: course.grade,
      gradePoints: course.gradePoints,
      includeInGpa: true,
      gradeType: "normal" as const,
      retaken: false,
    })),
    planned: true,
  }));
}

/**
 * Recalculate pathway when user adjusts grades interactively
 */
export function recalculatePathway(
  semesters: PlannedSemester[],
  currentCredits: number,
  currentQualityPoints: number
): PlannedSemester[] {
  let runningCredits = currentCredits;
  let runningQualityPoints = currentQualityPoints;

  return semesters.map((semester) => {
    let semesterCredits = 0;
    let semesterQualityPoints = 0;

    const updatedCourses = semester.courses.map((course) => {
      const gradePoints = course.credits * (GRADE_POINTS[course.grade] ?? 0);
      semesterCredits += course.credits;
      semesterQualityPoints += gradePoints;
      return { ...course, gradePoints };
    });

    runningCredits += semesterCredits;
    runningQualityPoints += semesterQualityPoints;

    return {
      ...semester,
      courses: updatedCourses,
      semesterGPA: semesterCredits > 0 ? roundToTwoDecimals(semesterQualityPoints / semesterCredits) : 0,
      projectedCumulativeGPA: runningCredits > 0 ? roundToTwoDecimals(runningQualityPoints / runningCredits) : 0,
    };
  });
}

/**
 * Apply effort slider to adjust all grades in pathway
 */
export function applyEffortLevel(
  semesters: PlannedSemester[],
  effortLevel: number, // 0-100, where 50 is balanced
  currentCredits: number,
  currentQualityPoints: number
): PlannedSemester[] {
  // Map effort level to target GPA
  // 0 = 2.0 (C), 50 = 3.0 (B), 100 = 4.0 (A)
  const targetGPA = 2.0 + (effortLevel / 100) * 2.0;

  const updatedSemesters = semesters.map((semester) => {
    const grades = generateGradeDistribution(targetGPA, semester.courses.length);
    const updatedCourses = semester.courses.map((course, i) => ({
      ...course,
      grade: grades[i] || course.grade,
    }));
    return { ...semester, courses: updatedCourses };
  });

  return recalculatePathway(updatedSemesters, currentCredits, currentQualityPoints);
}

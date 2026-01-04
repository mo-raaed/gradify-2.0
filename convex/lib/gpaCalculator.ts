/**
 * GPA Calculation Utilities
 * Ported from the old Flask backend and frontend utilities
 */

// Grade point mapping (AUIS grading scale)
export const GRADE_POINTS: Record<string, number> = {
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "C-": 1.7,
  "D+": 1.3,
  "D": 1.0,
  "F": 0.0,
  "IP": 0.0,  // In Progress
  "W": 0.0,   // Withdrawn
  "WF": 0.0,  // Withdraw Fail
  "P": 0.0,   // Pass (not included in GPA)
};

// Grades that are excluded from GPA calculation
export const EXCLUDE_GRADES = new Set(["W", "WF", "IP", "P"]);

// Term order for sorting semesters
export const TERM_ORDER: Record<string, number> = {
  "Fall": 0,
  "Winter": 1,
  "Spring": 2,
  "Summer": 3,
};

// Semester regex pattern: "2023/24 Fall"
export const SEMESTER_REGEX = /^(\d{4}\/\d{2}) (Fall|Winter|Spring|Summer)$/;

// Course interface matching the schema
export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  gradePoints: number;
  includeInGpa: boolean;
  gradeType: "normal" | "in_progress" | "withdrawn" | "withdraw_fail";
  retaken: boolean;
}

// Semester interface matching the schema
export interface Semester {
  id: string;
  name: string;
  semesterGPA: number;
  cumulativeGPA: number;
  courses: Course[];
  planned?: boolean; // True for planned/future semesters
}

// Transcript data interface
export interface TranscriptData {
  semesters: Semester[];
  cumulativeGPA: number;
}

/**
 * Check if a grade should be included in GPA calculation
 */
export function shouldIncludeInGpa(grade: string): boolean {
  return !EXCLUDE_GRADES.has(grade);
}

/**
 * Get the grade type from a grade string
 */
export function getGradeType(grade: string): Course["gradeType"] {
  if (grade === "W") return "withdrawn";
  if (grade === "WF") return "withdraw_fail";
  if (grade === "IP") return "in_progress";
  return "normal";
}

/**
 * Calculate grade points for a course
 */
export function calculateCourseGradePoints(credits: number, grade: string): number {
  if (!shouldIncludeInGpa(grade)) return 0;
  const gradePoint = GRADE_POINTS[grade] ?? 0;
  return roundToTwoDecimals(credits * gradePoint);
}

/**
 * Round a number to two decimal places
 */
export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Calculate GPA for a list of courses
 * Only includes courses that are marked as includeInGpa and not retaken
 */
export function calculateGPA(courses: Course[]): number {
  const eligibleCourses = courses.filter(
    (course) => course.includeInGpa && !course.retaken
  );

  if (eligibleCourses.length === 0) return 0;

  const totalCredits = eligibleCourses.reduce((sum, course) => sum + course.credits, 0);
  const totalPoints = eligibleCourses.reduce((sum, course) => {
    const gradePoint = GRADE_POINTS[course.grade] ?? 0;
    return sum + course.credits * gradePoint;
  }, 0);

  return totalCredits > 0 ? roundToTwoDecimals(totalPoints / totalCredits) : 0;
}

/**
 * Semester sort key for ordering semesters chronologically
 */
export function semesterSortKey(semesterName: string): [number, number] {
  const match = SEMESTER_REGEX.exec(semesterName);
  if (!match) return [0, 0];

  const [, yearRange, term] = match;
  const startYear = parseInt(yearRange.split("/")[0], 10);
  return [startYear, TERM_ORDER[term] ?? 0];
}

/**
 * Compare function for sorting semesters
 */
export function compareSemesters(a: Semester, b: Semester): number {
  const [yearA, termA] = semesterSortKey(a.name);
  const [yearB, termB] = semesterSortKey(b.name);
  
  if (yearA !== yearB) return yearA - yearB;
  return termA - termB;
}

/**
 * Detect and mark retaken courses
 * A course is retaken if the same course code appears in a later semester
 */
export function detectRetakes(semesters: Semester[]): Semester[] {
  // Build a map of course_code to the semester index of its last occurrence
  const lastOccurrence = new Map<string, number>();

  semesters.forEach((semester, semIndex) => {
    semester.courses.forEach((course) => {
      const currentLast = lastOccurrence.get(course.courseCode);
      if (currentLast === undefined || semIndex > currentLast) {
        lastOccurrence.set(course.courseCode, semIndex);
      }
    });
  });

  // Mark all courses that are not the last occurrence as retaken
  return semesters.map((semester, semIndex) => ({
    ...semester,
    courses: semester.courses.map((course) => ({
      ...course,
      retaken: lastOccurrence.get(course.courseCode) !== semIndex,
    })),
  }));
}

/**
 * Recalculate all GPAs for a transcript
 * This includes semester GPAs and cumulative GPAs
 */
export function recalculateAllGPAs(semesters: Semester[]): {
  semesters: Semester[];
  cumulativeGPA: number;
} {
  // First, detect and mark retaken courses
  const semestersWithRetakes = detectRetakes(semesters);

  // Collect all courses across all semesters
  const allCourses = semestersWithRetakes.flatMap((s) => s.courses);

  // Calculate the global cumulative GPA from all non-retaken, GPA-eligible courses
  const globalCumulativeGPA = calculateGPA(
    allCourses.filter((c) => !c.retaken && c.includeInGpa)
  );

  // Update semester GPAs and calculate cumulative GPA for each semester
  let cumulativeCourses: Course[] = [];
  let hasEncounteredRetake = false;

  const updatedSemesters = semestersWithRetakes.map((semester) => {
    // Check if this semester contains a retake
    const currentSemesterHasRetake = semester.courses.some(
      (course) => course.retaken === true
    );
    if (currentSemesterHasRetake) {
      hasEncounteredRetake = true;
    }

    // Add this semester's non-retaken courses to cumulative list
    const semesterNonRetakenCourses = semester.courses.filter((c) => !c.retaken);
    cumulativeCourses = [...cumulativeCourses, ...semesterNonRetakenCourses];

    // Determine which cumulative GPA to use
    let cumulativeGPA: number;
    if (hasEncounteredRetake) {
      // We've hit a retake - use global cumulative GPA
      cumulativeGPA = globalCumulativeGPA;
    } else {
      // Before any retakes - calculate cumulative GPA up to this semester
      cumulativeGPA = calculateGPA(cumulativeCourses.filter((c) => c.includeInGpa));
    }

    // Calculate semester GPA using only non-retaken courses
    const semesterGPA = calculateGPA(semester.courses.filter((c) => !c.retaken));

    return {
      ...semester,
      semesterGPA: roundToTwoDecimals(semesterGPA),
      cumulativeGPA: roundToTwoDecimals(cumulativeGPA),
    };
  });

  return {
    semesters: updatedSemesters,
    cumulativeGPA: roundToTwoDecimals(globalCumulativeGPA),
  };
}


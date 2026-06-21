import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  generateId,
  recalculateAllGPAs,
  calculateCourseGradePoints,
  shouldIncludeInGpa,
  getGradeType,
  type Course,
  type Semester,
  type TranscriptData,
} from "@/lib/gpaCalculator";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GuestTranscript {
  semesters: Semester[];
  cumulativeGPA: number;
  major?: string;
  updatedAt: number;
}

interface GuestContextValue {
  /** Whether the current session is a guest session */
  isGuest: boolean;
  /** Start a guest session */
  enterGuestMode: () => void;
  /** End the guest session (e.g. when the user signs in) */
  exitGuestMode: () => void;

  // Transcript data (mirrors Convex query shape) ────────────────────────
  /** null = no transcript yet, undefined = loading (never actually undefined for guest) */
  transcript: GuestTranscript | null;

  // Mutations (mirrors the Convex mutation API) ─────────────────────────
  saveTranscript: (data: TranscriptData) => void;
  addSemester: (name: string) => string;
  removeSemester: (semesterId: string) => void;
  addCourse: (semesterId: string, course: { courseCode: string; courseName: string; credits: number; grade: string }) => string;
  removeCourse: (semesterId: string, courseId: string) => void;
  updateCourse: (semesterId: string, courseId: string, updates: { courseCode?: string; courseName?: string; credits?: number; grade?: string }) => void;
  deleteTranscript: () => void;
  updateMajor: (major: string) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY_GUEST = "gradify_guest_mode";
const STORAGE_KEY_TRANSCRIPT = "gradify_guest_transcript";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const GuestContext = createContext<GuestContextValue | null>(null);

export function useGuest() {
  const ctx = useContext(GuestContext);
  if (!ctx) throw new Error("useGuest must be used within a GuestProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function GuestProvider({ children }: { children: ReactNode }) {
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_GUEST) === "true";
  });

  const [transcript, setTranscript] = useState<GuestTranscript | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSCRIPT);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as GuestTranscript;
    } catch {
      return null;
    }
  });

  // Persist transcript to localStorage whenever it changes
  useEffect(() => {
    if (transcript) {
      localStorage.setItem(STORAGE_KEY_TRANSCRIPT, JSON.stringify(transcript));
    } else {
      localStorage.removeItem(STORAGE_KEY_TRANSCRIPT);
    }
  }, [transcript]);

  // ── Mode control ────────────────────────────────────────────────────
  const enterGuestMode = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_GUEST, "true");
    setIsGuest(true);
  }, []);

  const exitGuestMode = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_GUEST);
    setIsGuest(false);
    // Don't clear transcript data — user might want to keep it if they sign in
  }, []);

  // ── Mutations ───────────────────────────────────────────────────────

  const saveTranscript = useCallback((data: TranscriptData) => {
    const actualSemesters = data.semesters.map((s) => ({ ...s, planned: false }));
    const { semesters, cumulativeGPA } = recalculateAllGPAs(actualSemesters);
    setTranscript({
      semesters,
      cumulativeGPA,
      major: data.major,
      updatedAt: Date.now(),
    });
  }, []);

  const addSemester = useCallback((name: string): string => {
    const newSemesterId = generateId();
    const newSemester: Semester = {
      id: newSemesterId,
      name: name || `Semester ${(transcript?.semesters.length ?? 0) + 1}`,
      courses: [],
      semesterGPA: 0,
      cumulativeGPA: 0,
    };

    if (transcript) {
      const updatedSemesters = [...transcript.semesters, newSemester];
      const { semesters, cumulativeGPA } = recalculateAllGPAs(updatedSemesters);
      setTranscript({ ...transcript, semesters, cumulativeGPA, updatedAt: Date.now() });
    } else {
      setTranscript({
        semesters: [newSemester],
        cumulativeGPA: 0,
        updatedAt: Date.now(),
      });
    }

    return newSemesterId;
  }, [transcript]);

  const removeSemester = useCallback((semesterId: string) => {
    if (!transcript) return;
    const updatedSemesters = transcript.semesters.filter((s) => s.id !== semesterId);
    if (updatedSemesters.length === 0) {
      setTranscript(null);
    } else {
      const { semesters, cumulativeGPA } = recalculateAllGPAs(updatedSemesters);
      setTranscript({ ...transcript, semesters, cumulativeGPA, updatedAt: Date.now() });
    }
  }, [transcript]);

  const addCourse = useCallback((
    semesterId: string,
    course: { courseCode: string; courseName: string; credits: number; grade: string },
  ): string => {
    if (!transcript) throw new Error("No transcript");

    const newCourseId = generateId();
    const newCourse: Course = {
      id: newCourseId,
      courseCode: course.courseCode || "XXX 000",
      courseName: course.courseName || "Untitled Course",
      credits: course.credits,
      grade: course.grade,
      gradePoints: calculateCourseGradePoints(course.credits, course.grade),
      includeInGpa: shouldIncludeInGpa(course.grade),
      gradeType: getGradeType(course.grade),
      retaken: false,
    };

    const updatedSemesters = transcript.semesters.map((semester) => {
      if (semester.id !== semesterId) return semester;
      return { ...semester, courses: [...semester.courses, newCourse] };
    });

    const { semesters, cumulativeGPA } = recalculateAllGPAs(updatedSemesters);
    setTranscript({ ...transcript, semesters, cumulativeGPA, updatedAt: Date.now() });
    return newCourseId;
  }, [transcript]);

  const removeCourse = useCallback((semesterId: string, courseId: string) => {
    if (!transcript) return;
    const updatedSemesters = transcript.semesters.map((semester) => {
      if (semester.id !== semesterId) return semester;
      return { ...semester, courses: semester.courses.filter((c) => c.id !== courseId) };
    });
    const { semesters, cumulativeGPA } = recalculateAllGPAs(updatedSemesters);
    setTranscript({ ...transcript, semesters, cumulativeGPA, updatedAt: Date.now() });
  }, [transcript]);

  const updateCourse = useCallback((
    semesterId: string,
    courseId: string,
    updates: { courseCode?: string; courseName?: string; credits?: number; grade?: string },
  ) => {
    if (!transcript) return;

    const updatedSemesters = transcript.semesters.map((semester) => {
      if (semester.id !== semesterId) return semester;
      return {
        ...semester,
        courses: semester.courses.map((course) => {
          if (course.id !== courseId) return course;
          const newGrade = updates.grade ?? course.grade;
          const newCredits = updates.credits ?? course.credits;
          return {
            ...course,
            courseCode: updates.courseCode ?? course.courseCode,
            courseName: updates.courseName ?? course.courseName,
            credits: newCredits,
            grade: newGrade,
            gradePoints: calculateCourseGradePoints(newCredits, newGrade),
            includeInGpa: shouldIncludeInGpa(newGrade),
            gradeType: getGradeType(newGrade),
          };
        }),
      };
    });

    const { semesters, cumulativeGPA } = recalculateAllGPAs(updatedSemesters);
    setTranscript({ ...transcript, semesters, cumulativeGPA, updatedAt: Date.now() });
  }, [transcript]);

  const deleteTranscript = useCallback(() => {
    setTranscript(null);
  }, []);

  const updateMajor = useCallback((major: string) => {
    if (!transcript) return;
    setTranscript({ ...transcript, major: major.trim() || undefined, updatedAt: Date.now() });
  }, [transcript]);

  // ── Context value ───────────────────────────────────────────────────

  return (
    <GuestContext.Provider
      value={{
        isGuest,
        enterGuestMode,
        exitGuestMode,
        transcript,
        saveTranscript,
        addSemester,
        removeSemester,
        addCourse,
        removeCourse,
        updateCourse,
        deleteTranscript,
        updateMajor,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
}

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useGuest } from "@/context/GuestContext";
import type { TranscriptData } from "@/lib/gpaCalculator";

/**
 * Hook that abstracts data access for the Dashboard.
 * In authenticated mode it uses Convex queries/mutations.
 * In guest mode it uses localStorage via GuestContext.
 *
 * Returns a unified interface so the Dashboard doesn't care
 * which mode it's in.
 */
export function useTranscriptData() {
  const guest = useGuest();

  // ── Convex (only called when NOT guest) ─────────────────────────────
  // Convex hooks must always be called (React rules), but we skip
  // the Convex provider in guest mode by passing "skip" to useQuery.
  const convexTranscript = useQuery(
    api.transcripts.getMyTranscript,
    guest.isGuest ? "skip" : undefined,
  );
  const convexSaveTranscript = useMutation(api.transcripts.saveTranscript);
  const convexUpdateCourse = useMutation(api.transcripts.updateCourse);
  const convexAddSemester = useMutation(api.transcripts.addSemester);
  const convexRemoveSemester = useMutation(api.transcripts.removeSemester);
  const convexAddCourse = useMutation(api.transcripts.addCourse);
  const convexRemoveCourse = useMutation(api.transcripts.removeCourse);
  const convexDeleteTranscript = useMutation(api.transcripts.deleteTranscript);

  if (guest.isGuest) {
    return {
      isGuest: true as const,
      transcript: guest.transcript,
      saveTranscript: (data: { semesters: TranscriptData["semesters"]; cumulativeGPA: number; major?: string }) => {
        guest.saveTranscript(data);
      },
      updateCourse: (semesterId: string, courseId: string, updates: { courseCode?: string; courseName?: string; credits?: number; grade?: string }) => {
        guest.updateCourse(semesterId, courseId, updates);
      },
      addSemester: (name: string) => {
        return guest.addSemester(name);
      },
      removeSemester: (semesterId: string) => {
        guest.removeSemester(semesterId);
      },
      addCourse: (semesterId: string, course: { courseCode: string; courseName: string; credits: number; grade: string }) => {
        return guest.addCourse(semesterId, course);
      },
      removeCourse: (semesterId: string, courseId: string) => {
        guest.removeCourse(semesterId, courseId);
      },
      deleteTranscript: () => {
        guest.deleteTranscript();
      },
    };
  }

  // ── Authenticated mode ──────────────────────────────────────────────
  return {
    isGuest: false as const,
    transcript: convexTranscript,
    saveTranscript: async (data: { semesters: TranscriptData["semesters"]; cumulativeGPA: number; major?: string }) => {
      await convexSaveTranscript(data);
    },
    updateCourse: async (semesterId: string, courseId: string, updates: { courseCode?: string; courseName?: string; credits?: number; grade?: string }) => {
      await convexUpdateCourse({ semesterId, courseId, updates });
    },
    addSemester: async (name: string) => {
      return await convexAddSemester({ name });
    },
    removeSemester: async (semesterId: string) => {
      await convexRemoveSemester({ semesterId });
    },
    addCourse: async (semesterId: string, course: { courseCode: string; courseName: string; credits: number; grade: string }) => {
      return await convexAddCourse({ semesterId, ...course });
    },
    removeCourse: async (semesterId: string, courseId: string) => {
      await convexRemoveCourse({ semesterId, courseId });
    },
    deleteTranscript: async () => {
      await convexDeleteTranscript();
    },
  };
}

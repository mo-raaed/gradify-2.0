import { useEffect, useMemo, useRef } from "react";
import { useLayout, type SearchResult } from "@/context/LayoutContext";
import type { Semester } from "@/lib/gpaCalculator";
import { GRADE_POINTS } from "@/lib/gpaCalculator";

type SearchState = {
  results: SearchResult[];
  highlightedCourses: Set<string>;
  highlightedSemesters: Set<string>;
};

// Build a set of valid grades for quick lookup (case-insensitive)
const VALID_GRADES = new Set(
  Object.keys(GRADE_POINTS).map((g) => g.toUpperCase())
);

// Stable empty array to avoid new reference on every render
const EMPTY_SEMESTERS: Semester[] = [];

/**
 * Custom hook for searching and filtering transcript data
 * Searches courses by code/name, semesters by name, and filters by grade.
 * When the query exactly matches a known grade, shows one "Grade: X" summary
 * plus individual course matches with their names.
 */
export function useSearch(semesters: Semester[]) {
  const {
    searchQuery,
    setSearchResults,
    setHighlightedCourses,
    setHighlightedSemesters,
  } = useLayout();

  // Stabilize the semesters identity for useMemo
  const stableSemesters = semesters.length === 0 ? EMPTY_SEMESTERS : semesters;

  // Perform search
  const results = useMemo<SearchState>(() => {
    if (!searchQuery.trim()) {
      return {
        results: [],
        highlightedCourses: new Set<string>(),
        highlightedSemesters: new Set<string>(),
      };
    }

    const query = searchQuery.trim();
    const queryUpper = query.toUpperCase();
    const queryLower = query.toLowerCase();
    const isGradeQuery = VALID_GRADES.has(queryUpper);

    const searchResults: SearchResult[] = [];
    const highlightedCourseIds = new Set<string>();
    const highlightedSemesterIds = new Set<string>();

    stableSemesters.forEach((semester) => {
      // Check if semester name matches (only for non-grade queries)
      if (!isGradeQuery && semester.name.toLowerCase().includes(queryLower)) {
        searchResults.push({
          type: "semester",
          semesterId: semester.id,
          match: semester.name,
        });
        highlightedSemesterIds.add(semester.id);
      }

      // Check courses in this semester
      semester.courses.forEach((course) => {
        if (isGradeQuery) {
          // Grade matching: show course name + code for each match (not just "Grade: A" repeatedly)
          if (course.grade.toUpperCase() === queryUpper) {
            searchResults.push({
              type: "course",
              semesterId: semester.id,
              courseId: course.id,
              match: `${course.courseCode} — ${course.courseName} (${course.grade})`,
            });
            highlightedCourseIds.add(course.id);
            highlightedSemesterIds.add(semester.id);
          }
        } else {
          // General matching: code, name, or exact grade
          const codeMatch = course.courseCode.toLowerCase().includes(queryLower);
          const nameMatch = course.courseName.toLowerCase().includes(queryLower);
          const gradeMatch = course.grade.toUpperCase() === queryUpper;

          if (codeMatch || nameMatch || gradeMatch) {
            searchResults.push({
              type: "course",
              semesterId: semester.id,
              courseId: course.id,
              match: codeMatch
                ? course.courseCode
                : nameMatch
                ? course.courseName
                : `Grade: ${course.grade}`,
            });
            highlightedCourseIds.add(course.id);
            highlightedSemesterIds.add(semester.id);
          }
        }
      });
    });

    return {
      results: searchResults,
      highlightedCourses: highlightedCourseIds,
      highlightedSemesters: highlightedSemesterIds,
    };
  }, [searchQuery, stableSemesters]);

  // Update context with results - use refs for setters to avoid dependency cycles
  const setSearchResultsRef = useRef(setSearchResults);
  const setHighlightedCoursesRef = useRef(setHighlightedCourses);
  const setHighlightedSemestersRef = useRef(setHighlightedSemesters);
  setSearchResultsRef.current = setSearchResults;
  setHighlightedCoursesRef.current = setHighlightedCourses;
  setHighlightedSemestersRef.current = setHighlightedSemesters;

  useEffect(() => {
    setSearchResultsRef.current(results.results);
    setHighlightedCoursesRef.current(results.highlightedCourses);
    setHighlightedSemestersRef.current(results.highlightedSemesters);
  }, [results]);

  return {
    results: results.results,
    hasResults: results.results.length > 0,
  };
}

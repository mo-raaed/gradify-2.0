import { useEffect, useMemo } from "react";
import { useLayout, type SearchResult } from "@/context/LayoutContext";
import type { Semester } from "@/lib/gpaCalculator";

type SearchState = {
  results: SearchResult[];
  highlightedCourses: Set<string>;
  highlightedSemesters: Set<string>;
};

/**
 * Custom hook for searching and filtering transcript data
 * Searches courses by code/name, semesters by name, and filters by grade
 */
export function useSearch(semesters: Semester[]) {
  const {
    searchQuery,
    setSearchResults,
    setHighlightedCourses,
    setHighlightedSemesters,
  } = useLayout();

  // Perform search
  const results = useMemo<SearchState>(() => {
    if (!searchQuery.trim()) {
      return {
        results: [],
        highlightedCourses: new Set<string>(),
        highlightedSemesters: new Set<string>(),
      };
    }

    const query = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];
    const highlightedCourseIds = new Set<string>();
    const highlightedSemesterIds = new Set<string>();

    semesters.forEach((semester) => {
      // Check if semester name matches
      if (semester.name.toLowerCase().includes(query)) {
        searchResults.push({
          type: "semester",
          semesterId: semester.id,
          match: semester.name,
        });
        highlightedSemesterIds.add(semester.id);
      }

      // Check courses in this semester
      semester.courses.forEach((course) => {
        const codeMatch = course.courseCode.toLowerCase().includes(query);
        const nameMatch = course.courseName.toLowerCase().includes(query);
        const gradeMatch = course.grade.toLowerCase() === query.toLowerCase();

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
      });
    });

    return {
      results: searchResults,
      highlightedCourses: highlightedCourseIds,
      highlightedSemesters: highlightedSemesterIds,
    };
  }, [searchQuery, semesters]);

  // Update context with results
  useEffect(() => {
    setSearchResults(results.results);
    setHighlightedCourses(results.highlightedCourses);
    setHighlightedSemesters(results.highlightedSemesters);
  }, [results, setSearchResults, setHighlightedCourses, setHighlightedSemesters]);

  return {
    results: results.results,
    hasResults: results.results.length > 0,
  };
}

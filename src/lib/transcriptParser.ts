/**
 * Transcript Parser (Client-side)
 * Parses AUIS unofficial transcript PDF text into structured data
 */

import {
  GRADE_POINTS,
  EXCLUDE_GRADES,
  SEMESTER_REGEX,
  semesterSortKey,
  getGradeType,
  generateId,
  recalculateAllGPAs,
  type Course,
  type Semester,
  type TranscriptData,
} from "./gpaCalculator";

/**
 * Check if a line is a valid semester header
 */
function isValidSemester(line: string): boolean {
  return SEMESTER_REGEX.test(line);
}

/**
 * Extract major from transcript text
 * Looks for common patterns in AUIS transcripts
 */
function extractMajor(textLines: string[]): string | undefined {
  for (const line of textLines) {
    const lowerLine = line.toLowerCase();

    // Common patterns for major/program information
    if (lowerLine.includes("major:") || lowerLine.includes("program:")) {
      // Extract text after "major:" or "program:"
      const match = line.match(/(?:major|program):\s*(.+?)(?:\s|$)/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Look for "Bachelor of" or "Master of" patterns
    const degreeMatch = line.match(/(?:Bachelor|Master|B\.?[AS]\.?|M\.?[AS]\.?)\s+(?:of|in|Of|In)\s+(.+?)(?:\s{2,}|\n|$)/i);
    if (degreeMatch && degreeMatch[1]) {
      return degreeMatch[1].trim();
    }

    // Look for common CS/Engineering program names directly
    if (lowerLine.includes("computer science") && !lowerLine.includes("course")) {
      return "Computer Science";
    }
    if (lowerLine.includes("software engineering") && !lowerLine.includes("course")) {
      return "Software Engineering";
    }
    if (lowerLine.includes("electrical engineering") && !lowerLine.includes("course")) {
      return "Electrical Engineering";
    }
    if (lowerLine.includes("business administration") && !lowerLine.includes("course")) {
      return "Business Administration";
    }
  }

  return undefined;
}

/**
 * Parse raw transcript text into structured data
 * This implements the same logic as the original Python parse_transcript function
 */
export function parseTranscriptText(rawText: string): TranscriptData {
  // 1) Split into lines and drop APP terms (application/pending terms)
  const lines = rawText
    .split("\n")
    .map((ln) => ln.trim())
    .filter((ln) => ln.length > 0 && !ln.includes("APP"));

  // 2) Extract major from early lines in the transcript
  const major = extractMajor(lines.slice(0, 50)); // Check first 50 lines for major info

  // 3) Find all semester headers and their indices
  const semesterIndices: Array<[number, string]> = [];
  lines.forEach((line, index) => {
    if (isValidSemester(line)) {
      semesterIndices.push([index, line]);
    }
  });

  const semesters: Semester[] = [];

  // 4) Process each semester block
  for (let idx = 0; idx < semesterIndices.length; idx++) {
    const [start, semesterName] = semesterIndices[idx];
    const end = idx + 1 < semesterIndices.length 
      ? semesterIndices[idx + 1][0] 
      : lines.length;

    const block = lines.slice(start + 1, end);
    const courses: Course[] = [];

    for (const line of block) {
      const tokens = line.split(/\s+/);

      // Robust parsing: need at least 6 tokens for a valid course line
      if (tokens.length < 6) continue;

      // Find the rightmost numeric token (PNTS - Points)
      let pntsIdx: number | null = null;
      for (let i = tokens.length - 1; i >= 0; i--) {
        const num = parseFloat(tokens[i]);
        if (!isNaN(num)) {
          pntsIdx = i;
          break;
        }
      }

      if (pntsIdx === null || pntsIdx < 3) continue;

      // CE and CA are the two tokens before PNTS
      const ce = parseFloat(tokens[pntsIdx - 1]);
      const ca = parseFloat(tokens[pntsIdx - 2]); // Credits Attempted

      if (isNaN(ce) || isNaN(ca)) continue;

      // Grade is the token before CA
      const gradeIdx = pntsIdx - 3;
      const grade = tokens[gradeIdx];

      // Validate grade
      if (
        !(grade in GRADE_POINTS) &&
        !EXCLUDE_GRADES.has(grade) &&
        grade !== "P"
      ) {
        continue;
      }

      // Course code is always the first two tokens
      const courseCode = `${tokens[0]} ${tokens[1]}`;

      // Course name is everything between code and grade
      const courseName = tokens.slice(2, gradeIdx).join(" ");

      // Skip zero-credit or pass courses
      if (ca === 0 || grade === "P") continue;

      const includeInGpa = !EXCLUDE_GRADES.has(grade);
      const gradeType = getGradeType(grade);

      const course: Course = {
        id: generateId(),
        courseCode,
        courseName,
        credits: ca,
        grade,
        gradePoints: parseFloat(tokens[pntsIdx]),
        gradeType,
        includeInGpa,
        retaken: false, // Will be determined later
      };

      courses.push(course);
    }

    semesters.push({
      id: generateId(),
      name: semesterName,
      courses,
      semesterGPA: 0, // Will be calculated later
      cumulativeGPA: 0, // Will be calculated later
    });
  }

  // 5) Sort semesters chronologically
  semesters.sort((a, b) => {
    const [yearA, termA] = semesterSortKey(a.name);
    const [yearB, termB] = semesterSortKey(b.name);
    if (yearA !== yearB) return yearA - yearB;
    return termA - termB;
  });

  // 6) Recalculate all GPAs (includes retake detection)
  const result = recalculateAllGPAs(semesters);

  // 7) Add major field to result
  return {
    ...result,
    major,
  };
}


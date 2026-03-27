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
 * Known AUIS major/program names for direct matching
 * Only multi-word names to avoid false positives from course names
 */
const KNOWN_MAJORS = [
  "Computer Science",
  "Software Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
  "Business Administration",
  "Information Technology",
  "International Studies",
  "Artificial Intelligence",
  "Political Science",
  "Computer Engineering",
  "Data Science",
];

/**
 * Extract major from transcript text
 * Looks for common patterns in AUIS transcripts
 * Uses a two-pass approach: first looks for explicit "Major" labels,
 * then falls back to known major name matching.
 */
function extractMajor(textLines: string[]): string | undefined {
  // Log first 30 lines for debugging major extraction issues
  console.log("[Gradify] Searching for major in", textLines.length, "transcript lines");
  console.log("[Gradify] First 20 lines:", textLines.slice(0, 20));

  // === PASS 1: Look for explicit "Major" or "Program" labels (highest confidence) ===
  for (let i = 0; i < textLines.length; i++) {
    const line = textLines[i];
    const lowerLine = line.toLowerCase().trim();

    // Skip very short lines
    if (lowerLine.length < 3) continue;

    // Pattern 1a: "Major: Computer Science" or "Program: ..."
    if (lowerLine.includes("major:") || lowerLine.includes("program:")) {
      const match = line.match(/(?:major|program)\s*:\s*(.+)$/i);
      if (match && match[1]) {
        const value = match[1].trim();
        if (value.length > 0) {
          console.log(`[Gradify] Found major via label:colon on line ${i}: "${value}"`);
          return value;
        }
      }
    }

    // Pattern 1b: "Major Artificial Intelligence..." (label + 1+ spaces + value)
    // OR "MajorArtificial Intelligence..." (pdfjs sometimes strips spaces)
    if (/^major/i.test(lowerLine) && !lowerLine.includes("course") && lowerLine.length > 8) {
      // Try to extract everything after "Major" (with or without space)
      const match = line.match(/^major\s*(.{3,})$/i);
      if (match && match[1]) {
        const value = match[1].trim();
        if (value.length > 2) {
          console.log(`[Gradify] Found major via Major label on line ${i}: "${value}"`);
          return value;
        }
      }
    }

    // Pattern 1c: "Major" alone on a line — the next line is the actual major value
    if (/^major$/i.test(lowerLine) && i + 1 < textLines.length) {
      const nextLine = textLines[i + 1].trim();
      // Next line should be a major name, not a course code or other metadata
      if (nextLine.length > 2 && !/^[A-Z]{2,5}\s*\d/.test(nextLine) && !/^(course|credits|semester|gpa)/i.test(nextLine)) {
        console.log(`[Gradify] Found major via next-line pattern on lines ${i}/${i + 1}: "${nextLine}"`);
        return nextLine;
      }
    }

    // Pattern 1d: "Degree: Bachelor of Science in X"
    if (lowerLine.includes("degree")) {
      const match = line.match(/degree\s*:\s*.*?(?:in|of)\s+(.+)$/i);
      if (match && match[1]) {
        const value = match[1].trim();
        if (value.length > 0) {
          console.log(`[Gradify] Found major via degree pattern on line ${i}: "${value}"`);
          return value;
        }
      }
    }

    // Pattern 1e: "Bachelor of Science in X" or "B.S. in X"
    const degreeMatch = line.match(/(?:Bachelor|Master|B\.?\s?[AS]\.?|M\.?\s?[AS]\.?)\s+(?:of\s+\w+\s+)?(?:in|of)\s+(.+?)(?:\s{2,}|\n|$)/i);
    if (degreeMatch && degreeMatch[1]) {
      const value = degreeMatch[1].trim();
      if (value.length > 2) {
        console.log(`[Gradify] Found major via degree name on line ${i}: "${value}"`);
        return value;
      }
    }
  }

  // === PASS 2: Look for known multi-word major names in non-course lines ===
  for (let i = 0; i < Math.min(textLines.length, 30); i++) {
    const line = textLines[i];
    const lowerLine = line.toLowerCase().trim();

    // Skip course-like lines (start with course codes like "CHEM 232")
    if (/^[A-Z]{2,5}\s*\d/.test(line.trim())) continue;
    if (lowerLine.includes("course") || lowerLine.includes("credits")) continue;

    for (const majorName of KNOWN_MAJORS) {
      if (lowerLine.includes(majorName.toLowerCase())) {
        console.log(`[Gradify] Found major via known name on line ${i}: "${majorName}"`);
        return majorName;
      }
    }
  }

  console.log("[Gradify] No major found in transcript");
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

  // 2) Extract major from ALL lines in the transcript (not just first 50)
  const major = extractMajor(lines);
  console.log("[Gradify] Extracted major:", major);


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


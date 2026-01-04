import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Course validator - reusable for nested objects
const courseValidator = v.object({
  id: v.string(),
  courseCode: v.string(),
  courseName: v.string(),
  credits: v.number(),
  grade: v.string(),
  gradePoints: v.number(),
  includeInGpa: v.boolean(),
  gradeType: v.union(
    v.literal("normal"),
    v.literal("in_progress"),
    v.literal("withdrawn"),
    v.literal("withdraw_fail")
  ),
  retaken: v.boolean(),
});

// Semester validator - contains array of courses
const semesterValidator = v.object({
  id: v.string(),
  name: v.string(),
  semesterGPA: v.number(),
  cumulativeGPA: v.number(),
  courses: v.array(courseValidator),
  planned: v.optional(v.boolean()), // True for planned/future semesters
});

// Graduation settings validator - user preferences for goal planning
const graduationSettingsValidator = v.object({
  graduationCredits: v.optional(v.number()), // Total credits needed to graduate
  maxSemesters: v.optional(v.number()), // Maximum semesters remaining (optional)
  coursesPerSemester: v.optional(v.number()), // Default courses per semester (default: 5)
  creditsPerCourse: v.optional(v.number()), // Default credits per course (default: 3)
  includeWinterSummer: v.optional(v.boolean()), // Whether to suggest winter/summer terms
});

export default defineSchema({
  // Users table - synced with Clerk
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    // Graduation settings for GPA goal planning
    graduationSettings: v.optional(graduationSettingsValidator),
  }).index("by_clerkId", ["clerkId"]),

  // Transcripts table - stores all user grade data
  transcripts: defineTable({
    userId: v.id("users"),
    semesters: v.array(semesterValidator),
    cumulativeGPA: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});

// Export validators for reuse in functions
export { courseValidator, semesterValidator, graduationSettingsValidator };

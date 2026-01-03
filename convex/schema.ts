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
});

export default defineSchema({
  // Users table - synced with Clerk
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
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
export { courseValidator, semesterValidator };

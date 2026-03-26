import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { semesterValidator, courseValidator } from "./schema";
import {
  generateId,
  recalculateAllGPAs,
  calculateCourseGradePoints,
  shouldIncludeInGpa,
  getGradeType,
  type Course,
  type Semester,
} from "./lib/gpaCalculator";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get the authenticated user's transcript
 */
export const getMyTranscript = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("transcripts"),
      _creationTime: v.number(),
      userId: v.id("users"),
      semesters: v.array(semesterValidator),
      cumulativeGPA: v.number(),
      major: v.optional(v.string()),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    // Get transcript for this user
    const transcript = await ctx.db
      .query("transcripts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    return transcript;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Save or update the user's transcript
 * Clears any existing planned semesters when a new transcript is uploaded
 */
export const saveTranscript = mutation({
  args: {
    semesters: v.array(semesterValidator),
    cumulativeGPA: v.number(),
    major: v.optional(v.string()),
  },
  returns: v.id("transcripts"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found. Please refresh the page.");
    }

    // Check for existing transcript
    const existingTranscript = await ctx.db
      .query("transcripts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    // Filter out any planned semesters from the incoming data
    // and ensure the new semesters don't have the planned flag
    const actualSemesters = args.semesters.map((s) => ({
      ...s,
      planned: false,
    }));

    if (existingTranscript) {
      // Update existing transcript, removing any previously planned semesters
      await ctx.db.patch(existingTranscript._id, {
        semesters: actualSemesters,
        cumulativeGPA: args.cumulativeGPA,
        major: args.major || existingTranscript.major, // Preserve existing major if not provided
        updatedAt: Date.now(),
      });
      return existingTranscript._id;
    }

    // Create new transcript
    return await ctx.db.insert("transcripts", {
      userId: user._id,
      semesters: actualSemesters,
      cumulativeGPA: args.cumulativeGPA,
      major: args.major,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update a specific course in the transcript
 */
export const updateCourse = mutation({
  args: {
    semesterId: v.string(),
    courseId: v.string(),
    updates: v.object({
      courseCode: v.optional(v.string()),
      courseName: v.optional(v.string()),
      credits: v.optional(v.number()),
      grade: v.optional(v.string()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const transcript = await ctx.db
      .query("transcripts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!transcript) {
      throw new Error("Transcript not found");
    }

    // Update the course in the semesters array
    const updatedSemesters = transcript.semesters.map((semester) => {
      if (semester.id !== args.semesterId) return semester;

      return {
        ...semester,
        courses: semester.courses.map((course) => {
          if (course.id !== args.courseId) return course;

          const newGrade = args.updates.grade ?? course.grade;
          const newCredits = args.updates.credits ?? course.credits;

          return {
            ...course,
            courseCode: args.updates.courseCode ?? course.courseCode,
            courseName: args.updates.courseName ?? course.courseName,
            credits: newCredits,
            grade: newGrade,
            gradePoints: calculateCourseGradePoints(newCredits, newGrade),
            includeInGpa: shouldIncludeInGpa(newGrade),
            gradeType: getGradeType(newGrade),
          };
        }),
      };
    });

    // Recalculate all GPAs
    const { semesters, cumulativeGPA } = recalculateAllGPAs(updatedSemesters);

    await ctx.db.patch(transcript._id, {
      semesters,
      cumulativeGPA,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Add a new semester to the transcript
 */
export const addSemester = mutation({
  args: {
    name: v.string(),
  },
  returns: v.string(), // Returns the new semester ID
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const transcript = await ctx.db
      .query("transcripts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const newSemesterId = generateId();
    const newSemester: Semester = {
      id: newSemesterId,
      name: args.name || `Semester ${(transcript?.semesters.length ?? 0) + 1}`,
      courses: [],
      semesterGPA: 0,
      cumulativeGPA: 0,
    };

    if (transcript) {
      const updatedSemesters = [...transcript.semesters, newSemester];
      const { semesters, cumulativeGPA } = recalculateAllGPAs(updatedSemesters);

      await ctx.db.patch(transcript._id, {
        semesters,
        cumulativeGPA,
        updatedAt: Date.now(),
      });
    } else {
      // Create new transcript with this semester
      await ctx.db.insert("transcripts", {
        userId: user._id,
        semesters: [newSemester],
        cumulativeGPA: 0,
        updatedAt: Date.now(),
      });
    }

    return newSemesterId;
  },
});

/**
 * Remove a semester from the transcript
 */
export const removeSemester = mutation({
  args: {
    semesterId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const transcript = await ctx.db
      .query("transcripts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!transcript) {
      throw new Error("Transcript not found");
    }

    const updatedSemesters = transcript.semesters.filter(
      (s) => s.id !== args.semesterId
    );

    if (updatedSemesters.length === 0) {
      // Delete the transcript if no semesters remain
      await ctx.db.delete(transcript._id);
    } else {
      const { semesters, cumulativeGPA } = recalculateAllGPAs(updatedSemesters);

      await ctx.db.patch(transcript._id, {
        semesters,
        cumulativeGPA,
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});

/**
 * Add a course to a semester
 */
export const addCourse = mutation({
  args: {
    semesterId: v.string(),
            courseCode: v.string(),
            courseName: v.string(),
            credits: v.number(),
            grade: v.string(),
  },
  returns: v.string(), // Returns the new course ID
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const transcript = await ctx.db
      .query("transcripts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!transcript) {
      throw new Error("Transcript not found");
    }

    const newCourseId = generateId();
    const newCourse: Course = {
      id: newCourseId,
      courseCode: args.courseCode || "XXX 000",
      courseName: args.courseName || "Untitled Course",
      credits: args.credits,
      grade: args.grade,
      gradePoints: calculateCourseGradePoints(args.credits, args.grade),
      includeInGpa: shouldIncludeInGpa(args.grade),
      gradeType: getGradeType(args.grade),
      retaken: false,
    };

    const updatedSemesters = transcript.semesters.map((semester) => {
      if (semester.id !== args.semesterId) return semester;
      return {
        ...semester,
        courses: [...semester.courses, newCourse],
      };
    });

    const { semesters, cumulativeGPA } = recalculateAllGPAs(updatedSemesters);

    await ctx.db.patch(transcript._id, {
      semesters,
      cumulativeGPA,
        updatedAt: Date.now(),
      });

    return newCourseId;
  },
});

/**
 * Remove a course from a semester
 */
export const removeCourse = mutation({
  args: {
    semesterId: v.string(),
    courseId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const transcript = await ctx.db
      .query("transcripts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!transcript) {
      throw new Error("Transcript not found");
    }

    const updatedSemesters = transcript.semesters.map((semester) => {
      if (semester.id !== args.semesterId) return semester;
      return {
        ...semester,
        courses: semester.courses.filter((c) => c.id !== args.courseId),
      };
    });

    const { semesters, cumulativeGPA } = recalculateAllGPAs(updatedSemesters);

    await ctx.db.patch(transcript._id, {
      semesters,
      cumulativeGPA,
        updatedAt: Date.now(),
      });

    return null;
  },
});

/**
 * Reset all simulated grades back to IP
 */
export const resetSimulatedGrades = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const transcript = await ctx.db
      .query("transcripts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!transcript) {
      throw new Error("Transcript not found");
    }

    // Reset all in_progress courses back to IP
    const resetSemesters = transcript.semesters.map((semester) => ({
      ...semester,
      courses: semester.courses.map((course) => {
        if (course.gradeType === "in_progress" && course.grade !== "IP") {
          return {
            ...course,
            grade: "IP",
            gradePoints: 0,
            includeInGpa: false,
          };
        }
        return course;
      }),
    }));

    const { semesters, cumulativeGPA } = recalculateAllGPAs(resetSemesters);

    await ctx.db.patch(transcript._id, {
      semesters,
      cumulativeGPA,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Save planned semesters to the transcript
 * These are future semesters generated by the GPA goal planner
 * Also handles updating existing IP semesters with suggested grades
 */
export const savePlannedSemesters = mutation({
  args: {
    plannedSemesters: v.array(semesterValidator),
    existingUpdates: v.optional(v.array(v.object({
      semesterName: v.string(),
      courses: v.array(courseValidator),
    }))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const transcript = await ctx.db
      .query("transcripts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!transcript) {
      throw new Error("Transcript not found. Please add some semesters first.");
    }

    // Remove any existing planned semesters first
    let actualSemesters = transcript.semesters.filter(
      (s) => !s.planned
    );

    // Update existing IP semesters with suggested grades
    if (args.existingUpdates && args.existingUpdates.length > 0) {
      actualSemesters = actualSemesters.map((semester) => {
        const update = args.existingUpdates?.find(
          (u) => u.semesterName === semester.name
        );
        if (update) {
          // Replace the courses with the planned ones and mark as planned
          return {
            ...semester,
            courses: update.courses,
            planned: true,
          };
        }
        return semester;
      });
    }

    // Mark new semesters as planned and add them
    const newPlannedSemesters = args.plannedSemesters.map((s) => ({
      ...s,
      planned: true,
    }));

    const updatedSemesters = [...actualSemesters, ...newPlannedSemesters];

    // Recalculate GPAs with the new semesters
    const { semesters, cumulativeGPA } = recalculateAllGPAs(updatedSemesters);

    await ctx.db.patch(transcript._id, {
      semesters,
      cumulativeGPA,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Remove all planned semesters from the transcript
 */
export const clearPlannedSemesters = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const transcript = await ctx.db
      .query("transcripts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!transcript) {
      return null;
    }

    // Remove planned semesters
    const actualSemesters = transcript.semesters.filter(
      (s) => !s.planned
    );

    const { semesters, cumulativeGPA } = recalculateAllGPAs(actualSemesters);

    await ctx.db.patch(transcript._id, {
      semesters,
      cumulativeGPA,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Update the student's major
 */
export const updateMajor = mutation({
  args: {
    major: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const transcript = await ctx.db
      .query("transcripts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!transcript) {
      throw new Error("Transcript not found");
    }

    await ctx.db.patch(transcript._id, {
      major: args.major.trim() || undefined,
      updatedAt: Date.now(),
    });

    return null;
  },
});

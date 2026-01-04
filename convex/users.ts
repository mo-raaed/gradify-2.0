import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { graduationSettingsValidator } from "./schema";

/**
 * Get the current authenticated user
 * Returns null if not found
 */
export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      clerkId: v.string(),
      email: v.string(),
      name: v.optional(v.string()),
      graduationSettings: v.optional(graduationSettingsValidator),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

/**
 * Create or update user from Clerk identity
 * Called on first login or when user info changes
 */
export const upsertUser = mutation({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existingUser) {
      // Update existing user if email or name changed
      const updates: { email?: string; name?: string } = {};
      
      if (identity.email && identity.email !== existingUser.email) {
        updates.email = identity.email;
      }
      if (identity.name !== existingUser.name) {
        updates.name = identity.name ?? undefined;
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existingUser._id, updates);
      }

      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email ?? "",
      name: identity.name ?? undefined,
    });

    return userId;
  },
});

/**
 * Internal mutation to create user (for webhooks)
 */
export const createUserInternal = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
    });
  },
});

/**
 * Update graduation settings for the authenticated user
 */
export const updateGraduationSettings = mutation({
  args: {
    graduationCredits: v.optional(v.number()),
    maxSemesters: v.optional(v.number()),
    coursesPerSemester: v.optional(v.number()),
    creditsPerCourse: v.optional(v.number()),
    includeWinterSummer: v.optional(v.boolean()),
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

    // Merge with existing settings
    const existingSettings = user.graduationSettings ?? {};
    const newSettings = {
      ...existingSettings,
      ...(args.graduationCredits !== undefined && { graduationCredits: args.graduationCredits }),
      ...(args.maxSemesters !== undefined && { maxSemesters: args.maxSemesters }),
      ...(args.coursesPerSemester !== undefined && { coursesPerSemester: args.coursesPerSemester }),
      ...(args.creditsPerCourse !== undefined && { creditsPerCourse: args.creditsPerCourse }),
      ...(args.includeWinterSummer !== undefined && { includeWinterSummer: args.includeWinterSummer }),
    };

    await ctx.db.patch(user._id, {
      graduationSettings: newSettings,
    });

    return null;
  },
});

/**
 * Get graduation settings for the authenticated user
 */
export const getGraduationSettings = query({
  args: {},
  returns: v.union(
    v.object({
      graduationCredits: v.optional(v.number()),
      maxSemesters: v.optional(v.number()),
      coursesPerSemester: v.optional(v.number()),
      creditsPerCourse: v.optional(v.number()),
      includeWinterSummer: v.optional(v.boolean()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    return user.graduationSettings ?? null;
  },
});


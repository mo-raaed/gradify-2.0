# Clerk + Convex Authentication Setup Guide

## Issue Fixed
The auth provider in `convex/auth.config.ts` was commented out, preventing Convex from recognizing authenticated Clerk users.

## Required Steps to Complete Setup

### Step 1: Create Clerk JWT Template

1. Go to your Clerk Dashboard: https://dashboard.clerk.com
2. Navigate to **"Configure"** → **"JWT Templates"**
3. Click **"New template"**
4. Choose **"Convex"** from the templates (or create a blank one)
5. **IMPORTANT:** Name it exactly `convex` (lowercase)
6. Set the following:
   - **Name:** `convex`
   - **Token lifetime:** 60 seconds (default, you can adjust)
   - Ensure the claims include:
     ```json
     {
       "aud": "convex"
     }
     ```
7. Click **"Save"**
8. **Copy the "Issuer" URL** from the template (it looks like `https://your-app.clerk.accounts.dev` or similar)

### Step 2: Configure Convex Environment Variable

You have two options:

#### Option A: Set in Convex Dashboard (Recommended for Production)
1. Go to your Convex Dashboard: https://dashboard.convex.dev
2. Select your project: `gradify-2-0`
3. Go to **"Settings"** → **"Environment Variables"**
4. Add a new environment variable:
   - **Name:** `CLERK_JWT_ISSUER_DOMAIN`
   - **Value:** The Issuer URL you copied from Clerk (e.g., `https://your-app.clerk.accounts.dev`)
5. Click **"Save"**

#### Option B: Set in .env.local (For Development)
1. Open `.env.local` in your project root
2. Add this line:
   ```
   CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
   ```
   (Replace with your actual Clerk Issuer URL)
3. Save the file

### Step 3: Restart Your Development Server

After setting the environment variable, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Verify Authentication Works

1. Open your app at http://localhost:5173
2. Sign in with Clerk
3. You should now see:
   - ✅ Your profile icon in the header
   - ✅ The authenticated content (Welcome message, numbers, etc.)
   - ❌ No "Log in" or "Sign up" buttons (they should be hidden when authenticated)

## Troubleshooting

### If authentication still doesn't work:

1. **Check Convex Logs:**
   - Open the Convex Dashboard
   - Go to "Logs" tab
   - Look for any authentication errors

2. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Look for any errors related to authentication

3. **Verify JWT Template:**
   - Make sure the JWT template is named exactly `convex`
   - Ensure the `applicationID` in `auth.config.ts` matches (`"convex"`)
   - Verify the Issuer URL is correct

4. **Clear Browser Cache:**
   - Sometimes cached tokens can cause issues
   - Try signing out and signing back in
   - Or open in an incognito window

5. **Check Environment Variable:**
   - If using Convex Dashboard: verify the variable is set correctly
   - If using .env.local: make sure the file isn't in .gitignore and is being loaded

## Additional Resources

- [Convex + Clerk Documentation](https://docs.convex.dev/auth/clerk)
- [Clerk Documentation](https://clerk.com/docs/integrations/databases/convex)
- [Debugging Convex Auth](https://docs.convex.dev/auth/debug)

## What Changed

The file `convex/auth.config.ts` has been updated to enable Clerk authentication:

```typescript
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
```

This configuration tells Convex to trust JWT tokens issued by your Clerk instance.



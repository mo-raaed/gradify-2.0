# Gradify 2.0 - GPA Calculator for AUIS Students

A modern GPA calculator built with React, Convex, and Clerk authentication. Upload your AUIS unofficial transcript to automatically import your courses, or manually enter your grades. Simulate future grades to see how they affect your GPA.

## Features

- **PDF Transcript Import**: Upload your AUIS unofficial transcript and automatically parse all your courses
- **Real-time GPA Calculation**: See your semester and cumulative GPA update instantly
- **Grade Simulation**: Change grades for in-progress courses to predict your future GPA
- **Retake Detection**: Automatically handles retaken courses (only latest attempt counts)
- **Data Persistence**: Your data is saved and synced across devices via Convex
- **Authentication**: Secure login with Clerk
- **GPA Goal**: Under development

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Convex (serverless functions + database)
- **Auth**: Clerk
- **Styling**: Tailwind CSS v4
- **Hosting**: Netlify (frontend) + Convex Cloud (backend)

## Getting Started

### Prerequisites

- Node.js 18+
- A Convex account (free tier available)
- A Clerk account (free tier available)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gradify-2.0.git
   cd gradify-2.0
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Clerk:
   - Create a Clerk application at [clerk.com](https://clerk.com)
   - Follow the setup guide in `CLERK_SETUP_GUIDE.md`
   - Copy your publishable key

4. Set up Convex:
   ```bash
   npx convex dev
   ```
   - This will prompt you to create a new project or link an existing one
   - Set the `CLERK_JWT_ISSUER_DOMAIN` environment variable in your Convex dashboard

5. Create a `.env.local` file:
   ```
   VITE_CONVEX_URL=https://your-deployment.convex.cloud
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-key-here
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment to Netlify

1. Push your code to GitHub

2. Connect your repo to Netlify

3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

4. Add environment variables in Netlify:
   - `VITE_CONVEX_URL` - Your Convex deployment URL
   - `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key

5. Deploy!

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Base UI components (Button, Dialog, etc.)
│   ├── Dashboard.tsx   # Main dashboard view
│   ├── SemesterCard.tsx
│   ├── CourseRow.tsx
│   └── ...
├── lib/                # Utility functions
│   ├── gpaCalculator.ts  # GPA calculation logic
│   ├── transcriptParser.ts  # Transcript text parsing
│   └── pdfParser.ts    # PDF extraction
├── App.tsx
└── main.tsx

convex/
├── schema.ts           # Database schema
├── users.ts            # User management
├── transcripts.ts      # Transcript CRUD operations
└── lib/
    └── gpaCalculator.ts  # Server-side GPA utilities
```

## License

MIT License - see LICENSE.txt

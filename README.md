## LearnSphere Deep Work Dashboard (Frontend)

This is the frontend for a personal deep work and learning dashboard, built with Next.js (App Router). It focuses on helping you plan your day, track focused work, and see progress in a clean, minimal interface.

The frontend talks to a separate Node/Express backend (with JWT auth and MongoDB) for all real data: streaks, tasks, milestones, deep work stats, and AI summaries.

### What the dashboard does

- **Personal header**
  - Shows your name and email (fetched from `/api/auth/me` using the token in `localStorage`).

- **Learning Blueprint**
  - A section called "Learning Blueprint" where you keep high-level focus items (current sprint, primary focus, mentor sync, etc.).
  - You can add new blueprint items; they are stored via `/api/dashboard/overview`.
  - The **Update Blueprint** button at the top scrolls you straight to this editor and focuses the first input.

- **Deep Work Avg + timer**
  - Card shows your **average deep work session length** and your **daily goal**.
  - Clicking the card opens a **Deep Work Session** panel:
    - Custom focus timer (Pomodoro-style) with start / pause / reset.
    - When a session completes, it logs to `/api/dashboard/deepwork/session` and updates:
      - total focus minutes
      - session count
      - average minutes per session
  - You can change your **daily deep work goal in minutes**; the card updates immediately and, if the backend is available, it is synced via `/api/dashboard/deepwork`.

- **Streaks and activity**
  - Focus streak (current + max) is computed server-side and fetched from `/api/dashboard/streak`.
  - Opening or editing in the app calls `/api/dashboard/streak/update` to keep the streak alive.
  - A weekly activity graph uses `/api/dashboard/tasks/week` to show completed vs pending tasks and general activity.

- **Schedules and tasks**
  - "Today’s Flow" lets you add schedule slots (title, time, detail) via `/api/dashboard/schedules`.
  - Creating a schedule also creates a matching task in `/api/dashboard/tasks` so you can see pending work for today.
  - Completing or deleting a slot updates tasks and the weekly graph.
  - A "Pending Reviews" card and modal show tasks that are due today (`/api/dashboard/tasks/pending-today`).

- **Milestones**
  - A milestones section connected to `/api/dashboard/milestones` where you can add key deliverables (prototype demo, research draft, reviews, etc.).

- **AI summary for notes**
  - Notes area where you can paste raw thoughts or bullets.
  - "Summarize" calls a backend AI endpoint (`/api/ai/summarize`).
  - If the AI route is unavailable, the frontend falls back to a simple rule-based summarizer.

- **Export progress**
  - "Share Progress" generates a PDF summary of your blueprint, schedules, and milestones using `jspdf` (must be installed in the frontend project).

### Tech overview

- **Framework**: Next.js (App Router), React, Framer Motion.
- **Styling**: Tailwind-style utility classes and custom gradients.
- **Icons**: `lucide-react`.
- **Auth**: JWT token read from `localStorage`, sent as `Authorization: Bearer <token>`.
- **API base**: `https://capstone-backend-3-jthr.onrender.com/api` (configured in `app/Dashboard/page.js`).

### Running the frontend

From `capstone_sem_3/capstone_sem_3`:

```bash
npm install
npm run dev
```

Then open:

- `http://localhost:3000` – app entry
- `http://localhost:3000/Dashboard` – main deep work dashboard (requires a valid JWT token in `localStorage`).

For the full experience (streaks, deep work stats, tasks, AI summaries), make sure the backend server is running and the API base URL in the dashboard file matches your backend deployment.

# Productivity Monitor — Project Context

## Goal
A mobile-first web app to help my friend set goals, build Atomic Habits-style
daily habits, check them off, and see streaks + charts + weekly reports.
Turn her from underachiever → consistent high-output via habit science.

## Constraints
- Mobile web first (phone browser, "Add to Home Screen")
- Local-only data for v1 (IndexedDB via Dexie) — NO backend, NO auth
- Deployed as static site on Vercel (free), one user per device
- User (me) has ZERO coding knowledge — give exact copy-paste steps
- I have: Windows, VS Code, Node.js, GitHub account

## Deferred to v1.5
- Email reminders (needs Resend + Vercel cron)
- Multi-device sync (needs backend)

## Stack
React + Vite + TypeScript, Tailwind CSS v4, Recharts, Dexie (IndexedDB),
date-fns. Deploy: Vercel.

## Build order
1. Scaffold + Tailwind + deploy ✅
2. Dexie data layer (goals, habits, checkins)
3. Core UI: goal list → goal detail → daily checklist
4. Streaks & stats
5. Dashboard (charts)
6. Weekly report
7. Reminders (in-app + PWA push best-effort)
8. Polish + PWA install
9. v1.5: email reminders

## Conventions
- TypeScript strict, functional components, no classes
- Tailwind for all styling, mobile-first
- date-fns for dates; store dates as ISO strings 'YYYY-MM-DD'

## Current status
Steps 1–5 done. App usable: Today (checklist + progress + celebration),
Goals (list/detail/add), Stats (cards + 7-day bar chart + per-habit streak/
rate/best). Streak logic in src/utils/stats.ts (grace day for today).
Report tab is still a placeholder.
Next: Step 6 — Weekly Report tab (weekly summary text + per-habit week view).
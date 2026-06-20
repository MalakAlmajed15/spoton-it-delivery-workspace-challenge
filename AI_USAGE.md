# AI Usage

## Tools Used

| Tool | Used? | Notes |
| --- | --- | --- |
| ChatGPT | Yes | Used to understand specific TypeScript/Prisma error messages (e.g. Prisma client constructor errors, type mismatches on optional fields) |
| Claude | Yes | Used as a guided assistant for environment setup and debugging |
| Codex | No | |
| Cursor | No | |
| Other | No | |

## Summary
I used AI tools as a guide rather than letting them drive. Claude walked me through setting up an unfamiliar stack (NestJS, Prisma, PostgreSQL) step by step, since I didn't have these tools installed beforehand. I typed and saved every file change myself, ran the app after each step, and tested the actual behavior in the browser and via curl rather than assuming AI-generated code worked. ChatGPT helped me understand a couple of specific TypeScript error messages I got stuck on (a Prisma client constructor error, and a type mismatch on an optional field) before applying the fix myself.

## Main Areas AI Helped With
- **Architecture:** Discussed the database schema (WorkItem, QaCheck, Release, ReleaseItem) and the status transition rules before implementing them.
- **Backend:** Guidance on structuring the NestJS services/controllers for Work Items, QA Checks, and Releases, and on where to place the workflow rules (valid transitions, QA gating, release deployment).
- **Frontend:** Guidance on building the Work Items list, detail, Releases, and Release Readiness pages in Next.js, reusing the existing design system rather than introducing a new one.
- **Database:** Help resolving Prisma 7 setup issues (adapter requirement, config file format) that didn't match older Prisma documentation/examples.
- **Tests:** No automated tests were written; manual testing via curl and browser walkthroughs.
- **Debugging:** Used AI to help interpret error messages and trace two real logic bugs (see below), plus environment issues (Docker not starting, PostgreSQL password reset).
- **Documentation:** Drafting the structure of these documentation files, which I then edited to reflect what actually happened.

## What You Reviewed Manually
- Every file was typed/pasted into the project by me and saved myself; nothing was auto-applied.
- After each change, I checked the backend terminal for compile errors and the frontend for runtime errors before moving on.
- I tested the actual user flow in the browser repeatedly: creating work items, transitioning statuses, adding/passing QA checks, creating and deploying releases.
- When something looked wrong (a status transition being blocked unexpectedly), I used curl to query the backend directly and compare it against what the UI showed, to figure out whether the bug was in the frontend or backend before asking for a fix.
- I caught the release-deploy status bug myself by inspecting the actual database rows in Prisma Studio after a deploy looked off.
- I decided against some suggested changes (e.g. a fully custom-built dropdown component) where I judged the time cost wasn't worth it given the deadline.

## What AI Got Wrong
1. **QA gating typo:** an early version of the status-transition check compared `c.status == 'passes'` instead of `'passed'`, so no item could ever pass QA even with a passed check. Found by testing in the browser and confirmed with curl.
2. **Wrong status on deploy:** the release deploy logic set linked work items' status to `'deployed'` instead of `'released'` — `'deployed'` isn't a valid status in the defined workflow at all. Found by inspecting the database in Prisma Studio.
3. Multiple early attempts at Prisma configuration assumed an older Prisma API (passing `url` in `datasource`, or `datasources` in the client constructor) that didn't match the installed Prisma 7 version, requiring a few rounds of trial and error.

## Commands Run
```bash
npm run install:all
npm run dev:api
npm run dev:web
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio
git add .
git commit -m "..."
git push
```

## Known Limitations
- No automated test suite.
- No pagination or search on list views.
- Single seeded user only — no real role-based access control.
- Native `<select>` dropdowns are only styled at the closed-box level, not the open dropdown list.
- No separate "My Work" filtered view (low value with only one seeded user).

## Prompt Log
See `PROMPT_LOG.md`.
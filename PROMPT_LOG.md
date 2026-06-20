# Prompt Log

Use this file to record meaningful AI-assisted work. You do not need to log tiny autocomplete suggestions. Log prompts that shaped architecture, code, debugging, tests, or product decisions.

## Entries

## 2026-06-18 17:00 - Claude
### Goal
Set up the development environment from scratch (Node, Docker, PostgreSQL, project install) since none of these tools were already installed on this machine.

### Prompt
Step-by-step requests to check installed tools and fix Docker/PostgreSQL issues as they came up.

### Output Summary
Suggested checking for Node/Git/Docker versions, installing Docker Desktop, cloning the forked repo, running `npm run install:all`, and creating the `.env` file from the example.

### Files Changed
- `.env` (created from `.env.example`)

### Manual Review
I ran every command myself in my own terminal and reported back the actual output at each step, rather than assuming anything worked.

### Related Commit
N/A (environment setup, not committed)

---

## 2026-06-18 18:30 - Claude
### Goal
Get PostgreSQL running after Docker Desktop got stuck on "Engine starting" for over an hour.

### Prompt
Reported the Docker issue and asked for an alternative way to get a database running.

### Output Summary
Suggested installing PostgreSQL natively on Windows instead of relying on Docker, and walked through resetting the `postgres` user password (which I'd forgotten) via `pg_hba.conf`.

### Files Changed
- None (database-level setup only)

### Manual Review
I diagnosed and reported the exact connection error at each attempt myself, and confirmed the password reset worked by logging in via `psql` before moving on.

### Related Commit
N/A

---

## 2026-06-18 20:00 - Claude
### Goal
Design the database schema for WorkItem, QaCheck, Release, and ReleaseItem, and get Prisma migrations working against the installed Prisma 7.

### Prompt
Asked for a starting schema covering Work Items, QA Checks, and Releases, then reported the exact Prisma errors I hit when running `prisma migrate dev` (`url` not supported in schema, adapter required in client).

### Output Summary
Proposed an initial schema, then suggested fixes one at a time as each Prisma 7 breaking change surfaced: removing `url` from `datasource`, configuring `prisma.config.ts`, and installing `@prisma/adapter-pg`.

### Files Changed
- `backend-nest/prisma/schema.prisma`
- `backend-nest/prisma.config.ts`
- `backend-nest/src/prisma.service.ts`

### Manual Review
I ran `npx prisma migrate dev` and `npx prisma generate` myself after each suggested fix and reported the exact error text back until it actually succeeded — several rounds were needed since the first few suggestions assumed an older Prisma API.

### Related Commit
"chore: setup prisma schema and database migration", "chore: add PrismaService", "chore: setup PrismaService with pg adapter"

---

## 2026-06-18 21:00 - Claude
### Goal
Implement the Work Item status workflow: which transitions are valid, and what blocks moving to `ready_for_release`.

### Prompt
Asked for an approach to enforcing valid status transitions (backlog → planned → in_progress → qa → ready_for_release → released) and blocking release unless QA checks pass, then implemented it in the service file myself.

### Output Summary
Suggested a `VALID_TRANSITIONS` map and a `transitionStatus` method structure that rejects invalid transitions with a clear error message, and checks QA check status before allowing `ready_for_release`.

### Files Changed
- `backend-nest/src/it-workspace/it-workspace.service.ts`
- `backend-nest/src/it-workspace/it-workspace.controller.ts`

### Manual Review
I tested this myself via curl: created a work item, attempted an invalid transition (backlog straight to released), and confirmed it was correctly rejected before testing the valid path.

### Related Commit
"feat: implement work item business logic with status transition rules", "feat: add work item CRUD and status transition API endpoints"

---

## 2026-06-19 12:00 - Claude
### Goal
Build out the QA Checks endpoints and connect score events to work item creation and status transitions.

### Prompt
Asked how to structure a QA Checks service/controller, and how to wire score-awarding into the existing in-memory ScoreService without double-counting.

### Output Summary
Suggested putting the QA Checks CRUD logic in its own service nested under work items, and placing the score-awarding calls inside the service methods (not the controllers) so points only fire on actual state changes.

### Files Changed
- `backend-nest/src/it-workspace/qa-checks.service.ts`
- `backend-nest/src/it-workspace/qa-checks.controller.ts`
- `backend-nest/src/it-workspace/it-workspace.service.ts`
- `backend-nest/src/it-workspace/it-workspace.controller.ts`
- `backend-nest/src/app.module.ts`

### Manual Review
Hit a dependency injection error after wiring this up, which turned out to be a stale watch-compiler process rather than a code issue — I restarted `npm run start:dev` myself and confirmed all routes were mapped correctly afterward.

### Related Commit
"feat: add QA checks module with CRUD endpoints", "feat: award score points for creating work items, passing QA checks, and release readiness"

---

## 2026-06-19 13:30 - Claude
### Goal
Build the Releases feature: creating releases, linking/unlinking ready work items, and deploying a release.

### Prompt
Asked for an approach to release creation with unique version numbers, restricting linked items to `ready_for_release` status only, and making the deploy step atomic.

### Output Summary
Suggested using `prisma.$transaction` for the deploy step so the release status and its linked work items update together, and structuring add/remove/deploy as separate action endpoints rather than generic field edits.

### Files Changed
- `backend-nest/src/it-workspace/releases.service.ts`
- `backend-nest/src/it-workspace/releases.controller.ts`
- `backend-nest/src/app.module.ts`

### Manual Review
Tested via curl and the browser. A real bug was later found in this code through manual testing (see the entry below).

### Related Commit
"feat: implement releases business logic with deploy workflow", "feat: add releases module with deploy workflow that auto-updates work item status"

---

## 2026-06-19 16:00 - Claude
### Goal
Build the frontend pages: Work Items list, Work Item detail (with QA check management), and connect them to the backend API.

### Prompt
Asked for a plan for the API client functions covering every backend endpoint, and for the list/detail page structure (status filter, create form, status-transition buttons limited to valid next states, QA check actions).

### Output Summary
Suggested a typed API client structure and page layouts reusing the project's existing design system rather than introducing new styles.

### Files Changed
- `frontend-next/src/lib/api.ts`
- `frontend-next/src/app/pm/it-workspace/page.tsx`
- `frontend-next/src/app/pm/it-workspace/[id]/page.tsx`

### Manual Review
I noticed an old version of `api.ts` was still showing in my editor after I thought I'd replaced it — caught this myself by comparing what was actually in the file against what was expected, and corrected it before continuing.

### Related Commit
"feat: expand frontend API client with work items, QA checks, and releases endpoints", "feat: build work items list page with create form and status filter", "feat: build work item detail page with status transitions and QA check management"

---

## 2026-06-19 20:00 - Claude
### Goal
Debug why a work item with a passed QA check still couldn't move to `ready_for_release`.

### Prompt
Reported the exact UI error ("All QA checks must pass before moving to ready_for_release") despite the check showing "passed" on screen, and asked for help figuring out if this was a frontend or backend problem.

### Output Summary
Suggested testing the backend directly via curl to rule out the frontend, then reviewing the transition logic line by line, which surfaced a comparison typo: `c.status == 'passes'` instead of `'passed'`.

### Files Changed
- `backend-nest/src/it-workspace/it-workspace.service.ts`

### Manual Review
I ran the curl tests myself (checking the raw work item data, then attempting the transition directly) both before and after applying the one-line fix, and confirmed it worked in the browser afterward.

### Related Commit
"fix: correct QA check status comparison typo (passes -> passed) blocking release transition"

---

## 2026-06-19 23:00 - Claude
### Goal
Debug why a deployed release's linked work item ended up with an invalid status (`"deployed"` instead of `"released"`).

### Prompt
Reported that a work item's status showed `"deployed"` after a release was deployed — a value that isn't part of the defined workflow at all — and asked for help finding the cause.

### Output Summary
Suggested re-checking the deploy method's database update call, which revealed it was setting `status: 'deployed'` on the work item instead of `status: 'released'`.

### Files Changed
- `backend-nest/src/it-workspace/releases.service.ts`

### Manual Review
I actually found this bug myself first, by opening Prisma Studio and noticing the bad status value directly in the database — not from an error message. I manually corrected the bad test data in Prisma Studio, then fixed and verified the underlying code.

### Related Commit
"fix: correct work item status to 'released' instead of 'deployed' on release deploy"

---

## 2026-06-19 23:40 - Claude
### Goal
Replace the native browser confirm() popups with a nicer styled dialog, and add a Release Readiness view as the creative bonus feature.

### Prompt
Asked for a way to replace the plain `confirm()` popups with something matching the app's design, and separately asked for a feature showing which work items are blocked from release and why.

### Output Summary
Suggested a reusable `ConfirmDialog` component for the delete/deploy actions, and a derived (no new table) backend endpoint that reuses the existing status/QA rules to compute per-item blockers, paired with a two-column "Ready / Blocked" frontend page.

### Files Changed
- `frontend-next/src/components/ConfirmDialog.tsx`
- `frontend-next/src/app/pm/releases/page.tsx`
- `frontend-next/src/app/pm/it-workspace/[id]/page.tsx`
- `backend-nest/src/it-workspace/it-workspace.service.ts`
- `backend-nest/src/it-workspace/it-workspace.controller.ts`
- `frontend-next/src/lib/api.ts`
- `frontend-next/src/app/pm/readiness/page.tsx`
- `frontend-next/src/app/pm/layout.tsx`

### Manual Review
I decided against a suggested fully custom dropdown component for the release item picker, judging the time cost wasn't worth it this close to the deadline. I tested the readiness page and both confirm dialogs in the browser myself before committing.

### Related Commit
"feat: replace native browser confirm() popups with styled ConfirmDialog component", "feat: add release readiness endpoint identifying blockers for non-released work items", "feat: add release readiness dashboard page showing blockers for each work item"
# Technical Decisions

## Summary
Implemented the full core workflow of the IT Delivery Workspace: Work Items (CRUD + status transitions), QA Checks (CRUD + release gating), Releases (creation, linking work items, deploy), score events tied to key actions, and a Release Readiness dashboard as the creative bonus feature. Built both backend (NestJS + Prisma + PostgreSQL) and frontend (Next.js) end-to-end, covering Levels 1-4 plus a bonus feature from the brief.

## Database Design
Four main tables, modeled with Prisma:

- **WorkItem** — the central entity. Fields: title, description, type, status, priority, assignee, dueDate, timestamps. Status defaults to `backlog`.
- **QaCheck** — belongs to a WorkItem (`workItemId` foreign key, cascade delete). Fields: title, expectedResult, actualResult, status (`pending` / `passed` / `failed`).
- **Release** — fields: version (unique), summary, status (`draft` / `deployed`), releasedAt.
- **ReleaseItem** — join table linking Release and WorkItem, with a unique constraint on `(releaseId, workItemId)` to prevent duplicate links.

Relationships: WorkItem → many QaChecks (1:N), Release ↔ WorkItem (M:N via ReleaseItem).

## API Design
REST endpoints grouped by resource, all behind JWT auth (`JwtAuthGuard`):

- `GET/POST /it-workspace/work-items`, `GET/PATCH/DELETE /it-workspace/work-items/:id`, `PATCH /it-workspace/work-items/:id/status` — separating the status transition into its own endpoint (rather than allowing arbitrary `status` edits via the generic update) made it possible to enforce workflow rules in one place.
- `GET/POST /it-workspace/work-items/:workItemId/qa-checks`, `PATCH/DELETE /it-workspace/qa-checks/:id` — nested under work item for creation/listing (a check always belongs to one item), flat for update/delete (the check's own id is enough once it exists).
- `GET/POST /it-workspace/releases`, `POST /it-workspace/releases/:id/work-items`, `DELETE /it-workspace/releases/:id/work-items/:workItemId`, `POST /it-workspace/releases/:id/deploy` — deploy is a distinct action endpoint rather than a generic status PATCH, since it triggers a side effect (updating linked work items) that a simple field edit shouldn't imply.
- `GET /it-workspace/release-readiness` — a derived, read-only view computed on the fly from work items and their QA checks (no new table), reusing the same status/QA rules as the transition logic rather than duplicating them elsewhere.

## Frontend Design
Built on top of the existing Next.js app shell (sidebar nav, navy/orange design system already defined in `globals.css`). Four main pages:

- **Work Items list** (`/pm/it-workspace`) — table view with status filter and an inline create form.
- **Work Item detail** (`/pm/it-workspace/[id]`) — shows current status with only the *valid next* status buttons (mirrors backend `VALID_TRANSITIONS`), plus QA check management inline.
- **Releases** (`/pm/releases`) — release cards showing linked items, with add/remove/deploy actions.
- **Release Readiness** (`/pm/readiness`) — creative bonus feature; splits all non-released items into "Ready" and "Blocked" columns, listing the specific blocking reasons for each.

Reused existing `.card`, `.button`, `.table`, `.badge` CSS classes for visual consistency rather than introducing a new style system. Replaced native `confirm()` popups with a custom `ConfirmDialog` component for destructive/irreversible actions (delete, deploy).

## Workflow Rules
- **Valid status transitions** — enforced via a `VALID_TRANSITIONS` map in `it-workspace.service.ts` (`backlog → planned → in_progress → qa → ready_for_release → released`, with `qa` allowed to go back to `in_progress`). Any other transition throws a 400 with the allowed options listed.
- **QA readiness rule** — moving to `ready_for_release` is blocked unless the item has at least one QA check and all checks have status `passed`.
- **Release deployment rule** — a work item can only be linked to a release if its status is `ready_for_release`. Deploying a release is blocked if it's already deployed or has no linked items. Deploy runs as a single Prisma `$transaction` that flips the release to `deployed` and all linked work items to `released` atomically.
- **Score idempotency** — points are awarded inside the same service methods that perform the state change (create item, check passed, item ready for release, release deployed), so they only fire once per actual transition. Re-deploying a release is blocked outright by the deployment rule above, which also prevents double-scoring.

## Tradeoffs
- Testing was done manually via curl and the browser, with multiple full end-to-end passes through the entire lifecycle.
- No pagination on work item or release lists — fine for a take-home challenge's data volume, would need addressing at scale.
- No role-based permissions beyond the single seeded user — out of scope for a 2-day single-user assessment.
- Only the Releases page item-picker received a UI pass for custom dropdown styling consideration (kept native for time reasons); confirmation dialogs were fully replaced with a custom styled component since they appear on the highest-stakes actions (delete, deploy).

## Unfinished Work
- A "My Work" view filtered to the current user (not strictly needed in the single-user seeded setup, but listed in the brief).
- Automated tests (unit tests for transition/QA-gating logic would be the highest-value addition).
- Pagination/search on longer lists.
- Fully custom-styled native `<select>` dropdowns app-wide (currently styled at the closed-box level only).
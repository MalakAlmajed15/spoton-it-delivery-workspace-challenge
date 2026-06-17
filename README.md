# SpotOn IT Delivery Workspace Intern Challenge

Welcome. This is a 2-day full-stack challenge for the Full Stack Developer Intern role at SpotOn.

This repository is a simplified assessment project. It is not the production codebase. The starter contains only a small login flow, a basic score surface, and an incomplete IT Workspace shell.

Your job is to turn the IT Workspace into a useful software delivery module.

## Product Story

SpotOn has an internal Project Engine used by teams to manage work. The IT/software team needs a focused workspace for the software engineering lifecycle:

```txt
request / idea -> planning -> development -> QA/testing -> release -> follow-up
```

The IT Delivery Workspace should help the team answer practical questions:

- What are we building or fixing?
- Who owns each work item?
- What stage is each item in?
- What still needs QA?
- What is ready to release?
- What shipped, when, and in which release?
- Which useful engineering actions should earn score points?

This is not just a CRUD task. We want to see how you think about workflow, product behavior, data relationships, user experience, and maintainable code.

## Time Limit

You have 2 days.

You are not expected to finish every level. The challenge is layered. A clean Level 3 is better than an unstable Level 5.

Work in this order:

1. Make the core flow work.
2. Keep the code understandable.
3. Add tests where they protect important behavior.
4. Add creative polish only after the foundation is stable.

## Tech Stack

- Next.js / React in `frontend-next`
- NestJS in `backend-nest`
- PostgreSQL
- REST APIs
- Authentication
- Git/GitHub
- AI tools are allowed, but must be disclosed

## Starter Login

```txt
Email: intern@spoton.test
Password: intern123
```

## Setup

Install dependencies:

```bash
npm run install:all
```

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Run the API:

```bash
npm run dev:api
```

Run the web app in another terminal:

```bash
npm run dev:web
```

Open:

```txt
http://localhost:3000
```

The API defaults to:

```txt
http://localhost:3001
```

## What Is Already Included

The starter is small:

- Login page
- Basic JWT auth
- Basic score page and score API
- IT Workspace shell page
- Placeholder IT Workspace API endpoints
- PostgreSQL Docker service

Everything else from the larger product has been removed so you can focus on the assignment.

## What You Need To Build

Build the IT Delivery Workspace as three connected modules.

## Module 1: IT Work Items

This is the main software delivery tracker.

A work item represents a software feature, bug, improvement, or maintenance task.

Required fields:

- title
- description
- type: `feature`, `bug`, `improvement`, `maintenance`
- status: `backlog`, `planned`, `in_progress`, `qa`, `ready_for_release`, `released`
- priority: `low`, `medium`, `high`, `urgent`
- assignee
- due date
- created by
- created at
- updated at

Required behavior:

- Create, list, view, update, and delete work items.
- Store work items in PostgreSQL.
- Protect work item APIs with authentication.
- Add search and filters for status, priority, assignee, and text.
- Add a `My Work` view or filter.
- Handle loading, empty, error, and success states in the UI.

## Module 2: QA Checks

QA checks represent testing and quality control for a work item.

Required fields:

- linked work item
- test title
- expected result
- actual result
- status: `pending`, `passed`, `failed`
- tester
- notes
- created at
- updated at

Required behavior:

- Add QA checks to a work item.
- Mark checks as passed or failed.
- Show QA progress on the work item list and detail page.
- A work item cannot move to `ready_for_release` unless all QA checks are `passed`.
- A work item with zero QA checks should not be considered ready for release.

## Module 3: Release Notes

Release notes represent deployment planning and shipped work.

Required fields:

- version
- release date
- summary
- deployment status: `draft`, `scheduled`, `deployed`, `rolled_back`
- linked work items
- created at
- updated at

Required behavior:

- Create, list, and view releases.
- Link ready work items to a release.
- Only `ready_for_release` work items can be linked to a release.
- When a release is marked `deployed`, linked work items should become `released`.
- Show which work shipped in each release.

## Workflow Rules

Implement workflow rules on the backend. The frontend should guide the user, but the backend must protect the data.

Expected work item flow:

```txt
backlog -> planned -> in_progress -> qa -> ready_for_release -> released
```

Reasonable backward movement is allowed when it makes sense, for example:

```txt
qa -> in_progress
ready_for_release -> qa
```

Invalid examples:

- `backlog` directly to `released`
- `in_progress` directly to `ready_for_release` without QA
- `ready_for_release` when QA is failed or pending
- adding a non-ready item to a release

## Score System

The starter has a basic score API/page. Extend it in a meaningful way.

Suggested scoring events:

- Create a useful work item: +1
- Move a work item to QA: +1
- Complete a QA check: +1
- Move a work item to ready for release: +2
- Deploy a release: +3

Important rule:

- Prevent duplicate points for the same action on the same entity.

Example: clicking deploy twice should not award deploy points twice.

## Level System

This is how we will read your submission.

### Level 1: Core Work Items

Minimum acceptable submission:

- Authenticated work item CRUD
- PostgreSQL persistence
- Basic pages and forms
- Loading/error/empty states
- Clean setup instructions

### Level 2: Workflow and Ownership

Add:

- Status transitions
- Backend validation for invalid transitions
- Assignee support
- My Work view/filter
- Activity/status history
- Search and filters

### Level 3: QA Checks

Add:

- QA check CRUD or practical equivalent
- Pass/fail/pending state
- QA progress on work item cards/detail
- Backend readiness rule
- Clear UI feedback when readiness is blocked

### Level 4: Release Notes

Add:

- Release CRUD
- Link ready work items
- Deploy release
- Auto-update linked items to `released`
- Release detail page

### Level 5: Score, Tests, and Product Polish

Add:

- Score integration for meaningful engineering actions
- Idempotent score events
- Useful tests for workflow rules
- Good UX polish
- Clean responsive layout
- Thoughtful error messages and toasts

## Creative Challenge

After the core levels are stable, add one creative feature that makes the IT Delivery Workspace feel like a real engineering tool.

Choose one of these or invent your own:

- **Release Readiness Board:** a dashboard that shows what blocks each item from release.
- **QA Risk Meter:** calculate risk from priority, failed QA count, overdue date, and missing assignee.
- **Engineering Timeline:** visual timeline from idea to release with activity events.
- **Smart Next Action:** each work item shows the next recommended action based on status and QA state.
- **Deployment Checklist:** release cannot deploy until checklist items are complete.
- **AI-Ready Brief:** generate a concise implementation brief from a work item, including acceptance criteria and QA notes.
- **Post-Release Review:** after deployment, collect what shipped, what failed, and follow-up tasks.

A creative feature should not be decoration only. It should improve how a software team plans, tests, or ships work.

## Codebase Investigation

Before building, run the project and inspect the existing frontend and backend structure. If you find setup problems, incomplete behavior, or blockers, decide whether they affect your implementation. Fix the important ones and document what you changed in `DECISIONS.md`.

Do not spend your whole time on unrelated cleanup. Prioritize what matters for the IT Delivery Workspace.

## Technical Expectations

Backend expectations:

- Use NestJS controllers, services, and DTOs.
- Store new module data in PostgreSQL.
- Keep business rules in backend services.
- Protect APIs with authentication.
- Validate input.
- Return consistent error messages.
- Avoid hardcoded fake data for completed features.

Frontend expectations:

- Use the existing simple design direction.
- Build real product screens, not a landing page.
- Keep the workflow easy to understand.
- Handle loading, empty, error, and success states.
- Keep the UI responsive.
- Make forms clear and practical.

Database expectations:

- Design tables with sensible relationships.
- Use stable IDs.
- Track created/updated timestamps.
- Avoid storing everything as one unstructured JSON blob.
- Think about constraints that protect workflow rules.

Git expectations:

- Use clear commits.
- Do not commit secrets or real `.env` files.
- Keep unrelated changes out of the submission.
- Include a useful final README/notes update if setup changed.

## AI Usage

AI tools are allowed. We care about how you use them.

Create `AI_USAGE.md` using `AI_USAGE_TEMPLATE.md`.

Include:

- tools used
- important prompts
- what AI helped with
- what you changed manually
- what AI got wrong
- known limitations

You must be able to explain all submitted code.

## Required Submission

Submit:

- GitHub repository link or pull request link
- short demo video, 3-5 minutes
- `AI_USAGE.md`
- `DECISIONS.md`
- setup instructions
- tests added and commands run
- known limitations or unfinished levels

## Demo Video Guide

In your demo, show:

1. Login.
2. Create a work item.
3. Move it through at least part of the workflow.
4. Show QA behavior if implemented.
5. Show release behavior if implemented.
6. Show score behavior if implemented.
7. Mention what you would improve next.

## What We Value Most

We value:

- working vertical slices
- clear backend rules
- clean database thinking
- practical UI decisions
- readable code
- good debugging judgment
- honest AI usage
- ability to explain tradeoffs

A smaller complete solution is better than a large unstable one.

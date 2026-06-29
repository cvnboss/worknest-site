# WorkNest Feature Priority Review

This is the root planning index for WorkNest feature prioritization. Detailed per-feature plans are split into separate files under `docs/plans/` to avoid repeatedly loading long archived plans.

## Linked Detailed Plans

| Feature | Status | Detailed Plan |
|---|---|---|
| Department Management | Implemented and stabilized | `docs/plans/department_management_plan.md` |
| Audit Log | Implemented and desktop-verified | `docs/plans/audit_log_plan.md` |
| Task Comments | Recommended next | `docs/plans/task_comments_plan.md` |

## Current Decision

Selected next feature: Task Comments.

Reason:

1. Department Management is complete and Audit Log Phase A is now implemented.
2. Task Comments is a small, high-value collaboration feature that extends an existing module instead of opening a large new surface.
3. Announcement comments already provide a local API/data pattern that can be adapted safely.
4. It does not require realtime infrastructure, file storage, external services, or new npm dependencies.
5. It gives Playwright E2E tests a useful create/read/delete workflow inside an existing board.

Fallback if Task Comments is deferred:

1. Advanced Notification Center, because the header dropdown and notification APIs already exist.
2. Export Reports CSV, if the next goal is admin/reporting coverage.
3. Dark Mode, if the next goal is design-system polish.

Not selected now:

1. Responsive Mobile, because the app is currently scoped as a desktop-focused internal system.
2. Attendance & Timesheet, because it is a larger HR module and should follow one smaller collaboration increment.
3. Internal Messenger, because realtime infrastructure is outside the current demo architecture.

## Department Management Recap

Status: complete and maintain-only.

Completed:

1. Department data model and seed data.
2. Department API routes:
   - `GET /api/departments`
   - `POST /api/departments`
   - `GET /api/departments/[id]`
   - `PUT /api/departments/[id]`
   - `DELETE /api/departments/[id]`
   - `GET /api/departments/[id]/members`
   - `PUT /api/departments/[id]/members`
3. `/departments` page with search, status filter, refresh, stats, table, mobile cards, create/edit flow, deactivate confirmation, and member management.
4. Admin-only create/edit/deactivate/member actions.
5. Sidebar and Header integration.
6. Employees page department filter/form integration with active departments from the Department API.
7. Manual UI review fixes and `.agent` rule updates.

Stabilization fixes completed:

1. Department toolbar/search/filter alignment.
2. Department skeleton loading consistency.
3. Department employee-count wording.
4. Department stat icons and hover behavior.
5. Task Board dropdown stacking and compact lane layout.
6. Leave table alignment and badge readability.
7. Calendar event readability.
8. Settings menu/content alignment.
9. Shared avatar consistency across Employees, Departments, Tasks, Sidebar, and Settings.
10. Visible UI/seed cleanup for unstable decorative characters.

Baseline verification completed:

1. `npm run type-check`
2. `npm run build`
3. API smoke checks for Department flows.
4. Browser smoke checks across main routes.
5. Browser metric checks for Task dropdown layering and Settings alignment.

## Re-Evaluated Priority Principles

Priority is based on:

1. Foundation value: features that unlock cleaner data, reporting, RBAC, and later modules go first.
2. Non-breaking delivery: features should preserve existing pages, APIs, routes, test IDs, and current UX.
3. UI consistency: new screens must reuse current layout, cards, controls, tables, badges, spacing, radius, and responsive behavior.
4. Operational safety: admin/security/audit-related features should be added before workflow-heavy modules.
5. Demo architecture fit: features requiring persistent file storage, realtime infrastructure, or external AI keys are deferred.

## Re-Evaluated Feature Priority Table

| Rank | Feature | Priority | Current Status | Decision |
|---:|---|---|---|---|
| 1 | Department Management | Maintain | Implemented and stabilized | Closed; maintain only |
| 2 | Audit Log | Maintain | Implemented Phase A and desktop-verified | Closed; Phase B optional later |
| 3 | Task Comments | P1 | Not implemented for tasks | Selected next feature |
| 4 | Advanced Notification Center | P1 | Dropdown/API baseline exists | Upgrade later, do not rebuild |
| 5 | Attendance & Timesheet | P1 | Not implemented | Core HR module |
| 6 | Export Reports | P1 | Not implemented | Add CSV first, PDF/Excel later |
| 7 | Dark Mode | P1 | Partially hinted, no complete theme system | Follow design-token audit |
| 8 | Responsive Mobile | Deferred | Partially present | Do not prioritize until responsive scope is requested |
| 9 | Employee Profile Upgrade | P2 | Baseline exists | Enhance only |
| 10 | Unified Calendar Upgrade | P2 | Baseline exists | Enhance month/week/day/filter only |
| 11 | Organization Chart | P2 | Not implemented | Depends on departments/reporting lines |
| 12 | Onboarding/Offboarding | P2 | Not implemented | Can reuse tasks/notifications |
| 13 | Kudos & Gamification | P2 | Not implemented | Culture module |
| 14 | Expense Claims | P3 | Not implemented | Workflow module |
| 15 | Asset Management | P3 | Not implemented | Operations module |
| 16 | Performance Review/KPI | P3 | Not implemented | Large HR module |
| 17 | Polls & Surveys | P3 | Not implemented | Small independent module |
| 18 | Document Storage | P4 | Not implemented | Needs storage decision |
| 19 | Knowledge Base | P4 | Not implemented | Better after document/content model |
| 20 | i18n | P4 | Not implemented | Large UI text migration |
| 21 | Internal Messenger | P5 | Not implemented | Realtime complexity |
| 22 | AI Assistant | P5 | Not implemented | External provider and guardrails required |
| 23 | Dashboard Charts | Maintain | Implemented | Polish only |

## Codebase Status Summary

Already developed:

1. Dashboard Charts:
   - `app/page.tsx`
   - `app/api/dashboard/charts/route.ts`
   - `chart.js`
   - `react-chartjs-2`
2. Notification Center baseline:
   - `components/layout/NotificationPanel.tsx`
   - `components/layout/Header.tsx`
   - `app/api/notifications/route.ts`
   - `app/api/notifications/read/route.ts`
3. Unified Calendar baseline:
   - `app/calendar/page.tsx`
   - `app/api/calendar/route.ts`
4. Employee Profile baseline:
   - `app/employees/[id]/page.tsx`
   - `app/api/employees/[id]/profile/route.ts`
5. Department Management:
   - implemented and stabilized

Partially developed:

1. Responsive Mobile:
   - some responsive patterns exist
   - full viewport audit still needed
2. Dark Mode:
   - some class hints exist
   - no complete tokenized theme toggle

Not developed as full modules:

1. Task Comments
3. Attendance & Timesheet
4. Export Reports
5. Organization Chart
6. Onboarding/Offboarding
7. Kudos
8. Expense Claims
9. Asset Management
10. Performance Review
11. Polls & Surveys
12. Document Storage
13. Knowledge Base
14. i18n
15. Internal Messenger
16. AI Assistant

## Next Action

Before implementation:

1. Create `docs/plans/task_comments_plan.md`.
2. Audit the existing Task Board and Announcement comment patterns.
3. Confirm the Task Comments scope before coding.

Recommended Task Comments scope:

1. Add comments to each task with author, content, timestamp, and optional edit/delete ownership.
2. Show comment count on task cards without cluttering the Kanban layout.
3. Add a task detail/comment panel or modal that matches existing drawer/modal styling.
4. Add authenticated API routes for listing and adding comments, with delete/edit only for author or Admin.
5. Add seed comments for a few representative tasks so E2E tests have stable initial data.
6. Add Audit Log instrumentation for task comment create/delete only if it stays low-risk.

Verification before closing:

1. `npm run type-check`
2. `npm run build`
3. API smoke checks for task comment create/list/delete permissions.
4. Desktop browser checks for Tasks board comment count, detail panel alignment, and no dropdown layering regression.

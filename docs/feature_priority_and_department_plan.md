# WorkNest Feature Priority Review

This is the root planning index for WorkNest feature prioritization. Detailed per-feature plans are split into separate files under `docs/plans/` to avoid repeatedly loading long archived plans.

## Linked Detailed Plans

| Feature | Status | Detailed Plan |
|---|---|---|
| Department Management | Implemented and stabilized | `docs/plans/department_management_plan.md` |
| Audit Log | Selected next, pending approval | `docs/plans/audit_log_plan.md` |

## Current Decision

Selected next feature: Audit Log.

Do not implement Audit Log until the detailed plan is approved.

Reason:

1. Department Management is complete and introduced more admin mutations.
2. Audit Log gives Admin users traceability before the app gains more workflow-heavy modules.
3. It is additive, admin-only, and fits the current in-memory data architecture.
4. It does not require external services, realtime infrastructure, storage migration, or new npm dependencies.

Fallback if Audit Log is deferred:

1. Task Comments, because Announcement comments already provide a local pattern.
2. Responsive Mobile audit, if the next goal is polish rather than new functionality.

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
| 2 | Audit Log | P0 | Not implemented | Selected next feature |
| 3 | Responsive Mobile | P0 | Partially present | Continue opportunistic fixes; full audit later |
| 4 | Dark Mode | P1 | Partially hinted, no complete theme system | Follow design-token audit |
| 5 | Advanced Notification Center | P1 | Dropdown/API baseline exists | Upgrade later, do not rebuild |
| 6 | Task Comments | P1 | Not implemented for tasks | Good collaboration quick win |
| 7 | Attendance & Timesheet | P1 | Not implemented | Core HR module |
| 8 | Export Reports | P1 | Not implemented | Add CSV first, PDF/Excel later |
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

1. Audit Log
2. Task Comments
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

1. Read `docs/plans/audit_log_plan.md`.
2. Confirm the Audit Log scope.
3. Approve implementation.

After approval:

1. Add audit types, constants, and helper.
2. Add `GET /api/audit-logs`.
3. Instrument Phase A routes.
4. Add Audit Logs page and nav item.
5. Run static, API, and browser checks.

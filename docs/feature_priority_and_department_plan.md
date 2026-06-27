# WorkNest Feature Priority Review & Detailed Department Management Plan

## 1. Purpose

This document saves the reviewed feature priority plan from `docs/feature_proposals.md`, then records a codebase status check and a detailed implementation plan for the first recommended new feature.

Current status note: Department Management has now moved from plan to implementation. This document is kept as the source of truth for priority recap, implementation status, verification, and next recommended work.

## 0. Implementation Recap - Department Management

### Completed

1. Backend Department module
   - Added Department types and status model.
   - Added department constants and validation limits.
   - Added department seed data.
   - Added department name normalization helper.
   - Added department API routes:
     - `GET /api/departments`
     - `POST /api/departments`
     - `GET /api/departments/[id]`
     - `PUT /api/departments/[id]`
     - `DELETE /api/departments/[id]`
     - `GET /api/departments/[id]/members`
     - `PUT /api/departments/[id]/members`

2. Frontend Department Management page
   - Added `/departments` page.
   - Added department search, status filter, refresh, stats, table, mobile cards, create/edit modal, deactivate confirmation, and member management flow.
   - Added admin-only create/edit/deactivate/member actions.
   - Added safe fallback rendering if the Department API is unavailable.

3. App integration
   - Added Departments item to sidebar navigation.
   - Added Departments header title and `New Department` header action.
   - Updated Employees page department filter and employee form options to use active departments from the Department API with a fallback list.

4. UI consistency correction
   - Fixed Department toolbar/search/filter alignment after visual review.
   - Search input, `All Status` dropdown, refresh button, and create button now follow the same height and alignment pattern as Employees.
   - Updated `.agent/RULE.md` and `.agent/sub_agents/frontend-engineer/RULE.md` so future pages must compare toolbar/search/filter controls against an existing page standard before delivery.

### Verification Completed

1. `npm run type-check` passed.
2. `npm run build` passed.
3. API smoke test passed:
   - login
   - list departments
   - create department
   - update department
   - assign members
   - deactivate department
4. Browser smoke test passed:
   - `/departments` renders on desktop.
   - department rows/cards render.
   - admin actions are visible.
   - no console errors found during smoke check.
   - mobile layout at 390px has no horizontal overflow.

### Known Notes

1. `npm run lint` is not verified because `next lint` prompts for interactive ESLint setup in this project.
2. Department data is still backed by the current in-memory store, consistent with the existing app architecture.
3. Existing `User.department: string` behavior is intentionally preserved to avoid breaking Employees, Dashboard, Tasks, Leave, and profile pages.
4. `.next-dev.log` and `.next-dev.err` may exist locally because the dev server was opened for manual review.

### Current Manual Review Target

The app is expected to be manually checked at:

`http://localhost:3000`

Recommended login:

- Admin: `admin@worknest.com` / `admin123`

Manual review should focus on:

1. Department toolbar alignment versus Employees.
2. Create/edit/deactivate Department flows.
3. Manage Members flow.
4. Employees page department filter after member changes.
5. Desktop and mobile visual symmetry.

## 2. Re-Evaluated Priority Principles

The original proposal ranked features mostly by business value and estimated difficulty. After checking the current WorkNest codebase, the priority should be adjusted because several high-ranked features already exist as baseline functionality.

Priority is now based on:

1. Foundation value: features that unlock cleaner data, reporting, RBAC, and later modules go first.
2. Non-breaking delivery: features should be additive and preserve existing pages, APIs, routes, test IDs, and current UX.
3. UI consistency: new screens must reuse current layout, cards, form controls, tables, badges, spacing tokens, radius scale, and responsive behavior.
4. Operational safety: admin/security/audit-related features should be added before workflow-heavy modules.
5. Demo architecture fit: features requiring persistent file storage, realtime infrastructure, or external AI keys are deferred.

## 3. Re-Evaluated Feature Priority Table

| Rank | Feature | New Priority | Current Status | Decision |
|---:|---|---|---|---|
| 1 | Department Management | P0 | Implemented and smoke-tested | Stabilize from manual review |
| 2 | Audit Log | P0 | Not implemented | Next foundation feature |
| 3 | Responsive Mobile | P0 | Partially present | Improve after foundation or in parallel with UI cleanup |
| 4 | Dark Mode | P0 | Partially hinted in class names, no complete theme system | High ROI, but should follow design-token audit |
| 5 | Advanced Notification Center | P1 | Dropdown/API already exists | Upgrade later, do not rebuild |
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
| 23 | Dashboard Charts | Maintain | Already implemented | Polish only |

## 4. Codebase Status Check

### Already Developed

1. Dashboard Charts
   - `app/page.tsx` imports and renders `Line`, `Bar`, and `Doughnut` from `react-chartjs-2`.
   - `app/api/dashboard/charts/route.ts` computes chart data.
   - `package.json` already includes `chart.js` and `react-chartjs-2`.

2. Notification Center baseline
   - `components/layout/NotificationPanel.tsx` exists.
   - `components/layout/Header.tsx` opens the notification panel and shows unread badge behavior.
   - `app/api/notifications/route.ts` and `app/api/notifications/read/route.ts` exist.
   - `lib/types.ts` includes `Notification`.
   - `lib/seed.ts` seeds notifications.

3. Unified Calendar baseline
   - `app/calendar/page.tsx` exists.
   - `app/api/calendar/route.ts` exists.
   - `lib/types.ts` includes `CalendarEvent`.
   - Current implementation is mainly month-grid based.

4. Employee Profile baseline
   - `app/employees/[id]/page.tsx` exists.
   - `app/api/employees/[id]/profile/route.ts` exists.
   - Profile displays employee details, stats, tasks, and leave history.

5. Security/code-quality foundation from previous plan
   - `lib/constants.ts` exists.
   - `lib/api-utils.ts` exists.
   - `lib/utils.ts` exists.
   - Several API routes already use field whitelisting patterns.

### Partially Developed

1. Responsive Mobile
   - Some responsive patterns exist, but the app still needs a full viewport audit.
   - Sidebar mobile drawer/hamburger behavior should be checked before claiming complete support.

2. Dark Mode
   - Some page classes include `dark:*` Tailwind-style class names.
   - `app/globals.css` currently defines only the main `:root` token set; there is no complete app-level theme toggle and persisted dark token system.

3. Department Handling
   - Employees still preserve the non-breaking `department: string` field.
   - Department collection, CRUD API, manager assignment, department status, and dedicated Department Management page have been implemented.
   - Employees page now uses active departments from the Department API with a fallback list.

### Not Developed

Audit Log, Task Comments, Attendance & Timesheet, Export Reports, Organization Chart, Onboarding/Offboarding, Kudos, Expense Claims, Asset Management, Performance Review, Polls & Surveys, Document Storage, Knowledge Base, i18n, Internal Messenger, and AI Assistant are not implemented as full modules.

## 5. Recommended Starting Feature

Start with Department Management.

Reasons:

1. It is currently missing as a real module, so this is genuine new functionality.
2. It supports many later features: Organization Chart, Timesheets, Reports, Audit Logs, Onboarding, Performance Review, and access filters.
3. It can be implemented additively without changing existing employee API behavior.
4. It improves data hygiene by replacing hardcoded department lists over time.
5. It has manageable complexity and can be tested thoroughly with the current in-memory store.

## 6. Department Management: Non-Breaking Implementation Strategy

The key constraint is to avoid breaking existing features that already rely on `employee.department` as a string.

Therefore, Phase 1 must keep `User.department: string` intact and introduce departments as a canonical collection. Existing employee records continue to work. Department CRUD adds structure around the existing department names rather than forcing a risky migration.

Non-breaking rules:

1. Do not rename `department` on `User`.
2. Do not change existing `/api/employees` response shape.
3. Do not remove or rename existing routes.
4. Do not remove existing `data-testid` values.
5. Do not change current dashboard/calendar/notification behavior.
6. Add new APIs and UI screens first; only then gradually replace hardcoded department arrays.
7. If a department is renamed, update user `department` strings in a controlled backend operation.
8. If a department is deactivated, keep historical employees/tasks readable.

## 7. Target UX Standard

The Department Management UI must feel like it belongs to the current WorkNest app.

Required visual behavior:

1. Use the current app shell, header, sidebar, page spacing, card radius, typography, and CSS variables.
2. Use the same table density as Employees where possible.
3. Use existing button classes and badge patterns.
4. Use icon buttons only where the meaning is standard, with accessible labels.
5. Keep destructive actions behind confirmation dialogs.
6. Maintain consistent empty, loading, and error states.
7. No nested cards.
8. No decorative gradients/orbs.
9. Mobile layout must stack cleanly with no horizontal overflow.
10. Forms must align labels, inputs, helper text, and errors consistently.

## 8. Detailed Implementation Plan: Department Management

### Phase 1: Backend Data Model

Goal: introduce departments as a first-class collection while preserving existing user department strings.

1. Add a `Department` interface to `lib/types.ts`.
   - Fields:
     - `id: string`
     - `name: string`
     - `description: string`
     - `managerId?: string`
     - `managerName?: string`
     - `status: 'active' | 'inactive'`
     - `createdAt: string`
     - `updatedAt: string`
   - Optional later fields:
     - `location?: string`
     - `costCenter?: string`

2. Add constants to `lib/constants.ts`.
   - Add `DEPARTMENTS: 'departments'` to `COLLECTIONS`.
   - Add `DEPARTMENT_STATUS = ['active', 'inactive'] as const`.
   - Add max lengths:
     - department name: 80
     - description: 500

3. Add seed data in `lib/seed.ts`.
   - Create `seedDepartments()`.
   - Seed current departments:
     - Management
     - Engineering
     - Design
     - Marketing
     - HR
     - Finance
   - Assign known managers where obvious:
     - Engineering: Maya Manager (`u2`)
     - Design: Anna Taylor (`u12`)
     - Others can start without manager or use Admin for Management.
   - Call `seedDepartments()` before `seedUsers()` or immediately after `seedUsers()` depending on whether manager names are derived from users.
   - If manager names are derived from users, call after `seedUsers()`.

4. Add helper functions in `lib/api-utils.ts` only if they fit existing patterns.
   - `normalizeDepartmentName(name: string): string`
   - `isValidDepartmentStatus(status: unknown): status is DepartmentStatus`
   - Avoid over-abstracting until used in more than one route.

Acceptance criteria:

1. Existing seed still loads all current modules.
2. Existing employees still have `department` strings.
3. New department collection exists and mirrors current hardcoded departments.

### Phase 2: Department API Routes

Goal: provide secure CRUD and summary endpoints without disturbing existing APIs.

1. Create `app/api/departments/route.ts`.

2. Implement `GET /api/departments`.
   - Auth required.
   - Query params:
     - `status=active|inactive|all`
     - `q=search text`
     - `includeStats=true|false`
   - Default behavior:
     - Return active departments first.
     - Sort by name.
   - If `includeStats=true`, include:
     - `employeeCount`
     - `activeEmployeeCount`
     - `openTaskCount`
     - `pendingLeaveCount`
   - Response:
     - `{ success: true, data: DepartmentWithStats[] }`

3. Implement `POST /api/departments`.
   - Admin-only.
   - Required fields:
     - `name`
   - Optional:
     - `description`
     - `managerId`
     - `status`
   - Validation:
     - name required, trimmed, max length.
     - no duplicate department name case-insensitively.
     - manager must exist and be active if supplied.
     - manager should ideally be `manager` or `admin`; reject employee manager assignment unless current app requirements say otherwise.
   - Response:
     - `{ success: true, data: department, message: 'Department created' }`

4. Create `app/api/departments/[id]/route.ts`.

5. Implement `GET /api/departments/[id]`.
   - Auth required.
   - Return department with stats and member preview.
   - Include related employees only as safe employee objects with no password.

6. Implement `PUT /api/departments/[id]`.
   - Admin-only.
   - Whitelist update fields:
     - `name`
     - `description`
     - `managerId`
     - `status`
   - Validation:
     - no duplicate name.
     - manager exists.
     - cannot deactivate the last active department if business rules need at least one.
   - Rename behavior:
     - If `name` changes, update `department` string for users currently in the old department.
     - Keep this update inside the same route handler.
     - Do not alter unrelated task/leave data; they derive department through current user data.

7. Implement `DELETE /api/departments/[id]`.
   - Admin-only.
   - Prefer soft delete by setting `status: 'inactive'`.
   - Reject hard delete if employees are assigned.
   - Response should clearly say deactivated rather than deleted.

8. Create `app/api/departments/[id]/members/route.ts`.
   - `GET`: list members in the department.
   - `PUT`: admin-only bulk assign employees to department.
   - Body:
     - `{ userIds: string[] }`
   - Validation:
     - all users exist.
     - inactive users may be allowed but should be explicit.
   - Non-breaking:
     - update each user `department` string to the department name.

Acceptance criteria:

1. Non-admin users can read departments but cannot create/update/delete.
2. Existing employee endpoints still work.
3. Department rename updates employees consistently.
4. Soft delete does not remove historical visibility.

### Phase 3: Navigation & Page Shell

Goal: add the department page in a predictable place without disrupting current navigation.

1. Add a sidebar nav item.
   - Recommended location: People/Management section near Employees.
   - Label: `Departments`.
   - Icon: use a Lucide icon already available or appropriate, such as `Building2`.
   - Route: `/departments`.
   - Admin and Manager can see the page; edit actions are admin-only.

2. Update header page title mapping.
   - `/departments` -> `Departments`
   - `/departments/[id]` if detail page is added later.

3. Keep route additive.
   - Do not change `/employees`.
   - Do not change profile links.

Acceptance criteria:

1. Existing sidebar routes remain in same order except the new Departments entry.
2. Current active nav behavior still works.
3. Header title displays correctly.

### Phase 4: Departments List Page UI

Goal: create a polished management page with stable layout, aligned controls, and familiar WorkNest patterns.

1. Create `app/departments/page.tsx`.

2. Page layout:
   - Top row:
     - Title area is handled by Header, so page body starts with content controls.
     - Left: search input.
     - Middle: status filter.
     - Right: `New Department` button for Admin only.
   - Summary stat row:
     - Total Departments
     - Active Departments
     - Employees Assigned
     - Departments Without Manager
   - Main table:
     - Department
     - Manager
     - Employees
     - Open Tasks
     - Pending Leaves
     - Status
     - Actions

3. Table row behavior:
   - Department name is clickable only if a detail drawer/page is implemented.
   - Status shown with existing badge style.
   - Manager shows avatar initials and name.
   - Actions:
     - Admin: edit, manage members, deactivate.
     - Manager/Employee: view only.

4. Loading state:
   - Skeleton rows matching table row height.
   - Do not cause layout shift after data loads.

5. Empty states:
   - No departments: show concise empty state and admin create action.
   - No search results: show reset filters action.

6. Error state:
   - Inline alert with retry button.
   - Do not throw full page runtime errors.

7. Mobile behavior:
   - Filters stack vertically.
   - Table becomes responsive card list or horizontally controlled layout without viewport overflow.
   - Actions remain accessible via icon buttons with labels/tooltips if existing pattern supports them.

Acceptance criteria:

1. Page matches spacing and visual density of Employees page.
2. No text clipping in buttons, filters, badges, or cards.
3. Admin and non-admin see appropriate controls.
4. No horizontal scroll at 375px.

### Phase 5: Create/Edit Department Modal

Goal: add department CRUD with a clean, accessible modal.

1. Reuse existing modal patterns from the app where possible.

2. Form fields:
   - Department Name
   - Description
   - Manager
   - Status

3. Field rules:
   - Name required.
   - Description optional.
   - Manager dropdown only shows active admin/manager users.
   - Status segmented/select control: active/inactive.

4. Form behavior:
   - Submit button shows loading state.
   - Disable submit while saving.
   - Show field-level errors.
   - Focus first invalid field on validation failure.
   - Escape/cancel closes only if no unsaved changes.

5. Edit behavior:
   - Pre-fill current data.
   - If renaming a department with employees, show helper copy:
     - "Employees currently assigned to this department will move to the new department name."
   - Keep copy short and calm.

6. Delete/deactivate behavior:
   - Use confirmation dialog.
   - If department has employees, action label should be `Deactivate`, not `Delete`.
   - Confirm copy should include affected employee count.

Acceptance criteria:

1. Modal is keyboard accessible.
2. Form errors are visible and understandable.
3. Destructive/deactivation actions are confirmed.
4. Saved changes update the list without a full page reload unless the app's current pattern prefers refetch.

### Phase 6: Manage Members Flow

Goal: let Admin assign employees to a department without making the Employees page unstable.

1. Add `Manage Members` action on department row.

2. UI pattern:
   - Drawer or modal with two panes:
     - Current members
     - Add employees selector
   - If current app modal patterns are simpler, use one modal with searchable multi-select.

3. Data behavior:
   - Fetch department members from `/api/departments/[id]/members`.
   - Fetch available employees from `/api/employees`.
   - Assigning members updates user `department` string.

4. Guardrails:
   - Confirm bulk changes before saving if more than 5 users change.
   - Avoid accidental reassignment by showing current department beside each selectable user.

5. Visual consistency:
   - Use the same avatar colors from `getAvatarColor`.
   - Use same employee status badge styles.
   - Keep row heights consistent.

Acceptance criteria:

1. Admin can assign and remove members.
2. Employees page reflects changed department after refetch.
3. Dashboard charts by department update naturally because they derive from users.
4. No employee data is lost.

### Phase 7: Replace Hardcoded Department Sources Carefully

Goal: remove duplicated department arrays only after the department API works.

1. Update Employees page filter.
   - Replace hardcoded departments array with departments from `/api/departments?status=active`.
   - Keep fallback hardcoded list if API fails, so the page does not become unusable.

2. Update employee create/edit form.
   - Use active departments from API.
   - If editing an employee whose department is inactive, show current inactive department as an option with label `(Inactive)`.

3. Update Register page only if product decision allows public/self-registration department selection.
   - Safer first step: keep current hardcoded options to avoid changing auth onboarding behavior.
   - Later step: fetch active departments.

4. Update Settings page department display.
   - Keep current user's department read-only or selectable depending on existing behavior.

Acceptance criteria:

1. Employees page still works if department API fails.
2. Existing employees with old department strings remain visible.
3. No route response shape changes for `/api/employees`.

### Phase 8: Notifications & Audit Prep Hooks

Goal: make Department Management ready for later Notification/Audit improvements without requiring them now.

1. Do not implement full Audit Log in this feature unless approved separately.

2. Add clear code locations where audit can later be inserted:
   - department create
   - department update
   - department deactivate
   - member assignment

3. Optional, only if current notification helper exists:
   - Notify newly assigned department manager.
   - Avoid broad employee notifications in the first version.

Acceptance criteria:

1. Department feature works without Audit Log.
2. Later Audit Log can be added without rewriting route logic.

### Phase 9: QA Plan

1. Static verification:
   - `npm run type-check`
   - `npm run build`
   - `npm run lint` if available and configured.

2. Admin browser tests:
   - Log in as `admin@worknest.com`.
   - Open Departments page.
   - Create department.
   - Edit name/description/manager/status.
   - Assign members.
   - Deactivate department.
   - Verify Employees filter includes expected departments.

3. Manager browser tests:
   - Log in as `manager@worknest.com`.
   - View Departments page.
   - Confirm create/edit/deactivate controls are hidden or disabled.
   - Confirm no unauthorized mutation succeeds through UI.

4. Employee browser tests:
   - Log in as `john@worknest.com`.
   - Confirm Departments page visibility according to final RBAC decision.
   - If visible, confirm read-only behavior.
   - If hidden, confirm route/API are forbidden.

5. API security tests:
   - No token -> 401.
   - Employee POST/PUT/DELETE -> 403.
   - Duplicate department name -> 400.
   - Invalid managerId -> 400.
   - Rename department -> employees update consistently.
   - Deactivate department with members -> soft-deactivate behavior only.

6. Regression tests:
   - Dashboard charts still render.
   - Employee list still loads and filters.
   - Employee profile still loads.
   - Leave, Tasks, Meetings, Calendar, Announcements still render.
   - Notification panel still opens and marks read.

7. UI quality checks:
   - 375px mobile viewport.
   - 768px tablet viewport.
   - 1440px desktop viewport.
   - No horizontal overflow.
   - No clipped labels/buttons.
   - Consistent row/card spacing.
   - Modal focus and keyboard navigation work.

## 9. Files Expected To Be Added

1. `app/departments/page.tsx`
2. `app/api/departments/route.ts`
3. `app/api/departments/[id]/route.ts`
4. `app/api/departments/[id]/members/route.ts`

## 10. Files Expected To Be Modified

1. `lib/types.ts`
2. `lib/constants.ts`
3. `lib/seed.ts`
4. `components/layout/Sidebar.tsx`
5. `components/layout/Header.tsx`
6. `app/employees/page.tsx`
7. `app/globals.css`

Optional depending on final implementation:

1. `app/register/page.tsx`
2. `app/settings/page.tsx`
3. `lib/api-utils.ts`

## 11. Explicit Non-Goals For This Feature

1. Do not build Organization Chart yet.
2. Do not build Audit Log yet.
3. Do not migrate all department strings to `departmentId` yet.
4. Do not change the public shape of existing employee APIs.
5. Do not add a database.
6. Do not add external dependencies.
7. Do not redesign the whole app.
8. Do not change the visual language of existing pages.

## 12. Approval Checkpoint

Recommended first implementation after approval:

1. Backend data model and department API.
2. Departments list page.
3. Create/edit/deactivate modal.
4. Manage members flow.
5. Carefully replace hardcoded department options in Employees page.
6. Full QA and regression pass.

## 13. Current Completion Status

Department Management implementation status: functionally implemented and smoke-tested.

Completed from the approved plan:

1. Backend data model and department API.
2. Departments list page.
3. Create/edit/deactivate modal.
4. Manage members flow.
5. Employees page department options integration.
6. Type-check, production build, API smoke test, and browser smoke test.

Remaining before considering the feature fully closed:

1. User manual review on the running dev server.
2. Any UI polish found during manual review.
3. Optional deeper regression pass across Dashboard, Employees, Tasks, Leave, Calendar, and Notifications.
4. Optional role-based manual checks for Manager and Employee accounts.

## 14. Next Recommended Action

Next immediate action: finish Department Management stabilization before starting a new feature.

Step-by-step:

1. Wait for manual review feedback from the running local app.
2. Fix any visual or functional issue found during review.
3. Re-run:
   - `npm run type-check`
   - `npm run build`
4. Do one focused regression pass:
   - Departments page
   - Employees page filter/form
   - Dashboard charts
   - Header/sidebar navigation
5. After Department Management is accepted, start the next P0 foundation feature: Audit Log.

Recommended next feature after acceptance: Audit Log.

Reason:

1. Department Management now introduces admin mutations, member assignment, rename, and deactivate actions.
2. Audit Log is the right foundation to track these changes before adding more workflow-heavy modules.
3. It improves operational safety without requiring a redesign or external service.

Audit Log should be planned before implementation and must not be started until Department Management is accepted.

# Department Management Plan Archive

Status: implemented, stabilized, and moved to maintain-only mode.

This file preserves the detailed Department Management strategy that used to live inside `docs/feature_priority_and_department_plan.md`. The root plan now links here instead of carrying the whole implementation archive.

## Outcome

Department Management is complete.

Implemented:

1. Department data model and status type.
2. Department constants and validation limits.
3. Department seed data.
4. Department API:
   - `GET /api/departments`
   - `POST /api/departments`
   - `GET /api/departments/[id]`
   - `PUT /api/departments/[id]`
   - `DELETE /api/departments/[id]`
   - `GET /api/departments/[id]/members`
   - `PUT /api/departments/[id]/members`
5. `/departments` page.
6. Search, status filter, refresh, stats, table, mobile cards, create/edit drawer, deactivate confirmation, and member management.
7. Admin-only mutation controls.
8. Employees page department filter/form integration with Department API fallback.
9. Sidebar and Header integration.

## Non-Breaking Strategy

The main constraint was preserving `User.department: string`.

Rules:

1. Do not rename `department` on `User`.
2. Do not change existing `/api/employees` response shape.
3. Do not remove or rename existing routes.
4. Do not remove existing `data-testid` values.
5. Do not break Dashboard, Calendar, Leave, Tasks, Notifications, or Employee Profile behavior.
6. Add Department APIs and UI first.
7. Replace hardcoded department options only after the Department API works.
8. Department rename updates employee `department` strings in a controlled backend operation.
9. Department deactivate preserves historical visibility.

## Backend Plan

### Data Model

Add `Department` and `DepartmentWithStats` to `lib/types.ts`.

Core fields:

```ts
id: string
name: string
description: string
managerId?: string
managerName?: string
status: 'active' | 'inactive'
createdAt: string
updatedAt: string
```

### Constants

Add to `lib/constants.ts`:

1. `COLLECTIONS.DEPARTMENTS`
2. `DEPARTMENT_STATUS`
3. `MAX_LENGTHS.DEPARTMENT_NAME`
4. `MAX_LENGTHS.DEPARTMENT_DESCRIPTION`

### Seed

Seed the canonical departments:

1. Management
2. Engineering
3. Design
4. Marketing
5. HR
6. Finance

### API Requirements

`GET /api/departments`

1. Auth required.
2. Supports `status`, `q`, and `includeStats`.
3. Returns active departments first.
4. Stats may include:
   - employee count
   - active employee count
   - open task count
   - pending leave count

`POST /api/departments`

1. Admin only.
2. Validates name, description, manager, status, and duplicate names.
3. Returns created department.

`GET /api/departments/[id]`

1. Auth required.
2. Returns department with stats and safe member preview.

`PUT /api/departments/[id]`

1. Admin only.
2. Whitelists `name`, `description`, `managerId`, and `status`.
3. If name changes, updates employees assigned to the old department name.

`DELETE /api/departments/[id]`

1. Admin only.
2. Soft deactivates the department.
3. Does not hard delete assigned employee history.

`GET /api/departments/[id]/members`

1. Auth required.
2. Returns safe employee objects assigned to the department.

`PUT /api/departments/[id]/members`

1. Admin only.
2. Accepts `{ userIds: string[] }`.
3. Reassigns selected users to the department.
4. Moves removed existing members to `Unassigned`.

## Frontend Plan

### Navigation

1. Add Departments to Sidebar.
2. Add Header title mapping for `/departments`.
3. Keep route additive.

### Page Layout

Route: `/departments`

Required UI:

1. Search input.
2. Status filter.
3. Refresh button.
4. Admin-only `New Department` button.
5. Stat cards:
   - Total Departments
   - Active Departments
   - Employees Assigned
   - Departments Without Manager
6. Desktop table:
   - Department
   - Manager
   - Employees
   - Open Tasks
   - Pending Leaves
   - Status
   - Actions
7. Mobile card list.
8. Create/edit drawer.
9. Deactivate confirmation modal.
10. Manage members drawer.

### UX Requirements

1. Match Employees page density and toolbar metrics.
2. Use existing button, input, badge, table, drawer, and modal patterns.
3. Keep destructive actions behind confirmation.
4. No nested cards.
5. No decorative gradients/orbs.
6. No horizontal overflow on mobile.
7. Skeleton loading must match Dashboard/Employees style.
8. Empty/fallback state must not flash during initial loading.

## Stabilization Completed

Manual review found and fixed:

1. Toolbar/search/filter alignment.
2. Skeleton loading mismatch.
3. Employee-count wording confusion.
4. Missing stat icons/hover parity.
5. Avatar sync across pages.

Related cross-page fixes were also completed:

1. Task Board dropdown stacking.
2. Task Board compact columns.
3. Leave table status/type readability and alignment.
4. Calendar event readability.
5. Settings menu/content alignment.
6. Visible UI/seed cleanup for unstable decorative characters.

## Verification

Completed:

1. `npm run type-check`
2. `npm run build`
3. API smoke:
   - login
   - list departments
   - create department
   - update department
   - assign members
   - deactivate department
4. Browser smoke:
   - Departments desktop render
   - mobile no horizontal overflow at 390px
   - admin controls visible
   - no console errors during smoke check

## Maintain-Only Notes

No new Department feature work is recommended before the next feature.

Regression Department flows when future changes touch:

1. shared UI controls
2. seed data
3. employee data
4. auth/RBAC
5. dashboard charts
6. task/leave department derivation

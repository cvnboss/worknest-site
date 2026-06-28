# WorkNest - Company Internal Portal

WorkNest is a company internal portal built as a realistic target application for automated E2E testing with Playwright and Page Object Model patterns.

The app currently includes role-based authentication, employee management, department management, leave approval, meeting room booking, task board workflows, announcements, notifications, calendar views, dashboard analytics, and user settings.

## Current Status Recap

- Department Management is implemented with list, create, edit, deactivate, member assignment, stats, active status, and API-backed employee department options.
- UI consistency has been tightened across Dashboard, Employees, Departments, Leave Management, Tasks, Calendar, and Settings.
- Employee avatars are deterministic flat SVG people avatars, synced across Employees, Departments, Tasks, Sidebar, and Settings.
- Task Board layout now uses compact fit-content Kanban lanes, stable horizontal columns, and status dropdown layering that stays above cards below it.
- Department loading states now match the shared dashboard/employee skeleton style.
- Leave Management includes aligned My Requests and Team Requests tables, larger readable badges, colored Type and Status values, and filters for status and type.
- Settings uses the same avatar source as Employees and aligns selected section content to the top line of the Settings menu card.
- Runtime seed data has been cleaned of emoji/decorative text so visible UI is more stable for screenshots and E2E assertions.
- Netlify deployment configuration is present in `netlify.toml` with Node 22 and `@netlify/plugin-nextjs`.

## Feature Overview

### Authentication and Authorization

- Register and login with JWT using `jose`.
- Role-based access control for Admin, Manager, and Employee.
- Protected application shell with token validation and current-user context.

### Dashboard and Analytics

- Summary cards for employees, leave, tasks, and departments.
- Chart.js dashboards for task distribution, leave trends, tasks by department, and headcount by department.
- Recent activity and upcoming meetings/widgets for quick review.

### Employee Directory and Profiles

- Employee list with search, department filter, role filter, create, edit, and delete flows.
- Employee profile pages at `/employees/[id]`.
- Profile metrics include task counts, completed tasks, in-progress work, and leave days.
- Avatars are deterministic SVG assets generated from employee identity data.

### Department Management

- Dedicated `/departments` page.
- Department stats: total departments, active departments, open tasks, and departments without manager.
- Department CRUD endpoints and member assignment endpoint.
- Safe fallback view if Department API data is unavailable.
- Employee forms and filters use active departments from the Department API with fallback options.

### Leave Management

- Employees can submit leave requests.
- Managers and Admins can review team requests.
- Status and type filters are available.
- Team request status/type values use readable, distinct colors.

### Meeting Room Booking

- Meeting room list with capacity, floor, amenities, and availability timeline.
- Booking drawer with date/time controls.
- Conflict prevention for overlapping bookings.

### Task Board

- Kanban board with To Do, In Progress, Review, and Done lanes.
- Create, edit, delete, assign, prioritize, tag, and update task status.
- Status dropdown stays interactive above adjacent cards.
- Columns remain compact when a lane has fewer tasks.

### Calendar

- Unified calendar for meetings, task deadlines, leave entries, and work anniversaries.
- Month grid built with CSS Grid.
- Day detail panel for selected date events.

### Announcements and Notifications

- Announcement feed with categories, pinned posts, comments, edit, and delete flows.
- Notification center from the header bell.
- Mark-as-read support through API.

### Settings

- Profile update form.
- Password update form.
- Notification preferences.
- Account summary.
- Admin system reset action for restoring seeded E2E data.

## Tech Stack

- Framework: Next.js 16.2.9 with App Router and Turbopack dev server.
- Runtime UI: React 19.2.7 and React DOM 19.2.7.
- Language: TypeScript 6.0.3.
- Styling: Vanilla CSS with shared design tokens in `app/globals.css`.
- Icons: `lucide-react`.
- Charts: Chart.js and `react-chartjs-2`.
- Auth: JWT with `jose`.
- Data store: In-memory application store in `lib/store.ts`.
- Deployment: Netlify with `@netlify/plugin-nextjs`.

## Demo Accounts

| Role | Email | Password | Notes |
| :--- | :--- | :--- | :--- |
| Admin | `admin@worknest.com` | `admin123` | Full system access, seed reset, employees, departments, leave approvals, meetings. |
| Manager | `manager@worknest.com` | `manager123` | Team management, task assignment, leave approval for team members. |
| Employee | `john@worknest.com` | `password123` | Personal profile, assigned tasks, leave requests, calendar, announcements. |

## Getting Started

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Default local URL:

```text
http://localhost:3000
```

Run type-check:

```bash
npm run type-check
```

Run production build:

```bash
npm run build
```

Start production server after build:

```bash
npm run start
```

## Seed and E2E Data Reset

WorkNest intentionally uses an in-memory store so E2E test runs can start from a known state.

Reset data through the protected seed endpoint:

```http
POST /api/seed
Authorization: Bearer <admin-token>
```

The same reset is available from Settings for Admin users through the "Reset Application State" action.

Important notes:

- The seed endpoint requires Admin authentication.
- Resetting seed data restores users, departments, leave requests, meeting rooms, meetings, tasks, announcements, and notifications.
- The reset action clears runtime changes and is intended for test setup or manual QA.

## Netlify Deployment

Netlify configuration is stored in `netlify.toml`.

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "22"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Deployment checklist:

- Use Node 22.
- Install dependencies with `npm install` or Netlify's default npm install step.
- Build command is `npm run build`.
- Publish directory is `.next`.
- Keep `@netlify/plugin-nextjs` installed.

## Project Structure

```text
worknest-site/
|-- app/
|   |-- api/
|   |-- announcements/
|   |-- calendar/
|   |-- departments/
|   |-- employees/
|   |-- leave/
|   |-- login/
|   |-- meetings/
|   |-- register/
|   |-- settings/
|   |-- tasks/
|   |-- globals.css
|   `-- layout.tsx
|-- components/
|   |-- layout/
|   `-- ui/
|-- lib/
|   |-- api-utils.ts
|   |-- auth-context.tsx
|   |-- auth.ts
|   |-- constants.ts
|   |-- seed.ts
|   |-- store.ts
|   |-- toast-context.tsx
|   |-- types.ts
|   `-- utils.ts
|-- docs/
|-- .agent/
|-- netlify.toml
|-- package.json
`-- tsconfig.json
```

## API Surface

There are currently 27 route handler files under `app/api`.

| Group | Endpoint | Methods | Purpose |
| :--- | :--- | :--- | :--- |
| Auth | `/api/auth/login` | POST | Login and issue token. |
| Auth | `/api/auth/register` | POST | Register a new user. |
| Auth | `/api/auth/me` | GET | Return current user from token. |
| Employees | `/api/employees` | GET, POST | List or create employees. |
| Employees | `/api/employees/[id]` | GET, PUT, DELETE | Read, update, or delete an employee. |
| Employees | `/api/employees/[id]/profile` | GET | Read employee profile data and metrics. |
| Departments | `/api/departments` | GET, POST | List or create departments. |
| Departments | `/api/departments/[id]` | GET, PUT, DELETE | Read, update, or deactivate a department. |
| Departments | `/api/departments/[id]/members` | PUT | Assign members to a department. |
| Leave | `/api/leave` | GET, POST | List or create leave requests. |
| Leave | `/api/leave/[id]` | GET, PUT, DELETE | Read, update, or delete leave requests. |
| Leave | `/api/leave/[id]/approve` | PUT | Approve or reject leave requests. |
| Meetings | `/api/meetings` | GET, POST | List or create meetings. |
| Meetings | `/api/meetings/[id]` | GET, PUT, DELETE | Read, update, or cancel meetings. |
| Meetings | `/api/meetings/rooms` | GET | List available meeting rooms. |
| Tasks | `/api/tasks` | GET, POST | List or create tasks. |
| Tasks | `/api/tasks/[id]` | GET, PUT, DELETE | Read, update, or delete tasks. |
| Announcements | `/api/announcements` | GET, POST | List or create announcements. |
| Announcements | `/api/announcements/[id]` | GET, PUT, DELETE | Read, update, or delete announcements. |
| Announcements | `/api/announcements/[id]/comments` | POST | Add comments to announcements. |
| Users | `/api/users/[id]` | GET, PUT | Read or update user settings. |
| Dashboard | `/api/dashboard/stats` | GET | Read dashboard summary stats. |
| Dashboard | `/api/dashboard/charts` | GET | Read dashboard chart data. |
| Notifications | `/api/notifications` | GET | Read user notifications. |
| Notifications | `/api/notifications/read` | PUT | Mark notifications as read. |
| Calendar | `/api/calendar` | GET | Read unified calendar events. |
| Seed | `/api/seed` | POST | Reset in-memory data to seeded state. |

## Security Notes

- API routes, except auth entry points, verify JWT tokens.
- Protected write routes whitelist accepted fields.
- Role escalation through user update APIs is blocked.
- Leave self-approval is blocked for Manager and Admin users.
- Seed reset requires Admin authentication.
- JWT errors return 401 while unexpected server errors return 500.

## UI Consistency Rules

The project keeps a strict UI consistency bar because it is used for visual and E2E testing.

- Search controls, filters, refresh buttons, and table toolbars should match across pages.
- Skeleton loading should use shared dashboard/employee patterns.
- Tables should keep header and cell alignment consistent.
- Cards should use the same hover elevation language across Dashboard, Departments, and Leave Management.
- Avatars should come from the shared employee avatar data, not page-local random colors.
- Visible text should avoid decorative symbols, emoji, and unstable Unicode separators.

## Verification Recap

Recent checks completed during stabilization:

- `npm run type-check`
- `npm run build`
- Browser smoke checks for Dashboard, Employees, Departments, Leave, Meetings, Calendar, Tasks, Announcements, and Settings.
- Browser alignment checks for Settings menu-to-content positioning.
- Browser interaction checks for Task Board status dropdown layering.

## Agent Workflow

Agent configuration lives in `.agent`.

```text
.agent/
|-- master_agent.md
|-- RULE.md
`-- sub_agents/
    |-- frontend-engineer/
    |-- backend-engineer/
    `-- qa-tester/
```

Use `.agent/RULE.md` and the relevant sub-agent rules before extending a module so new work stays consistent with the existing product surface.

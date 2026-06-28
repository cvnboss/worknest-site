# Audit Log Detailed Plan

Status: selected next feature, pending approval before implementation.

This plan was split out of `docs/feature_priority_and_department_plan.md` to keep the root priority plan short.

## Goal

Add an admin-only Audit Log module that records important write actions across the portal and displays them in a searchable, filterable table.

The feature should answer:

1. Who performed the action?
2. What action happened?
3. Which entity was affected?
4. When did it happen?
5. What changed at a high level?

## Why This Feature Is Next

Audit Log should come before another workflow-heavy module because WorkNest now includes more admin mutations after Department Management.

It adds traceability for:

1. department creation, updates, deactivation, and member assignment
2. leave approvals and rejections
3. employee changes
4. seed reset
5. later task, meeting, and announcement mutations

It is additive, admin-only, and compatible with the current in-memory store.

## Non-Goals

1. Do not log read-only API requests.
2. Do not log passwords, JWT tokens, raw request bodies, or sensitive secrets.
3. Do not build immutable database-grade persistence.
4. Do not add realtime streaming.
5. Do not add export reports yet.
6. Do not add external storage.
7. Do not add new npm dependencies.
8. Do not redesign the Admin area or Settings page.

## Data Model

Add these types to `lib/types.ts`.

```ts
export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'deactivate'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'reset';

export type AuditEntityType =
  | 'department'
  | 'department_members'
  | 'employee'
  | 'leave'
  | 'meeting'
  | 'task'
  | 'announcement'
  | 'notification'
  | 'system';

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: 'employee' | 'manager' | 'admin';
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  entityLabel?: string;
  summary: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
}
```

Add to `lib/constants.ts`:

```ts
AUDIT_LOGS: 'auditLogs'
```

## Audit Helper

Create:

```text
lib/audit-log.ts
```

Recommended helper:

```ts
recordAuditLog({
  actor,
  action,
  entityType,
  entityId,
  entityLabel,
  summary,
  metadata
})
```

Responsibilities:

1. Accept a safe payload.
2. Generate `id` and `createdAt`.
3. Store the entry in `COLLECTIONS.AUDIT_LOGS`.
4. Strip or reject unsafe metadata fields.
5. Never throw in a way that breaks a successful business action.

Rules:

1. Call only after the main mutation succeeds.
2. Keep summaries short and human-readable.
3. Metadata should contain small before/after hints, not full objects.
4. Skip failed mutation attempts in version 1 unless a security-sensitive case needs it.

## API Route

Add:

```text
app/api/audit-logs/route.ts
```

### GET /api/audit-logs

Requirements:

1. Admin only.
2. No public POST endpoint in version 1.
3. Sort newest first.
4. Supports pagination.

Query params:

1. `q`
2. `actorId`
3. `action`
4. `entityType`
5. `dateFrom`
6. `dateTo`
7. `page`
8. `limit`

Response shape:

```ts
{
  success: true,
  data: AuditLog[],
  pagination: {
    page,
    limit,
    total,
    totalPages
  }
}
```

## Initial Instrumentation Scope

### Phase A: Required

Instrument high-signal mutations first:

1. Department create.
2. Department update.
3. Department deactivate.
4. Department member assignment.
5. Leave approve/reject.
6. Employee create/update/delete.
7. Seed reset.

### Phase B: Optional After Phase A

Instrument broader workflow actions after Phase A is stable:

1. Task create/update/delete/status change.
2. Meeting create/update/cancel.
3. Announcement create/update/delete/comment.
4. Notification mark-as-read if useful.

Reason for phasing:

1. Avoid touching too many routes at once.
2. Reduce regression risk.
3. Keep the first QA pass focused and reliable.

## Frontend Page

Add:

```text
app/audit-logs/page.tsx
```

Visibility:

1. Admin only.
2. Sidebar item visible only for Admin.
3. Header title: `Audit Logs`.

Layout:

1. Toolbar:
   - Search input.
   - Action filter.
   - Entity filter.
   - Actor filter if employee data is easy to fetch.
   - Refresh button.
2. Summary cards:
   - Total logs.
   - Logs today.
   - Admin actions.
   - System resets.
3. Table:
   - Time
   - Actor
   - Action
   - Entity
   - Summary
   - Details action
4. Detail drawer:
   - Metadata shown as readable key/value rows.
   - Avoid raw JSON unless needed for debugging.

## UI Requirements

1. Match Employees/Departments toolbar height, spacing, and alignment.
2. Use shared table/card/drawer visual patterns.
3. Use readable badges for action and entity type.
4. Skeleton loading must match Dashboard/Employees pattern.
5. Empty state must not flash during initial load.
6. No emoji, decorative Unicode, mojibake, or unstable separators.
7. Mobile layout must use cards or controlled horizontal table behavior with no viewport overflow.
8. Verify visual bugs with browser metrics or screenshots, not only type-check/build.

## Security and Privacy

1. Only Admin can read audit logs.
2. No client-side route can write audit logs directly.
3. Do not store:
   - passwords
   - password hashes
   - JWT tokens
   - Authorization headers
   - full user objects
   - full request bodies
4. Use field whitelisting for metadata.
5. If actor cannot be resolved, use a safe system fallback only where appropriate.

Safe fallback:

```ts
actorId: 'system'
actorName: 'System'
```

## Testing Plan

### Static Checks

1. `npm run type-check`
2. `npm run build`

### API Checks

1. Admin can list audit logs.
2. Manager cannot list audit logs.
3. Employee cannot list audit logs.
4. Missing token returns 401.
5. Department create writes one log.
6. Department update writes one log.
7. Department deactivate writes one log.
8. Department member assignment writes one log.
9. Leave approve/reject writes one log.
10. Seed reset writes a system reset log after reset behavior is confirmed.

### Browser Checks

1. Admin sees Audit Logs nav item.
2. Manager and Employee do not see Audit Logs nav item.
3. Audit Logs page renders table and filters.
4. Search/filter controls match Employees/Departments toolbar metrics.
5. Loading skeleton matches shared pattern.
6. Detail drawer is readable and aligned.
7. Mobile viewport has no horizontal overflow.

## Files Expected To Be Added

1. `lib/audit-log.ts`
2. `app/api/audit-logs/route.ts`
3. `app/audit-logs/page.tsx`

## Files Expected To Be Modified

1. `lib/types.ts`
2. `lib/constants.ts`
3. `lib/seed.ts`
4. `components/layout/Sidebar.tsx`
5. `components/layout/Header.tsx`
6. `app/api/departments/route.ts`
7. `app/api/departments/[id]/route.ts`
8. `app/api/departments/[id]/members/route.ts`
9. `app/api/leave/[id]/approve/route.ts`
10. `app/api/employees/route.ts`
11. `app/api/employees/[id]/route.ts`
12. `app/api/seed/route.ts`
13. `app/globals.css`

Optional Phase B files:

1. `app/api/tasks/route.ts`
2. `app/api/tasks/[id]/route.ts`
3. `app/api/meetings/route.ts`
4. `app/api/meetings/[id]/route.ts`
5. `app/api/announcements/route.ts`
6. `app/api/announcements/[id]/route.ts`
7. `app/api/announcements/[id]/comments/route.ts`

## Implementation Order After Approval

1. Add audit types, constants, and helper.
2. Add empty audit collection seed/reset behavior.
3. Add `GET /api/audit-logs`.
4. Instrument Phase A routes.
5. Add Audit Logs page and nav item.
6. Run static checks and API smoke checks.
7. Run browser UI checks.
8. Decide whether to continue Phase B instrumentation.

Do not implement Audit Log until this plan is approved.

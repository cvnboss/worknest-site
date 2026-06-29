# Task Comments Detailed Plan

Status: recommended next feature, pending approval before implementation.

This plan keeps the Task Comments work isolated from the root priority index so future updates do not require loading the full planning history.

## Goal

Add a lightweight comment workflow to Tasks so employees, managers, and admins can discuss work directly inside the existing Kanban board.

The feature should answer:

1. What discussion belongs to this task?
2. Who wrote each comment?
3. When was it written?
4. Can the current user add, edit, or delete their own comment?
5. Can Admin users moderate comments when needed?

## Why This Feature Is Next

Task Comments is the best next feature after Audit Log because:

1. It extends an existing high-traffic module instead of adding a large new module.
2. Announcement comments already provide a local data and API pattern.
3. It gives Playwright E2E tests a useful nested create/read/delete workflow.
4. It does not require realtime infrastructure, external storage, new packages, or mobile responsiveness.
5. It should be small enough to implement without destabilizing Dashboard, Employees, Departments, Leave, Settings, or Audit Logs.

## Non-Goals

1. Do not add realtime chat or WebSocket updates.
2. Do not add file attachments.
3. Do not add mentions or notification delivery in the first pass.
4. Do not redesign the Task Board.
5. Do not change task status dropdown behavior or lane sizing.
6. Do not add markdown/rich text editor.
7. Do not implement mobile-specific behavior.

## Data Model

Add a task comment model to `lib/types.ts`.

Recommended shape:

```ts
export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  author: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}
```

Add collection key to `lib/constants.ts`:

```ts
TASK_COMMENTS: 'taskComments'
```

Seed a small stable set of comments in `lib/seed.ts`.

Rules:

1. Keep seeded comments realistic and short.
2. Avoid emoji, decorative symbols, and unstable punctuation.
3. Use existing seeded users and tasks.
4. Keep comment counts predictable for E2E assertions.

## API Routes

Add:

```text
app/api/tasks/[id]/comments/route.ts
```

### GET /api/tasks/[id]/comments

Requirements:

1. Authenticated users only.
2. Return comments for the task sorted oldest first.
3. Return 404 if the task does not exist.

Response shape:

```ts
{
  success: true,
  data: TaskComment[]
}
```

### POST /api/tasks/[id]/comments

Requirements:

1. Authenticated users only.
2. Validate content length and trim whitespace.
3. Return 400 for empty content.
4. Return the created comment.

Add if edit/delete stays low-risk:

```text
app/api/tasks/[id]/comments/[commentId]/route.ts
```

### PUT /api/tasks/[id]/comments/[commentId]

Rules:

1. Comment author or Admin only.
2. Validate content.
3. Update `updatedAt`.

### DELETE /api/tasks/[id]/comments/[commentId]

Rules:

1. Comment author or Admin only.
2. Remove the comment.

## Frontend Scope

Update:

```text
app/tasks/page.tsx
```

Required UI:

1. Show comment count on each task card using a small icon + number.
2. Add a task detail/comment panel or modal opened from the task card.
3. Show task title, current metadata, existing comments, and a compact add-comment form.
4. Use shared avatar data for comment authors.
5. Keep buttons, inputs, spacing, border radius, and empty/loading states aligned with Employees, Departments, Leave, and Audit Logs.

Do not:

1. Increase Kanban card height dramatically.
2. Break status dropdown stacking.
3. Add nested cards inside cards.
4. Add mobile-specific layout work.

## Audit Log Integration

Optional for first pass:

1. Log task comment create.
2. Log task comment delete.

Skip edit logging unless edit is implemented.

If implemented, metadata must stay compact and must not store full comment content.

## Sub-Agent Assignment

Use Master Agent coordination.

Recommended lanes:

1. Backend Engineer:
   - Types.
   - Collection constant.
   - Seed comments.
   - Task comment API routes.
   - Permission checks.
2. Frontend Engineer:
   - Task card comment count.
   - Detail/comment panel.
   - Form states.
   - Visual consistency.
3. QA Tester:
   - API smoke checks.
   - Desktop browser checks.
   - Regression check for Task status dropdown layering.

## Verification Checklist

Static:

1. `npm run type-check`
2. `npm run build`

API:

1. Anonymous comment list/create returns 401.
2. Authenticated user can list task comments.
3. Authenticated user can create a valid comment.
4. Empty comment returns 400.
5. Author can edit/delete if edit/delete is implemented.
6. Non-author cannot edit/delete unless Admin.
7. Admin can delete if moderation is implemented.

Desktop browser:

1. Task cards render comment counts without layout shift.
2. Opening a comment panel does not affect Kanban lane sizing.
3. Add-comment form aligns with existing input/button styling.
4. Empty comment state is quiet and consistent.
5. Status dropdown remains above adjacent cards after comment UI is added.

## Recommended Implementation Order

1. Confirm scope: create/list only, or create/list/edit/delete.
2. Add types and collection constant.
3. Add seed comments.
4. Add `GET` and `POST` comment routes.
5. Add edit/delete routes only if approved.
6. Add task card comment count.
7. Add task detail/comment panel.
8. Wire create comment flow.
9. Add optional audit instrumentation.
10. Run static, API, and desktop browser checks.
11. Update README after verification.

Do not implement Task Comments until this plan is approved.

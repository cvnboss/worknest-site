# Backend Engineer — Workflow

## Quy Trình Làm Việc

```
Phase 1: Infrastructure  → Tạo constants, api-utils, fix auth
Phase 2: Security         → Fix mass assignment, protect endpoints
Phase 3: Validation       → Input validation, error handling
Phase 4: Consistency      → Standardize response format
```

### Phase 1: Core Infrastructure
1. **Tạo `lib/constants.ts`**
   - Collection name constants: `COLLECTIONS = { USERS, LEAVES, MEETINGS, ROOMS, TASKS, ANNOUNCEMENTS, NOTIFICATIONS }`
   - Enum constants: `ROLES`, `LEAVE_TYPES`, `LEAVE_STATUS`, `TASK_PRIORITY`, `TASK_STATUS`
   - Validation constants: `MAX_LENGTHS`

2. **Tạo `lib/api-utils.ts`**
   - `withAuth(handler, options?)`: HOF loại bỏ auth boilerplate, hỗ trợ role-based access
   - `omitPassword(user)`: Thay thế pattern `const { password: _, ...rest }; void _;`
   - `createResponse(data, status?, message?)`: Standardize success response
   - `createErrorResponse(error, status)`: Standardize error response
   - `parsePageParams(url)`: Safe parseInt với NaN fallback
   - `pickFields(body, allowedFields)`: Whitelist fields cho PUT endpoints

3. **Fix `lib/auth.ts`**
   - Đọc JWT secret từ `process.env.JWT_SECRET` với fallback
   - Thêm comment cảnh báo về demo password hashing

4. **Tạo `.env.example`**

### Phase 2: Security Fixes
5. **Fix từng API route** (read → identify vulnerability → surgical fix):
   - `api/seed/route.ts`: Thêm admin-only auth check
   - `api/leave/[id]/route.ts` PUT: Whitelist fields `{type, startDate, endDate, reason}`
   - `api/leave/[id]/approve/route.ts`: Block self-approve
   - `api/employees/[id]/route.ts` PUT: Whitelist fields, block role escalation
   - `api/meetings/[id]/route.ts` PUT: Whitelist fields, protect organizer
   - `api/announcements/[id]/route.ts` PUT: Whitelist fields, protect author
   - `api/tasks/[id]/route.ts` PUT: Whitelist fields, validate assignee exists

### Phase 3: Error Handling & Validation
6. **Fix error handling across all routes**:
   - Phân biệt JWT errors vs business errors trong catch blocks
   - Thêm `console.error` logging
   - Fix `parseInt` NaN propagation trong paginated endpoints

7. **Add input validation**:
   - `api/leave/route.ts`: Validate date format, leave type enum
   - `api/tasks/route.ts`: Validate priority, status enums
   - `api/meetings/route.ts`: Validate time format

### Phase 4: Apply Infrastructure
8. Refactor routes to use `withAuth()` wrapper where beneficial
9. Use `COLLECTIONS` constants instead of magic strings
10. Report all changes made

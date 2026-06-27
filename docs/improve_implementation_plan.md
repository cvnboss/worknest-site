# WorkNest — Tổng Kiểm Tra & Nâng Cấp Toàn Diện

## Tổng Quan

Sau khi phân tích toàn bộ codebase WorkNest (10 trang, 24 API routes, 6 lib files, 5 components), chúng tôi phát hiện **20 bugs cụ thể**, **8 lỗ hổng bảo mật**, và hàng chục vấn đề về chất lượng code. Kế hoạch này phân công công việc cho **3 agent chuyên biệt** làm việc song song.

---

## Phát Hiện Chính Từ Audit

### 🔴 Critical Issues Found
| # | Loại | Vấn đề | File |
|---|------|--------|------|
| 1 | Security | Hardcoded JWT secret key | `lib/auth.ts:3` |
| 2 | Security | Custom non-cryptographic password hash | `lib/auth.ts:29-40` |
| 3 | Security | Seed endpoint không có auth — ai cũng có thể xóa toàn bộ data | `api/seed/route.ts` |
| 4 | Security | Mass assignment — user có thể tự approve leave, đổi role admin | Nhiều PUT routes |
| 5 | Bug | Leave PUT cho phép user tự đổi status thành approved | `api/leave/[id]/route.ts:37` |
| 6 | Bug | Employee role escalation — user tự nâng role admin | `api/employees/[id]/route.ts:45` |
| 7 | Bug | Meeting PUT không filter body — overwrite bất kỳ field | `api/meetings/[id]/route.ts:34` |
| 8 | Type | `StoreItem` dùng `[key: string]: any` — phá hủy type safety | `lib/store.ts:3` |

### 🟡 High Priority Issues
| # | Loại | Vấn đề |
|---|------|--------|
| 9 | Frontend | Hàng trăm inline styles thay vì CSS classes — không responsive |
| 10 | Frontend | 5 CSS class được dùng nhưng chưa được định nghĩa (`btn-loading`, `stagger-children`...) |
| 11 | Frontend | Accessibility: không keyboard nav, thiếu ARIA labels, không focus trap |
| 12 | Frontend | Shared comment state giữa các announcements |
| 13 | Backend | Catch-all trả 401 cho mọi error (kể cả lỗi parse JSON) |
| 14 | Backend | Auth boilerplate lặp lại trong tất cả 24 routes |
| 15 | Backend | Không validate input (date format, enum values, body size) |
| 16 | Code | `getAvatarColor()` copy-paste 4 files, `timeAgo()` copy-paste 3 files |
| 17 | Code | Monolithic pages (employees 1112 lines, dashboard 798 lines) |
| 18 | Frontend | Vietnamese error messages trong `tasks/page.tsx` (inconsistent với English) |

---

## Kiến Trúc Agent

```
┌─────────────────────────────────────────────────────────────┐
│                    🏗️ MANAGER AGENT                         │
│              Phối hợp, tổng hợp, kiểm duyệt                │
└──────────┬──────────────────┬──────────────────┬────────────┘
           │                  │                  │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │  Frontend   │   │  Backend    │   │  QA Tester  │
    │  Engineer   │   │  Engineer   │   │             │
    │             │   │             │   │  Kiểm tra   │
    │  UI/UX fix  │   │  API/Logic  │   │  code sau   │
    │  CSS clean  │   │  Security   │   │  khi FE+BE  │
    │  Component  │   │  Type safe  │   │  hoàn thành │
    │  refactor   │   │  Validate   │   │             │
    └─────────────┘   └─────────────┘   └─────────────┘
```

---

## Proposed Changes

### 🎨 Lane 1 — Frontend Engineer

#### Phase 1: Shared Utilities & CSS Foundation

##### [NEW] `lib/utils.ts`
- Extract `getAvatarColor()` (đang copy-paste trong 4 files)
- Extract `timeAgo()` (đang copy-paste trong 3 files)
- Extract `formatDate()`, priority/status style maps
- Cung cấp type-safe utilities cho toàn bộ frontend

##### [MODIFY] `app/globals.css`
- Thêm các CSS class bị thiếu: `btn-loading`, `stagger-children`, `required`, `card-header-title`
- Thêm shadow variables: `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-2xl`
- Thêm missing keyframes: `fadeInRight`, `scaleIn`
- Xóa ~150 dòng CSS classes không sử dụng (kanban-*, settings-section-*, page-header, etc.)
- Fix conflict giữa custom utility classes và Tailwind

#### Phase 2: Component Improvements

##### [MODIFY] `components/ui/CustomSelect.tsx`
- Xóa `dangerouslySetInnerHTML` — chuyển CSS vào globals.css
- Thêm keyboard navigation (Arrow keys, Enter, Escape)
- Thêm ARIA attributes (`aria-expanded`, `aria-haspopup`, `role="listbox"`)
- Thêm `'use client'` directive

##### [MODIFY] `components/layout/Header.tsx`
- Xóa non-functional search input (hoặc implement basic search)
- Chuyển inline styles sang CSS classes

##### [MODIFY] `components/layout/Sidebar.tsx`
- Persist collapsed state vào localStorage
- Xóa duplicated `getAvatarColor()` → import từ `lib/utils.ts`

##### [MODIFY] `components/layout/NotificationPanel.tsx`
- Xóa duplicated `timeAgo()` → import từ `lib/utils.ts`
- Fix click-outside conflict với bell button

#### Phase 3: Page-Level Bug Fixes

##### [MODIFY] `app/page.tsx` (Dashboard)
- Xóa `@ts-ignore` trên react-chartjs-2 import
- Xóa duplicated `timeAgo()` → import từ `lib/utils.ts`
- Fix loading skeleton responsive (4 columns → responsive grid)

##### [MODIFY] `app/tasks/page.tsx`
- Fix Vietnamese error messages → English (L230, L236)
- Xóa duplicated `getAvatarColor()` → import từ `lib/utils.ts`

##### [MODIFY] `app/announcements/page.tsx`
- Fix shared comment state bug — dùng `commentTexts: Record<string, string>` thay vì single state
- Thêm delete confirmation dialog
- Xóa duplicated `getAvatarColor()`, `timeAgo()` → import từ `lib/utils.ts`

##### [MODIFY] `app/employees/page.tsx`
- Fix wrong testid `stat-employees` trùng lặp (L264)
- Xóa duplicated `getAvatarColor()` → import từ `lib/utils.ts`

##### [MODIFY] `app/leave/page.tsx`
- Thêm delete confirmation dialog (hiện xóa ngay không hỏi)

##### [MODIFY] `app/login/page.tsx`
- Fix inverted password visibility icons (Eye/EyeOff đang ngược)

##### [MODIFY] `app/settings/page.tsx`
- Xóa duplicated `getAvatarColor()` → import từ `lib/utils.ts`

---

### ⚙️ Lane 2 — Backend Engineer

#### Phase 1: Core Infrastructure

##### [NEW] `lib/constants.ts`
- Collection name constants: `COLLECTIONS = { USERS: 'users', LEAVES: 'leaves', ... } as const`
- Role enums, status enums, priority enums
- Max length constants cho validation

##### [NEW] `lib/api-utils.ts`
- `withAuth(handler, options?)` wrapper — loại bỏ auth boilerplate lặp lại 24 lần
- `omitPassword(user)` utility — thay thế pattern `const { password: _, ...rest }; void _;`
- `createResponse(data, status)` — standardize response format
- `createErrorResponse(message, status)` — standardize error format
- `validateBody(body, requiredFields)` — basic validation helper
- `parsePageParams(url)` — safe parseInt với NaN check

##### [MODIFY] `lib/auth.ts`
- Đọc JWT secret từ `process.env.JWT_SECRET` (fallback cho demo mode)
- Thêm comment cảnh báo về demo-only password hashing

##### [NEW] `.env.example`
- Document required environment variables

#### Phase 2: Security Fixes (Critical)

##### [MODIFY] `app/api/seed/route.ts`
- Thêm admin-only authentication check

##### [MODIFY] `app/api/leave/[id]/route.ts`
- PUT: Whitelist updatable fields (chỉ cho phép `type`, `startDate`, `endDate`, `reason`)
- Block user tự đổi status

##### [MODIFY] `app/api/leave/[id]/approve/route.ts`
- Thêm check ngăn manager approve leave của chính mình

##### [MODIFY] `app/api/employees/[id]/route.ts`
- PUT: Whitelist updatable fields, block role escalation
- Fix redundant `await params`

##### [MODIFY] `app/api/meetings/[id]/route.ts`
- PUT: Whitelist updatable fields, protect `organizer`/`organizerName`

##### [MODIFY] `app/api/announcements/[id]/route.ts`
- PUT: Whitelist updatable fields, protect `author`/`authorName`

##### [MODIFY] `app/api/tasks/[id]/route.ts`
- PUT: Whitelist updatable fields, validate assignee exists

#### Phase 3: Error Handling & Validation

##### [MODIFY] Tất cả API routes (batch update)
- Phân biệt auth errors (401) vs business errors (400/404) vs server errors (500)
- Thêm `console.error` trong catch blocks
- Áp dụng `withAuth()` wrapper (loại bỏ boilerplate)
- Áp dụng `ensureSeeded()` 1 lần trong middleware thay vì 24 lần

##### [MODIFY] `app/api/leave/route.ts`
- Validate date format trước khi compare
- Validate enum values cho leave type

##### [MODIFY] `app/api/tasks/route.ts`
- Validate priority và status enum values

##### [MODIFY] `app/api/meetings/route.ts`
- Validate time format

##### [MODIFY] `app/api/employees/route.ts`
- Fix `parseInt` NaN propagation cho pagination

#### Phase 4: Consistency & Response Format

- Chuẩn hóa response format: `{ success, data?, error?, message?, pagination? }`
- Tất cả list endpoints dùng chung pattern paginated/non-paginated

---

### 🧪 Lane 3 — QA Tester

> **Timing**: QA Tester chạy **sau khi** Frontend + Backend hoàn thành, để kiểm tra code đã sửa.

#### Phase 1: Browser Smoke Test
- Khởi động dev server
- Mở trình duyệt, đăng nhập bằng tài khoản demo
- Kiểm tra lần lượt tất cả 10 trang render đúng, không console errors
- Chụp screenshots các trang chính

#### Phase 2: Functional Testing
- Test Login/Register flow
- Test CRUD operations trên Employees, Tasks, Leave, Meetings, Announcements
- Test phân quyền (Admin vs Manager vs Employee)
- Test Notification Center
- Test Calendar events
- Test Dashboard charts rendering

#### Phase 3: Security Verification
- Verify seed endpoint yêu cầu admin auth
- Verify leave PUT không cho phép self-approve
- Verify employee PUT không cho phép role escalation
- Verify mass assignment đã bị block trên tất cả PUT routes

#### Phase 4: Report & README Update
- Tổng hợp kết quả test
- Cập nhật README.md với kết quả kiểm tra

---

## Verification Plan

### Automated Tests
```bash
npm run type-check    # TypeScript compilation check
npm run build         # Next.js production build
npm run lint          # ESLint check
```

### Manual Verification
- Browser smoke test trên tất cả 10 trang
- Test đăng nhập 3 roles (Admin, Manager, Employee)
- Verify security fixes bằng cách thử các attack vectors cũ
- Confirm no console errors

---

## Open Questions

> [!IMPORTANT]
> **Scope Confirmation**: Kế hoạch này tập trung vào **bug fixes, security patches, code quality improvements** mà KHÔNG redesign UI hay thêm tính năng mới. Bạn có muốn tôi thêm phần nào khác không?

> [!WARNING]
> **Breaking Changes**: Một số API response format sẽ thay đổi (chuẩn hóa response shape). Nếu có client/test nào đang dùng format cũ, cần cập nhật. Bạn có đồng ý không?

> [!NOTE]
> **Estimated Scope**: ~40 files sẽ được modify/create. Frontend Engineer và Backend Engineer sẽ làm việc song song trên các file khác nhau (không conflict). QA Tester sẽ chạy sau cùng.

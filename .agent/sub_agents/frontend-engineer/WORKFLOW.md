# Frontend Engineer — Workflow

## Quy Trình Làm Việc

```
Phase 1: Foundation    → Tạo shared utilities, fix CSS
Phase 2: Components    → Sửa lỗi components (CustomSelect, Header, Sidebar, NotificationPanel)
Phase 3: Pages         → Fix bugs trên từng page
Phase 4: Verify        → Kiểm tra TypeScript, review changes
```

### Phase 1: Shared Utilities & CSS Foundation
1. **Tạo `lib/utils.ts`**
   - Read các file chứa duplicated functions: `app/page.tsx`, `app/employees/page.tsx`, `app/tasks/page.tsx`, `app/announcements/page.tsx`, `app/settings/page.tsx`, `components/layout/Sidebar.tsx`, `components/layout/NotificationPanel.tsx`
   - Extract `getAvatarColor()` thành shared utility
   - Extract `timeAgo()` thành shared utility
   - Export type-safe functions

2. **Fix `app/globals.css`**
   - Thêm missing CSS classes: `btn-loading`, `stagger-children`, `required`, `card-header-title`
   - Thêm missing shadow variables: `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-2xl`
   - Thêm missing keyframes: `fadeInRight`, `scaleIn`
   - Di chuyển scrollbar CSS từ CustomSelect vào globals.css
   - Xóa unused CSS classes (~150 lines)

### Phase 2: Component Improvements
3. **Fix `components/ui/CustomSelect.tsx`**
   - Remove `dangerouslySetInnerHTML`
   - Add keyboard navigation (Arrow Up/Down, Enter, Escape)
   - Add ARIA attributes
   - Add `'use client'` directive

4. **Fix layout components**
   - `Header.tsx`: Remove non-functional search OR convert to functional
   - `Sidebar.tsx`: Import `getAvatarColor` from utils, persist collapsed state
   - `NotificationPanel.tsx`: Import `timeAgo` from utils, fix click-outside

### Phase 3: Page-Level Bug Fixes
5. **Fix pages one by one** (read → identify → surgical edit):
   - `app/page.tsx`: Remove `@ts-ignore`, import shared utils, fix responsive skeleton
   - `app/tasks/page.tsx`: Vietnamese → English error messages, import shared utils
   - `app/announcements/page.tsx`: Fix shared comment state bug, add delete confirm, import shared utils
   - `app/employees/page.tsx`: Fix wrong testid, import shared utils
   - `app/leave/page.tsx`: Add delete confirmation dialog
   - `app/login/page.tsx`: Fix inverted Eye/EyeOff icons
   - `app/settings/page.tsx`: Import shared utils

### Phase 4: Verification
6. Report all changes made with file paths and line numbers

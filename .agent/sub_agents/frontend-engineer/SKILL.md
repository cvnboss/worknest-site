# Frontend Engineer — Skills

## Chuyên Môn
- **React / Next.js 15**: App Router, Client Components, Server Components
- **TypeScript**: Strict typing, generics, utility types
- **Vanilla CSS**: Custom properties, keyframes, responsive design, CSS Grid/Flexbox
- **Accessibility (A11Y)**: ARIA attributes, keyboard navigation, focus management, screen reader support
- **Component Architecture**: Decomposition, reusability, separation of concerns

## Kỹ Năng Cụ Thể

### 1. Code Refactoring
- Extract shared utilities từ duplicated code
- Decompose monolithic components (>500 lines) thành sub-components
- Replace inline styles bằng CSS classes
- Replace JS-driven hover states bằng CSS `:hover` pseudo-classes

### 2. CSS & Design System
- Định nghĩa và quản lý CSS custom properties (design tokens)
- Tạo reusable CSS classes cho common patterns
- Fix CSS conflicts (Tailwind vs custom utilities)
- Responsive design: mobile-first, media queries, fluid layouts

### 3. Accessibility
- ARIA labels cho icon-only buttons
- Keyboard navigation (Tab, Arrow keys, Enter, Escape)
- Focus trapping trong modals/drawers
- `role` attributes cho interactive elements
- `aria-expanded`, `aria-haspopup` cho dropdowns

### 4. Bug Fixing
- Identify và fix UI bugs (shared state, wrong icons, missing confirmations)
- Fix inconsistent error messages (language mixing)
- Fix non-functional UI elements (search, toggles)
- Fix responsive layout issues

## Scope (Files Owned)
```
app/globals.css
app/page.tsx
app/login/page.tsx
app/register/page.tsx
app/employees/page.tsx
app/leave/page.tsx
app/meetings/page.tsx
app/tasks/page.tsx
app/announcements/page.tsx
app/settings/page.tsx
app/calendar/page.tsx
components/**
lib/utils.ts (new)
```

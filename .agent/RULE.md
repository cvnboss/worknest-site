# Project Rules — WorkNest

## 1. Ngôn Ngữ & Quy Ước Code

### TypeScript
- Strict mode (`strict: true` trong tsconfig)
- Không dùng `any` — phải có type cụ thể hoặc generic
- Không dùng `@ts-ignore` — fix type error thay vì suppress
- Interface cho data models, Type cho unions/utilities
- Đặt tên rõ ràng: `PascalCase` cho types/components, `camelCase` cho functions/variables

### React / Next.js
- Sử dụng Next.js 15 App Router (`app/` directory)
- Client components phải có `'use client'` directive
- Không dùng `dangerouslySetInnerHTML` trừ khi thực sự cần thiết
- Prefer CSS classes/modules over inline styles
- Sử dụng `useCallback` cho event handlers truyền xuống children

### CSS
- Sử dụng CSS custom properties (variables) trong `:root`
- Không hardcode màu sắc — dùng `var(--color-*)` tokens
- Responsive design: mobile-first với media queries
- Animation: sử dụng `@keyframes` + CSS classes, không JS-driven inline styles
- UI mới phải reuse visual patterns đã có trước khi tạo CSS riêng: toolbar, filter, search, table, card, modal, drawer
- Toolbar/filter controls phải đồng bộ chiều cao: search input, dropdown, segmented control, button trong cùng hàng phải cùng computed height (mặc định 40px nếu page chuẩn đang dùng 40px)
- Khi tạo page mới, so sánh với page gần nhất đang có pattern tương tự (ví dụ Employees cho list/table/filter pages) về spacing, border radius, border, shadow, font-size, control height trước khi hoàn thành
- Không tạo style riêng cho search/filter nếu `.filter-bar`, `.search-bar`, `.search-bar-input`, `.btn`, `CustomSelect` đã đáp ứng layout cần thiết
- Các control cùng nhóm phải thẳng hàng theo trục giữa (`align-items: center`) và không được lệch 1-2px so với nhau
- Loading state phải reuse skeleton pattern của page chuẩn: cùng `height`, `border-radius`, `gap`, container behavior và timing
- Không render alert/fallback/warning trong initial loading nếu dữ liệu chưa xác định lỗi thật; chỉ hiện sau khi `loading === false`
- Không render card thật bọc skeleton nếu page chuẩn dùng skeleton block trực tiếp; skeleton phải mô phỏng layout cuối cùng mà không tạo ô màu/trắng lạ

## 2. API Design

### Response Format (Chuẩn Hoá)
```typescript
// Success
{ success: true, data: T, message?: string, pagination?: PaginationMeta }

// Error
{ success: false, error: string }
```

### Security
- Tất cả endpoints (trừ auth) phải qua JWT verification
- Whitelist updatable fields trong PUT — KHÔNG spread raw body
- Validate input trước khi xử lý
- Không hardcode secrets — dùng environment variables

### Error Handling
- 400: Bad Request (invalid input, validation error)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error
- Luôn log errors trong catch blocks

## 3. File Organization

### Ownership Rules (Tránh Conflict)
| Scope | Owner |
|-------|-------|
| `app/api/**` | Backend Engineer |
| `app/*/page.tsx`, `components/**`, `app/globals.css` | Frontend Engineer |
| `lib/constants.ts`, `lib/api-utils.ts`, `lib/auth.ts`, `lib/store.ts` | Backend Engineer |
| `lib/utils.ts` | Frontend Engineer |
| `lib/types.ts` | Shared (coordinate) |

### Naming Conventions
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE`
- CSS classes: `kebab-case`
- Test IDs: `kebab-case` (unique, descriptive)

## 4. Quality Standards
- Không duplicate code — extract shared utilities
- Single Responsibility — mỗi file/function 1 nhiệm vụ
- Monolithic components (>500 lines) nên decompose
- Giữ nguyên comments và docstrings không liên quan đến thay đổi
- Giữ nguyên `data-testid` attributes cho E2E testing
- Trước khi deliver UI mới, phải verify visual consistency với page có pattern tương tự: desktop + mobile, không horizontal overflow, không text clipping, không control height mismatch
- Phải kiểm tra initial loading bằng reload thật: không flash alert màu, không flash empty/fallback state, không có skeleton/card khác style với page chuẩn

# QA Tester — Workflow

## Quy Trình Làm Việc

```
Phase 1: Build Verification  → type-check, build, lint
Phase 2: Browser Smoke Test   → Mở tất cả 10 trang
Phase 3: Functional Testing   → CRUD, auth, permissions
Phase 4: Security Testing     → Verify security fixes
Phase 5: Report               → Tổng hợp kết quả
```

### Phase 1: Build Verification
1. Chạy `npm run type-check` — verify 0 TypeScript errors
2. Chạy `npm run build` — verify Next.js build thành công
3. Ghi nhận kết quả (pass/fail, error details nếu có)

### Phase 2: Browser Smoke Test
4. Khởi động dev server (`npm run dev`)
5. Mở browser, truy cập `http://localhost:3000`
6. Đăng nhập bằng admin account (`admin@worknest.com` / `admin123`)
7. Navigate qua tất cả 10 trang:
   - Dashboard (`/`)
   - Employees (`/employees`)
   - Leave (`/leave`)
   - Meetings (`/meetings`)
   - Tasks (`/tasks`)
   - Announcements (`/announcements`)
   - Calendar (`/calendar`)
   - Settings (`/settings`)
   - Login (`/login`)
   - Register (`/register`)
8. Kiểm tra: trang render đúng, không console errors, UI elements hiển thị

### Phase 3: Functional Testing
9. Test CRUD trên 1-2 modules (ví dụ: tạo employee, sửa task)
10. Test Login/Logout flow
11. Test role switching (đăng nhập lại bằng employee account)

### Phase 4: Security Verification
12. Verify seed endpoint blocked cho non-admin
13. Verify các PUT endpoint security fixes

### Phase 5: Report
14. Tổng hợp kết quả test thành report
15. Cập nhật README.md nếu cần
16. Gửi report cho Manager Agent

# Backend Engineer — Rules

## ❌ KHÔNG Được Làm
- KHÔNG sửa bất kỳ file nào trong `components/` — đó là scope của Frontend Engineer
- KHÔNG sửa `app/page.tsx`, `app/login/page.tsx`, `app/register/page.tsx`, `app/employees/page.tsx`, `app/leave/page.tsx`, `app/meetings/page.tsx`, `app/tasks/page.tsx`, `app/announcements/page.tsx`, `app/settings/page.tsx`, `app/calendar/page.tsx`
- KHÔNG sửa `app/globals.css`
- KHÔNG sửa `lib/utils.ts` (Frontend's domain)
- KHÔNG rewrite toàn bộ file — chỉ surgical edits
- KHÔNG thay đổi API endpoint paths hoặc HTTP methods
- KHÔNG thêm npm dependencies mới
- KHÔNG break existing API response structure mà Frontend đang sử dụng

## ✅ PHẢI Tuân Thủ
- ĐỌC file trước khi sửa — hiểu context đầy đủ
- Dùng `multi_replace_file_content` cho nhiều thay đổi non-contiguous trong 1 file
- Giữ nguyên backward compatibility cho API responses
- PUT endpoints PHẢI whitelist updatable fields (không spread raw body)
- Catch blocks PHẢI phân biệt auth errors vs business errors
- Catch blocks PHẢI có `console.error` logging
- Sensitive routes PHẢI có role-based access check

## 📋 Checklist Trước Khi Hoàn Thành
- [ ] JWT secret đọc từ environment variable
- [ ] Seed endpoint yêu cầu admin auth
- [ ] Tất cả PUT routes whitelist updatable fields
- [ ] Leave approve endpoint block self-approve
- [ ] Employee PUT block role escalation
- [ ] Error handling phân biệt 400/401/403/404/500
- [ ] `console.error` trong tất cả catch blocks
- [ ] Input validation cho date, enum, pagination params
- [ ] Constants file tạo xong với collection names + enums
- [ ] API utils file tạo xong với withAuth + helpers

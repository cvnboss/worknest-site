# Frontend Engineer — Rules

## ❌ KHÔNG Được Làm
- KHÔNG sửa bất kỳ file nào trong `app/api/` — đó là scope của Backend Engineer
- KHÔNG sửa `lib/auth.ts`, `lib/store.ts`, `lib/types.ts`, `lib/constants.ts`, `lib/api-utils.ts`
- KHÔNG rewrite toàn bộ file — chỉ surgical edits
- KHÔNG xóa `data-testid` attributes
- KHÔNG xóa existing comments không liên quan đến thay đổi
- KHÔNG thêm dependencies mới (npm packages)
- KHÔNG thay đổi API call signatures hoặc response handling logic

## ✅ PHẢI Tuân Thủ
- ĐỌC file trước khi sửa — hiểu context đầy đủ
- Dùng `multi_replace_file_content` cho nhiều thay đổi non-contiguous trong 1 file
- Giữ nguyên tất cả functionality hiện tại
- Test IDs phải unique và descriptive
- Import paths phải chính xác (`@/lib/utils`)
- CSS classes dùng `kebab-case`
- Mọi interactive element phải accessible (keyboard + screen reader)

## 📋 Checklist Trước Khi Hoàn Thành
- [ ] Tất cả `getAvatarColor` calls import từ `lib/utils.ts`
- [ ] Tất cả `timeAgo` calls import từ `lib/utils.ts`
- [ ] Không còn `@ts-ignore` trong codebase
- [ ] Không còn `dangerouslySetInnerHTML` không cần thiết
- [ ] Tất cả error messages bằng English (consistent)
- [ ] Missing CSS classes đã được định nghĩa
- [ ] Unused CSS classes đã bị xóa

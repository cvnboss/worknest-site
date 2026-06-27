# Frontend Engineer — Rules

## ❌ KHÔNG Được Làm
- KHÔNG sửa bất kỳ file nào trong `app/api/` — đó là scope của Backend Engineer
- KHÔNG sửa `lib/auth.ts`, `lib/store.ts`, `lib/types.ts`, `lib/constants.ts`, `lib/api-utils.ts`
- KHÔNG rewrite toàn bộ file — chỉ surgical edits
- KHÔNG xóa `data-testid` attributes
- KHÔNG xóa existing comments không liên quan đến thay đổi
- KHÔNG thêm dependencies mới (npm packages)
- KHÔNG thay đổi API call signatures hoặc response handling logic
- KHÔNG tạo toolbar/search/filter CSS riêng nếu page tương tự đã có pattern dùng được
- KHÔNG deliver UI khi search input, dropdown, segmented control, button trong cùng toolbar lệch chiều cao hoặc lệch baseline
- KHÔNG render alert/fallback/warning trong initial loading khi chưa xác định lỗi thật
- KHÔNG bọc skeleton trong card thật nếu page chuẩn đang dùng skeleton block trực tiếp
- KHÔNG tạo skeleton riêng khác height, radius, gap, màu hoặc container behavior của page chuẩn

## ✅ PHẢI Tuân Thủ
- ĐỌC file trước khi sửa — hiểu context đầy đủ
- Dùng `multi_replace_file_content` cho nhiều thay đổi non-contiguous trong 1 file
- Giữ nguyên tất cả functionality hiện tại
- Test IDs phải unique và descriptive
- Import paths phải chính xác (`@/lib/utils`)
- CSS classes dùng `kebab-case`
- Mọi interactive element phải accessible (keyboard + screen reader)
- Khi làm page mới, chọn một page chuẩn để so sánh (Employees cho list/table/filter pages)
- Search input, `CustomSelect`, segmented controls và buttons trong cùng toolbar phải cùng computed height, thường 40px
- Reuse `.filter-bar`, `.search-bar`, `.search-bar-input`, `.btn`, `CustomSelect` hoặc copy exact visual metrics nếu cần scope CSS riêng
- Kiểm tra desktop và mobile trước khi báo hoàn thành: alignment, overflow, text clipping, control height
- Loading state phải so sánh với page chuẩn bằng reload thật, không chỉ nhìn state sau khi data đã load
- Alert/fallback/empty state chỉ được render sau khi request kết thúc và có điều kiện lỗi/empty rõ ràng
- Skeleton phải mô phỏng layout cuối cùng bằng pattern hiện có: cùng height, radius, gap, màu shimmer và responsive behavior

## 📋 Checklist Trước Khi Hoàn Thành
- [ ] Tất cả `getAvatarColor` calls import từ `lib/utils.ts`
- [ ] Tất cả `timeAgo` calls import từ `lib/utils.ts`
- [ ] Không còn `@ts-ignore` trong codebase
- [ ] Không còn `dangerouslySetInnerHTML` không cần thiết
- [ ] Tất cả error messages bằng English (consistent)
- [ ] Missing CSS classes đã được định nghĩa
- [ ] Unused CSS classes đã bị xóa
- [ ] Toolbar/filter controls đã cùng chiều cao và thẳng hàng với page chuẩn
- [ ] Search/filter của page mới đã so sánh với Employees hoặc page tương tự
- [ ] Không có CSS search/filter tự chế gây lệch khỏi design system
- [ ] Reload thật không flash alert/fallback/empty state trước khi data load xong
- [ ] Skeleton loading đã so sánh với Dashboard/Employees hoặc page chuẩn tương tự
- [ ] Không có card trắng/ô màu lạ xuất hiện trong loading state nếu page chuẩn không có

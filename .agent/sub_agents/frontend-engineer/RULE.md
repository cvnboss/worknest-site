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
- KHÔNG scroll in-page menu theo top của menu item nếu yêu cầu là content nằm cùng đường với menu/sidebar container. Luôn xác định mốc align rõ ràng: menu card top, menu item top, hay viewport top.
- KHÔNG dùng `window.scrollTo` cho page nằm trong AppShell scroll container nếu content thật sự scroll bằng parent element.
- KHÔNG dùng fixed `min-height` lớn cho Kanban/list columns khiến lane ít card có nền trống dôi ra.
- KHÔNG để dropdown/menu trong card bị card bên dưới che. Parent/card/dropdown phải có stacking và overflow strategy rõ ràng.
- KHÔNG random avatar hoặc tạo avatar fallback riêng theo từng page. Avatar phải đồng bộ từ shared user/employee data.
- KHÔNG đưa emoji, ký tự trang trí, mojibake hoặc Unicode separator không cần thiết vào visible UI, seed data, toast, README.
- KHÔNG báo đã verify visual bug nếu chỉ chạy type-check/build mà chưa kiểm browser hoặc DOM metric.

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
- In-page sidebar/menu như Settings: khi click item, section active phải align với đúng mốc được yêu cầu. Nếu yêu cầu giống đường kẻ top của menu card, đo `section.getBoundingClientRect().top - menuCard.getBoundingClientRect().top` và giữ sai số visual nhỏ (thường <= 8px).
- Nếu page dùng AppShell hoặc vùng scroll nội bộ, tìm scroll parent bằng computed `overflow-y` rồi scroll parent đó, không giả định `window` là scroll target.
- Kanban board: columns phải `fit-content` theo cards, chỉ empty lane có placeholder gọn; nhiều lane nên giữ hàng ngang ổn định và dùng horizontal scroll khi thiếu width.
- Dropdown trong card/list: nâng z-index của card đang mở, z-index dropdown cao hơn card, parent không clip dropdown; verify bằng `elementFromPoint` trên vùng dropdown.
- Tables: header và cell cùng cột phải cùng alignment. Badge/status text không được căn giữa nếu header/các cột bên cạnh đang left-align.
- Calendar/event labels và table badges phải đủ đọc, không giảm font-size xuống mức khó đọc để né overflow.
- Avatar: dùng `user.avatar`/employee avatar shared; fallback chỉ dùng shared utility. Avatar phải nhất quán giữa Employees, Departments, Tasks, Sidebar, Settings.
- Sau khi sửa seed data visible, reset seed runtime hoặc restart server trước browser verify.
- Visual bug phải được verify bằng browser: screenshot hoặc DOM metric cụ thể, không chỉ type-check/build.

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
- [ ] In-page menu/sidebar alignment đã đo đúng mốc yêu cầu, đặc biệt Settings content top với menu card top
- [ ] Kanban columns không có nền trống dôi bất thường khi ít card
- [ ] Dropdown/menu trong card đã verify không bị che bởi item bên dưới bằng browser
- [ ] Table header/cell alignment đã kiểm từng cột có badge/status/action
- [ ] Avatar đồng bộ với shared data trên mọi page liên quan, không random fallback theo page
- [ ] Visible UI/seed/README không có emoji, ký tự trang trí, mojibake hoặc Unicode separator không cần thiết
- [ ] Sau khi seed thay đổi, runtime data đã được reset trước khi browser verify
- [ ] Visual fix có browser metric/screenshot cụ thể kèm kết quả

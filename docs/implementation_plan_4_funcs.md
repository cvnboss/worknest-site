# Triển khai 4 Chức năng Mới — WorkNest Portal

Triển khai 4 chức năng ưu tiên cao nhất từ feature_proposals.md:
1. **Employee Profile Page** — Trang hồ sơ chi tiết cho từng nhân viên
2. **Dashboard Charts** — Biểu đồ thống kê trực quan trên Dashboard
3. **Notification Center** — Trung tâm thông báo với dropdown từ nút chuông
4. **Unified Calendar** — Lịch tổng hợp tất cả sự kiện

## User Review Required

> [!IMPORTANT]
> **Thứ tự triển khai đề xuất:** Employee Profile → Dashboard Charts → Notification Center → Unified Calendar. Lý do: Employee Profile là nền tảng dữ liệu cho các tính năng khác; Dashboard Charts đơn giản nhất; Notification Center tận dụng nút chuông có sẵn; Calendar phức tạp nhất nên làm sau cùng.

> [!WARNING]
> **Thư viện Chart.js** sẽ được cài thêm qua npm cho Dashboard Charts. Không có thư viện bên ngoài nào khác — Unified Calendar sẽ được xây dựng hoàn toàn bằng CSS Grid + vanilla code để giữ bundle size nhỏ.

## Open Questions

> [!IMPORTANT]
> 1. **Employee Profile**: Khi click vào tên nhân viên từ bảng Employees, có muốn mở trang profile riêng `/employees/[id]` hay mở dạng modal/drawer?  
>    → **Đề xuất**: Trang riêng `/employees/[id]` để có URL riêng, dễ chia sẻ link.
>
> 2. **Notification Center**: Hiển thị thông báo dạng dropdown panel từ nút chuông, hay tạo thêm trang `/notifications` riêng?  
>    → **Đề xuất**: Dropdown panel từ nút chuông (UX tốt hơn, không cần rời trang) + badge đếm số chưa đọc.
>
> 3. **Calendar**: Có cần view theo tuần không, hay chỉ cần tháng + ngày?  
>    → **Đề xuất**: Tháng (mặc định) + Ngày (khi click vào ô ngày). View tuần có thể bổ sung sau.

---

## Proposed Changes

### 1. Employee Profile Page

Trang hồ sơ chi tiết cho mỗi nhân viên, hiển thị: thông tin cá nhân, lịch sử nghỉ phép, task đang làm, hoạt động gần đây.

---

#### [NEW] [route.ts](file:///c:/Users/phatdv7559/Desktop/project-site/app/api/employees/[id]/profile/route.ts)

API endpoint trả về dữ liệu tổng hợp cho profile page:
- Thông tin nhân viên (từ collection `users`, loại bỏ password)
- Lịch sử nghỉ phép (từ collection `leaves`, filter theo `userId`)
- Task được giao (từ collection `tasks`, filter theo `assignee`)
- Thống kê tổng quan: tổng task, task hoàn thành, ngày nghỉ đã dùng

```typescript
// Response shape:
{
  employee: Employee,
  leaveHistory: LeaveRequest[],
  tasks: Task[],
  stats: {
    totalTasks: number,
    completedTasks: number,
    inProgressTasks: number,
    leaveDaysUsed: number,
    leaveDaysPending: number
  }
}
```

#### [NEW] [page.tsx](file:///c:/Users/phatdv7559/Desktop/project-site/app/employees/[id]/page.tsx)

Trang profile với layout:

| Section | Mô tả |
|---------|-------|
| **Profile Header** | Avatar lớn, tên, chức vụ, phòng ban, badge role, trạng thái active/inactive |
| **Info Cards** | Grid 2 cột: Email, Phone, Join Date, Department, Position |
| **Stats Row** | 4 stat cards nhỏ: Total Tasks, Completed, In Progress, Leave Days Used |
| **Leave History** | Bảng dữ liệu hiển thị lịch sử nghỉ phép (type, duration, status, badge màu) |
| **Assigned Tasks** | Danh sách task đang được giao, với priority badge và status |

#### [MODIFY] [page.tsx](file:///c:/Users/phatdv7559/Desktop/project-site/app/employees/page.tsx)

- Tên nhân viên trong bảng trở thành link click được, điều hướng tới `/employees/[id]`
- Thêm `data-testid` cho link profile

#### [MODIFY] [Sidebar.tsx](file:///c:/Users/phatdv7559/Desktop/project-site/components/layout/Sidebar.tsx)

- Không cần thêm nav item mới (profile được truy cập qua Employees page)

#### [MODIFY] [Header.tsx](file:///c:/Users/phatdv7559/Desktop/project-site/components/layout/Header.tsx)

- Thêm `'/employees/[id]': 'Employee Profile'` vào `pageTitles` map (dùng dynamic matching)

---

### 2. Dashboard Charts & Analytics

Thêm section biểu đồ trực quan vào Dashboard, hiển thị xu hướng và phân bổ dữ liệu.

---

#### [NEW] [route.ts](file:///c:/Users/phatdv7559/Desktop/project-site/app/api/dashboard/charts/route.ts)

API endpoint trả về dữ liệu đã tính toán cho biểu đồ:

```typescript
// Response shape:
{
  tasksByStatus: { label: string, count: number }[],        // Donut chart
  tasksByDepartment: { department: string, total: number, completed: number }[], // Bar chart
  leavesByMonth: { month: string, count: number }[],        // Line chart
  employeesByDepartment: { department: string, count: number }[] // Bar chart
}
```

Dữ liệu được tính từ các collection hiện có trong `store`:
- `tasks` → group by status, group by department (qua assignee → user → department)
- `leaves` → group by tháng (parse từ `startDate`)
- `users` → group by department

#### [MODIFY] [page.tsx](file:///c:/Users/phatdv7559/Desktop/project-site/app/page.tsx)

Thêm section "Analytics" sau stat cards và quick actions, bao gồm:

| Biểu đồ | Loại | Dữ liệu | Vị trí |
|----------|------|---------|--------|
| Task Distribution | Doughnut | Phân bổ task theo trạng thái (To Do, In Progress, Review, Done) | Grid trái |
| Leave Trends | Line | Xu hướng nghỉ phép theo 6 tháng gần nhất | Grid phải |
| Tasks by Department | Horizontal Bar | Số task theo phòng ban (total vs completed) | Full width |
| Headcount | Doughnut | Nhân viên theo phòng ban | Grid trái (thay thế, hoặc thêm) |

- Sử dụng **Chart.js** (cài qua npm) với custom color palette từ CSS variables
- Mỗi chart được wrap trong card component có header title
- Responsive: 2 cột trên desktop, 1 cột trên mobile
- Có loading skeleton khi fetch data

#### [MODIFY] [globals.css](file:///c:/Users/phatdv7559/Desktop/project-site/app/globals.css)

- Thêm styles cho chart containers, responsive grid cho analytics section

---

### 3. Notification Center

Dropdown panel thông báo từ nút chuông trên Header, tổng hợp mọi sự kiện trong hệ thống.

---

#### [NEW] [route.ts](file:///c:/Users/phatdv7559/Desktop/project-site/app/api/notifications/route.ts)

API endpoint tạo notifications từ các sự kiện trong hệ thống:

```typescript
interface Notification {
  id: string;
  type: 'leave_approved' | 'leave_rejected' | 'leave_pending' | 'task_assigned' | 'task_updated' | 'meeting_scheduled' | 'announcement_new';
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  link: string;        // URL điều hướng khi click
  actorName: string;   // Người thực hiện hành động
}
```

Logic tạo notification:
- Duyệt qua `leaves`, `tasks`, `meetings`, `announcements`
- Tạo notification entries dựa trên sự kiện (leave được duyệt → notify cho employee, task được giao → notify cho assignee, v.v.)
- Sort theo timestamp mới nhất
- Hỗ trợ query param `?unreadOnly=true` để đếm badge

#### [NEW] [route.ts](file:///c:/Users/phatdv7559/Desktop/project-site/app/api/notifications/read/route.ts)

API endpoint PUT để đánh dấu notification đã đọc:
- `PUT /api/notifications/read` — body: `{ ids: string[] }` hoặc `{ all: true }`

#### [NEW] [NotificationPanel.tsx](file:///c:/Users/phatdv7559/Desktop/project-site/components/layout/NotificationPanel.tsx)

Component dropdown panel:

| Phần | Mô tả |
|------|-------|
| **Header** | "Notifications" + badge đếm unread + nút "Mark all as read" |
| **Tab bar** | All / Unread |
| **List** | Danh sách notification items, mỗi item có: icon type, actor avatar, message, timestamp, dot unread indicator |
| **Empty state** | Icon + "All caught up!" khi không có notification |
| **Footer** | Không cần (dropdown đủ ngắn gọn) |

Features:
- Click ngoài panel → đóng
- Click vào notification → điều hướng tới link tương ứng + đánh dấu đã đọc
- Dot indicator cho unread items
- Badge số trên nút chuông (Header)
- Animation slide-down khi mở

#### [MODIFY] [Header.tsx](file:///c:/Users/phatdv7559/Desktop/project-site/components/layout/Header.tsx)

- Thay thế logic `handleNotificationClick` toast đơn giản → toggle `NotificationPanel`
- Fetch unread count từ API, hiển thị badge số trên nút chuông
- Truyền `isOpen` / `onClose` xuống `NotificationPanel`

#### [MODIFY] [types.ts](file:///c:/Users/phatdv7559/Desktop/project-site/lib/types.ts)

- Thêm `Notification` interface

#### [MODIFY] [store.ts](file:///c:/Users/phatdv7559/Desktop/project-site/lib/store.ts)

- Không cần thay đổi, notification data được tạo on-the-fly từ các collection khác (hoặc lưu vào collection `notifications` nếu cần persist trạng thái read/unread)

#### [MODIFY] [seed.ts](file:///c:/Users/phatdv7559/Desktop/project-site/lib/seed.ts)

- Thêm `seedNotifications()` để tạo dữ liệu mẫu notification

#### [MODIFY] [globals.css](file:///c:/Users/phatdv7559/Desktop/project-site/app/globals.css)

- Thêm styles cho notification panel: dropdown positioning, animation, list items, unread indicator, badge

---

### 4. Unified Calendar View

Trang lịch tổng hợp hiển thị tất cả sự kiện: meetings, task deadlines, leave days, sinh nhật nhân viên.

---

#### [NEW] [route.ts](file:///c:/Users/phatdv7559/Desktop/project-site/app/api/calendar/route.ts)

API endpoint trả về tất cả sự kiện trong khoảng thời gian:

```typescript
// Query: ?start=2026-06-01&end=2026-06-30
interface CalendarEvent {
  id: string;
  type: 'meeting' | 'task_deadline' | 'leave' | 'birthday';
  title: string;
  date: string;           // YYYY-MM-DD
  startTime?: string;     // HH:mm (cho meeting)
  endTime?: string;       // HH:mm (cho meeting)
  color: string;          // CSS color theo type
  metadata: {
    roomName?: string;    // meeting
    priority?: string;    // task
    leaveType?: string;   // leave
    employeeName?: string;// birthday
  };
}
```

Logic:
- `meetings` → filter theo date range, status = 'scheduled'
- `tasks` → filter theo dueDate trong range
- `leaves` → filter theo startDate/endDate overlapping range, status = 'approved'
- `users` → tính birthday từ joinDate (hoặc thêm field birthDate vào User type)

#### [NEW] [page.tsx](file:///c:/Users/phatdv7559/Desktop/project-site/app/calendar/page.tsx)

Trang calendar với layout:

| Section | Mô tả |
|---------|-------|
| **Header** | Title + navigation (← tháng trước, tháng hiện tại, tháng sau →) + nút "Today" |
| **Legend** | Color dots cho mỗi loại event: 🟣 Meeting, 🔵 Task Deadline, 🟢 Leave, 🟡 Birthday |
| **Month Grid** | CSS Grid 7 cột (Mon–Sun), mỗi ô ngày hiển thị số + event dots |
| **Day Detail Panel** | Khi click vào ô ngày → hiển thị panel bên phải hoặc expandable section bên dưới, liệt kê chi tiết các sự kiện trong ngày |

Features:
- Xây dựng hoàn toàn bằng **CSS Grid + vanilla React** (không dùng thư viện FullCalendar)
- Ngày hôm nay được highlight
- Ngày có sự kiện hiển thị dots màu (tối đa 3-4 dots)
- Click ngày → mở day detail với danh sách sự kiện chi tiết
- Responsive: grid thu gọn trên mobile
- Loading skeleton khi fetch
- Smooth animation khi chuyển tháng

#### [MODIFY] [Sidebar.tsx](file:///c:/Users/phatdv7559/Desktop/project-site/components/layout/Sidebar.tsx)

- Thêm nav item `{ href: '/calendar', label: 'Calendar', icon: CalendarCheck, section: 'MAIN' }` vào mảng `navItems`
- Đặt sau "Meetings"

#### [MODIFY] [Header.tsx](file:///c:/Users/phatdv7559/Desktop/project-site/components/layout/Header.tsx)

- Thêm `'/calendar': 'Calendar'` vào `pageTitles`

#### [MODIFY] [globals.css](file:///c:/Users/phatdv7559/Desktop/project-site/app/globals.css)

- Thêm styles cho calendar grid, day cells, event dots, day detail panel, month navigation, responsive breakpoints

---

## Tổng hợp Files

### Files mới (7 files)

| # | File | Chức năng |
|---|------|-----------|
| 1 | `app/api/employees/[id]/profile/route.ts` | API profile data |
| 2 | `app/employees/[id]/page.tsx` | Employee Profile page |
| 3 | `app/api/dashboard/charts/route.ts` | API chart data |
| 4 | `app/api/notifications/route.ts` | API notifications |
| 5 | `app/api/notifications/read/route.ts` | API mark read |
| 6 | `components/layout/NotificationPanel.tsx` | Notification dropdown |
| 7 | `app/calendar/page.tsx` | Calendar page |
| 8 | `app/api/calendar/route.ts` | API calendar events |

### Files sửa đổi (7 files)

| # | File | Thay đổi |
|---|------|----------|
| 1 | `app/page.tsx` | Thêm chart section |
| 2 | `app/employees/page.tsx` | Link tên → profile |
| 3 | `components/layout/Header.tsx` | Notification panel, page titles |
| 4 | `components/layout/Sidebar.tsx` | Thêm Calendar nav item |
| 5 | `lib/types.ts` | Thêm Notification, CalendarEvent interfaces |
| 6 | `lib/seed.ts` | Seed notifications |
| 7 | `app/globals.css` | Styles mới |

---

## Verification Plan

### Automated Tests
- `npm run type-check` — Kiểm tra TypeScript không có lỗi
- `npm run build` — Build production thành công
- `npm run lint` — Không có lỗi ESLint

### Manual Verification
- **Employee Profile**: Click tên nhân viên từ Employee Directory → mở trang profile → kiểm tra hiển thị đầy đủ thông tin, leave history, tasks
- **Dashboard Charts**: Đăng nhập → Dashboard → kiểm tra 4 biểu đồ render đúng dữ liệu, responsive, có animation
- **Notification Center**: Click nút chuông → dropdown mở → kiểm tra danh sách notification, mark as read, badge đếm, click điều hướng
- **Calendar**: Sidebar → Calendar → kiểm tra month grid, event dots, click ngày xem chi tiết, navigation tháng trước/sau
- **Cross-test**: Tạo leave request mới → kiểm tra notification xuất hiện + calendar cập nhật + dashboard chart thay đổi

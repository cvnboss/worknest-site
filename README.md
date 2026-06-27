# WorkNest — Company Internal Portal (Cổng Thông Tin Nội Bộ Doanh Nghiệp)

**WorkNest** là một cổng thông tin nội bộ doanh nghiệp (company internal portal) được xây dựng hoàn chỉnh, đóng vai trò là một môi trường giả lập (testing target) lý tưởng phục vụ cho việc kiểm thử tự động (automated E2E testing) bằng Playwright sử dụng Page Object Model (POM). 

Dự án sở hữu giao diện chuyên nghiệp, hiện đại, hỗ trợ **3 nhóm vai trò người dùng (Admin, Manager, Employee)**, đi kèm với **10 trang chức năng**, **23 API endpoints** và hệ thống quản lý dữ liệu in-memory đồng bộ.

---

## ✨ Các Tính Năng Chính (Key Features)

### 1. 🔐 Xác Thực & Phân Quyền (Authentication & Authorization)
* Đăng ký (Register) và Đăng nhập (Login) bằng JWT (sử dụng thư viện `jose`).
* Phân quyền chi tiết dựa trên vai trò (Role-based access control - RBAC) cho 3 nhóm tài khoản: **Admin**, **Manager**, và **Employee**.
* Bảo vệ toàn bộ các route nhạy cảm với `AppShell` Component và JWT Validation.

### 2. 📊 Bảng Điều Khiển & Phân Tích (Dashboard & Analytics)
* Sử dụng **Chart.js** & **react-chartjs-2** hiển thị các thông tin phân tích trực quan:
  * **Task Distribution**: Phân bố công việc (Doughnut chart).
  * **Leave Trends**: Biểu đồ xu hướng nghỉ phép trong 6 tháng gần nhất (Line chart).
  * **Tasks by Department**: Thống kê công việc theo phòng ban (Horizontal Bar chart).
  * **Headcount by Department**: Cơ cấu nhân sự theo phòng ban (Doughnut chart).

### 3. 👥 Quản Lý Nhân Viên (Employee Directory & Profiles)
* Danh sách nhân viên trực quan hỗ trợ lọc theo phòng ban (Department) và vai trò (Role).
* Trang chi tiết hồ sơ nhân viên (`/employees/[id]`): Hiển thị thông tin cá nhân, chỉ số hiệu suất (Performance metrics), danh sách các tác vụ được giao (Assigned Tasks) và lịch sử nghỉ phép (Leave History).

### 4. 📅 Lịch Hợp Nhất (Unified Calendar)
* Lịch làm việc tùy biến xây dựng hoàn toàn bằng **CSS Grid** (không sử dụng thư viện ngoài).
* Tổng hợp toàn bộ các sự kiện quan trọng trong tháng: Lịch họp (Meetings), Hạn chót công việc (Task Deadlines), Lịch nghỉ phép (Leaves), và Sinh nhật/Kỷ niệm ngày vào làm của đồng nghiệp (Work Anniversaries / Birthdays).
* Panel chi tiết bên cạnh hiển thị nhanh danh sách sự kiện khi chọn một ngày bất kỳ trên lịch.

### 5. 📋 Bảng Công Việc (Kanban Task Board)
* Quản lý công việc với giao diện dạng bảng Kanban gồm 4 trạng thái: **To Do**, **In Progress**, **In Review**, và **Done**.
* Cho phép tạo mới, chỉnh sửa, xóa và thay đổi trạng thái/phân công công việc (Task Assignment).

### 6. 🏖️ Quản Lý Nghỉ Phép (Leave Management)
* Nhân viên có thể tạo yêu cầu nghỉ phép (Leave Request) với các thông tin: Loại nghỉ phép (Casual, Sick, Annual), thời gian và lý do.
* Manager và Admin có quyền phê duyệt (Approve) hoặc từ chối (Reject) trực tiếp các yêu cầu nghỉ phép của nhân sự cấp dưới.

### 7. 🤝 Đặt Phòng Họp (Meeting Room Booking)
* Quản lý các phòng họp của công ty với đầy đủ thông tin tiện ích đi kèm (Projector, Whiteboard, Video Conference, v.v.).
* Đăng ký họp, tự động kiểm tra xung đột thời gian (Conflict prevention) giữa các lịch đặt phòng họp.

### 8. 📢 Bảng Tin Nội Bộ (Announcements)
* Đăng tải các thông báo nội bộ của công ty.
* Hỗ trợ phần bình luận (Comments) dưới mỗi thông báo giúp tăng tương tác giữa nhân viên.

### 9. 🔔 Hệ Thống Thông Báo (Notification Center)
* Hệ thống thông báo trực tiếp (Dropdown panel từ icon quả chuông ở Header).
* Tự động tạo thông báo khi có các sự kiện: Được giao task mới, phòng họp được đặt, đơn nghỉ phép được phê duyệt/tối từ chối, có thông báo mới.
* Badge đếm số lượng thông báo chưa đọc, hỗ trợ đánh dấu đã đọc (`mark as read`).

### 10. ⚙️ Cài Đặt (System Settings)
* Cho phép thay đổi thông tin cá nhân của người dùng hiện tại.
* Cấu hình hiển thị và cài đặt các quyền cơ bản.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Framework**: Next.js 15 (sử dụng `/app` App Router)
* **Ngôn ngữ**: TypeScript
* **Styling**: Vanilla CSS (tối ưu hóa hiệu năng, giao diện Glassmorphic hiện đại, hỗ trợ Responsive)
* **Xác thực**: JWT (`jose`), Cookies
* **Thư viện biểu đồ**: Chart.js & React-Chartjs-2
* **Database**: In-memory database store (`lib/store.ts`) - Dữ liệu sẽ được reset lại khi khởi động lại server hoặc gọi API seed dữ liệu, cực kỳ thuận tiện cho quá trình chạy E2E tests tự động.

---

## 👥 Tài Khoản Demo (Demo Accounts)

Hệ thống có sẵn các tài khoản demo sau đây để kiểm thử:

| Vai trò (Role) | Email | Mật khẩu (Password) | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@worknest.com` | `admin123` | Toàn quyền cấu hình hệ thống, quản lý nhân sự, duyệt phép, tạo phòng họp. |
| **Manager** | `manager@worknest.com` | `manager123` | Quản lý team, phân công công việc, duyệt phép cho nhân viên. |
| **Employee** | `john@worknest.com` | `password123` | Xem thông tin cá nhân, cập nhật công việc, gửi yêu cầu nghỉ phép. |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án (Getting Started)

### 1. Cài đặt các thư viện phụ thuộc (Dependencies)
```bash
npm install
```

### 2. Chạy môi trường Phát triển (Development)
```bash
npm run dev
```
Truy cập ứng dụng tại địa chỉ mặc định: [http://localhost:3000](http://localhost:3000)

### 3. Build sản phẩm deploy (Production Build)
```bash
npm run build
npm run start
```

### 4. Khởi tạo / Reset lại dữ liệu mẫu (Seed/Reset Data)
Ứng dụng sử dụng in-memory database. Nếu bạn muốn reset toàn bộ dữ liệu về trạng thái mẫu ban đầu (phục vụ cho mỗi lần chạy test mới), bạn có thể gửi một yêu cầu `POST` tới:
`http://localhost:3000/api/seed`

Hoặc đăng nhập bằng tài khoản **Admin** và ấn vào nút reset hệ thống trong trang Cấu hình/Quản trị.

---

## 📂 Cấu Trúc Thư Mục Chính (Project Structure)

```
worknest-site/
├── app/                  # Next.js App Router (Pages & API routes)
│   ├── api/              # 23 API endpoints phục vụ cho FE và E2E test
│   ├── calendar/         # Trang Lịch biểu dùng CSS Grid
│   ├── employees/        # Danh sách nhân viên & Chi tiết hồ sơ nhân sự
│   ├── leave/            # Quản lý & phê duyệt nghỉ phép
│   ├── tasks/            # Bảng công việc Kanban
│   ├── meetings/         # Đặt phòng họp
│   ├── announcements/    # Bảng tin & bình luận nội bộ
│   └── globals.css       # Design System & các class CSS tùy biến
├── components/           # Các reusable React components (Layout, UI, Forms)
├── lib/                  # Nơi lưu trữ logic cốt lõi
│   ├── store.ts          # In-memory database chính cho toàn portal
│   ├── seed.ts           # Dữ liệu khởi tạo mặc định (15 nhân sự, 20 task,...)
│   ├── auth.ts           # JWT Helper utilities
│   └── auth-context.tsx  # Quản lý State đăng nhập & Phân quyền
└── docs/                 # Tài liệu mô tả tính năng & lộ trình phát triển
```

---

## 📡 API Endpoints (23 endpoints)

| Nhóm chức năng | Endpoint | Phương thức | Chi tiết |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/login` | `POST` | Đăng nhập tài khoản |
| | `/api/auth/register` | `POST` | Đăng ký tài khoản mới |
| | `/api/auth/me` | `GET` | Lấy thông tin user hiện tại qua JWT |
| **Employees** | `/api/employees` | `GET`, `POST` | Lấy danh sách hoặc thêm mới nhân sự |
| | `/api/employees/[id]` | `GET`, `PUT`, `DELETE` | Chi tiết, cập nhật hoặc xóa nhân viên |
| | `/api/employees/[id]/profile` | `GET` | Lấy dữ liệu profile đầy đủ kèm thống kê |
| **Leave** | `/api/leave` | `GET`, `POST` | Lấy danh sách hoặc tạo phép nghỉ |
| | `/api/leave/[id]` | `GET`, `PUT`, `DELETE` | Chi tiết, cập nhật hoặc xóa đơn xin phép |
| | `/api/leave/[id]/approve` | `PUT` | Phê duyệt hoặc từ chối đơn xin phép nghỉ |
| **Meetings** | `/api/meetings` | `GET`, `POST` | Xem danh sách hoặc đặt phòng họp |
| | `/api/meetings/[id]` | `GET`, `PUT`, `DELETE` | Chi tiết, chỉnh sửa hoặc hủy lịch họp |
| | `/api/meetings/rooms` | `GET` | Xem danh sách phòng họp khả dụng |
| **Tasks** | `/api/tasks` | `GET`, `POST` | Lấy danh sách tasks hoặc tạo task mới |
| | `/api/tasks/[id]` | `GET`, `PUT`, `DELETE` | Xem chi tiết, cập nhật trạng thái hoặc xóa task |
| **Announcements** | `/api/announcements` | `GET`, `POST` | Xem bản tin hoặc đăng thông báo mới |
| | `/api/announcements/[id]` | `GET`, `PUT`, `DELETE` | Chi tiết, chỉnh sửa hoặc xóa thông báo |
| | `/api/announcements/[id]/comments` | `POST` | Bình luận vào bài viết thông báo |
| **Users** | `/api/users/[id]` | `GET`, `PUT` | Xem chi tiết hoặc cập nhật cấu hình cá nhân |
| **Dashboard** | `/api/dashboard/stats` | `GET` | Lấy các con số thống kê tổng quan (Dashboard card stats) |
| | `/api/dashboard/charts` | `GET` | Lấy dữ liệu cho các biểu đồ phân tích |
| **Notifications** | `/api/notifications` | `GET` | Danh sách thông báo cá nhân |
| | `/api/notifications/read` | `PUT` | Đánh dấu các thông báo đã đọc |
| **Calendar** | `/api/calendar` | `GET` | Tổng hợp mọi sự kiện trong tháng |
| **Seed** | `/api/seed` | `POST` | Xóa và tạo mới lại toàn bộ dữ liệu mẫu (⚠️ yêu cầu Admin auth) |

---

## 🔒 Bảo Mật (Security)

Dự án đã được audit và vá các lỗ hổng bảo mật:

- **JWT Secret**: Đọc từ biến môi trường `JWT_SECRET` (có fallback cho demo)
- **Field Whitelisting**: Tất cả PUT endpoints sử dụng `pickFields()` — chống mass assignment
- **Self-Approve Prevention**: Manager/Admin không thể tự phê duyệt đơn nghỉ phép của mình
- **Role Escalation Block**: Không thể tự nâng quyền (role) qua API
- **Seed Protection**: Endpoint `/api/seed` yêu cầu xác thực Admin
- **Error Discrimination**: Phân biệt lỗi JWT (401) vs lỗi server (500)

### Cấu hình môi trường (Environment Variables)
Tạo file `.env.local` dựa trên `.env.example`:
```bash
cp .env.example .env.local
```
```env
JWT_SECRET=your-secret-key-here
```

---

## 🤖 Agent Workflow (Tái Sử Dụng)

Dự án có sẵn hệ thống agent configs để tái sử dụng cho audit & nâng cấp:

```
.agent/
├── master_agent.md           # Điều phối viên dự án
├── RULE.md                   # Quy tắc chung (TypeScript, API, CSS)
└── sub_agents/
    ├── frontend-engineer/    # UI/UX, CSS, Components, Accessibility
    ├── backend-engineer/     # API Security, Validation, Error Handling
    └── qa-tester/            # Build Verify, Smoke Test, Security Test
```
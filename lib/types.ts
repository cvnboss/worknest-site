/* ===================================================
   WorkNest - Types & Interfaces
   =================================================== */

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'employee' | 'manager' | 'admin';
  department: string;
  position: string;
  phone: string;
  avatar: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export type Employee = Omit<User, 'password'>;

export type DepartmentStatus = 'active' | 'inactive';

export interface Department {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  managerName?: string;
  status: DepartmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentWithStats extends Department {
  employeeCount: number;
  activeEmployeeCount: number;
  openTaskCount: number;
  pendingLeaveCount: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'annual' | 'sick' | 'personal' | 'remote';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewerName?: string;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  floor: string;
  amenities: string[];
  color: string;
}

export interface Meeting {
  id: string;
  roomId: string;
  roomName: string;
  title: string;
  organizer: string;
  organizerName: string;
  attendees: string[];
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'cancelled';
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeName: string;
  reporter: string;
  reporterName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  dueDate: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorName: string;
  category: 'general' | 'urgent' | 'event' | 'policy';
  isPinned: boolean;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  authorName: string;
  createdAt: string;
}

export interface DashboardStats {
  totalEmployees: number;
  pendingLeaves: number;
  todayMeetings: number;
  openTasks: number;
  recentActivities: Activity[];
  upcomingMeetings: Meeting[];
  myTasks: Task[];
}

export interface Activity {
  id: string;
  type: 'leave' | 'meeting' | 'task' | 'announcement';
  message: string;
  timestamp: string;
  user: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'leave_approved' | 'leave_rejected' | 'leave_pending' | 'task_assigned' | 'task_updated' | 'meeting_scheduled' | 'announcement_new';
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  link: string;
  actorName: string;
}

export interface CalendarEvent {
  id: string;
  type: 'meeting' | 'task_deadline' | 'leave' | 'birthday';
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  color: string;
  metadata?: {
    roomName?: string;
    priority?: string;
    leaveType?: string;
    employeeName?: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department?: string;
}

export interface AuthResponse {
  user: Employee;
  token: string;
}

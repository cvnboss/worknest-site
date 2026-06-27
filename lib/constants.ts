// Collection name constants
export const COLLECTIONS = {
  USERS: 'users',
  LEAVES: 'leaves',
  MEETINGS: 'meetings',
  ROOMS: 'rooms',
  TASKS: 'tasks',
  ANNOUNCEMENTS: 'announcements',
  NOTIFICATIONS: 'notifications',
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

// Role enums
export const ROLES = ['admin', 'manager', 'employee'] as const;
export type Role = typeof ROLES[number];

// Leave type enums
export const LEAVE_TYPES = ['annual', 'sick', 'personal', 'remote'] as const;
export type LeaveType = typeof LEAVE_TYPES[number];

// Leave status enums
export const LEAVE_STATUS = ['pending', 'approved', 'rejected'] as const;
export type LeaveStatus = typeof LEAVE_STATUS[number];

// Task priority enums
export const TASK_PRIORITY = ['low', 'medium', 'high', 'urgent'] as const;
export type TaskPriority = typeof TASK_PRIORITY[number];

// Task status enums
export const TASK_STATUS = ['todo', 'in-progress', 'review', 'done'] as const;
export type TaskStatus = typeof TASK_STATUS[number];

// Employee status enums
export const EMPLOYEE_STATUS = ['active', 'inactive'] as const;
export type EmployeeStatus = typeof EMPLOYEE_STATUS[number];

// Meeting status enums
export const MEETING_STATUS = ['scheduled', 'cancelled', 'completed'] as const;
export type MeetingStatus = typeof MEETING_STATUS[number];

// Announcement category enums
export const ANNOUNCEMENT_CATEGORIES = ['general', 'urgent', 'event', 'policy'] as const;
export type AnnouncementCategory = typeof ANNOUNCEMENT_CATEGORIES[number];

// Validation constants
export const MAX_LENGTHS = {
  TITLE: 200,
  DESCRIPTION: 2000,
  REASON: 1000,
  NAME: 100,
  EMAIL: 255,
  PHONE: 20,
  CONTENT: 5000,
  NOTE: 500,
} as const;

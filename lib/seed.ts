import store from './store';
import { hashPassword } from './auth';
import { COLLECTIONS } from './constants';
import { createEmployeeAvatar } from './utils';
import type { Department, User } from './types';

export function ensureSeeded() {
  if (store.isInitialized()) return;

  seedUsers();
  seedDepartments();
  seedLeaveRequests();
  seedMeetingRooms();
  seedMeetings();
  seedTasks();
  seedAnnouncements();
  seedNotifications();

  store.setInitialized();
}

function seedUsers() {
  const users = [
    { id: 'u1', email: 'admin@worknest.com', password: hashPassword('admin123'), firstName: 'Alex', lastName: 'Admin', role: 'admin', department: 'Management', position: 'System Administrator', phone: '+1-555-0101', avatar: '', joinDate: '2023-01-15', status: 'active' },
    { id: 'u2', email: 'manager@worknest.com', password: hashPassword('manager123'), firstName: 'Maya', lastName: 'Manager', role: 'manager', department: 'Engineering', position: 'Engineering Manager', phone: '+1-555-0102', avatar: '', joinDate: '2023-03-20', status: 'active' },
    { id: 'u3', email: 'john@worknest.com', password: hashPassword('password123'), firstName: 'John', lastName: 'Smith', role: 'employee', department: 'Engineering', position: 'Frontend Developer', phone: '+1-555-0103', avatar: '', joinDate: '2023-06-01', status: 'active' },
    { id: 'u4', email: 'jane@worknest.com', password: hashPassword('password123'), firstName: 'Jane', lastName: 'Doe', role: 'employee', department: 'Design', position: 'UI/UX Designer', phone: '+1-555-0104', avatar: '', joinDate: '2023-07-15', status: 'active' },
    { id: 'u5', email: 'bob@worknest.com', password: hashPassword('password123'), firstName: 'Bob', lastName: 'Wilson', role: 'employee', department: 'Marketing', position: 'Marketing Specialist', phone: '+1-555-0105', avatar: '', joinDate: '2023-09-01', status: 'active' },
    { id: 'u6', email: 'sarah@worknest.com', password: hashPassword('password123'), firstName: 'Sarah', lastName: 'Johnson', role: 'employee', department: 'Engineering', position: 'Backend Developer', phone: '+1-555-0106', avatar: '', joinDate: '2023-10-10', status: 'active' },
    { id: 'u7', email: 'mike@worknest.com', password: hashPassword('password123'), firstName: 'Mike', lastName: 'Brown', role: 'employee', department: 'Finance', position: 'Financial Analyst', phone: '+1-555-0107', avatar: '', joinDate: '2024-01-05', status: 'active' },
    { id: 'u8', email: 'emily@worknest.com', password: hashPassword('password123'), firstName: 'Emily', lastName: 'Davis', role: 'employee', department: 'HR', position: 'HR Coordinator', phone: '+1-555-0108', avatar: '', joinDate: '2024-02-14', status: 'active' },
    { id: 'u9', email: 'david@worknest.com', password: hashPassword('password123'), firstName: 'David', lastName: 'Lee', role: 'employee', department: 'Engineering', position: 'DevOps Engineer', phone: '+1-555-0109', avatar: '', joinDate: '2024-03-20', status: 'active' },
    { id: 'u10', email: 'lisa@worknest.com', password: hashPassword('password123'), firstName: 'Lisa', lastName: 'Garcia', role: 'employee', department: 'Design', position: 'Graphic Designer', phone: '+1-555-0110', avatar: '', joinDate: '2024-04-01', status: 'active' },
    { id: 'u11', email: 'chris@worknest.com', password: hashPassword('password123'), firstName: 'Chris', lastName: 'Martinez', role: 'employee', department: 'Marketing', position: 'Content Writer', phone: '+1-555-0111', avatar: '', joinDate: '2024-05-15', status: 'active' },
    { id: 'u12', email: 'anna@worknest.com', password: hashPassword('password123'), firstName: 'Anna', lastName: 'Taylor', role: 'manager', department: 'Design', position: 'Design Lead', phone: '+1-555-0112', avatar: '', joinDate: '2023-04-10', status: 'active' },
    { id: 'u13', email: 'tom@worknest.com', password: hashPassword('password123'), firstName: 'Tom', lastName: 'Anderson', role: 'employee', department: 'Engineering', position: 'QA Engineer', phone: '+1-555-0113', avatar: '', joinDate: '2024-06-01', status: 'inactive' },
    { id: 'u14', email: 'rachel@worknest.com', password: hashPassword('password123'), firstName: 'Rachel', lastName: 'White', role: 'employee', department: 'Finance', position: 'Accountant', phone: '+1-555-0114', avatar: '', joinDate: '2024-07-20', status: 'active' },
    { id: 'u15', email: 'kevin@worknest.com', password: hashPassword('password123'), firstName: 'Kevin', lastName: 'Harris', role: 'employee', department: 'HR', position: 'Recruiter', phone: '+1-555-0115', avatar: '', joinDate: '2024-08-15', status: 'active' },
  ];

  users.forEach(u => store.create('users', {
    ...u,
    avatar: createEmployeeAvatar(u.firstName, u.lastName, u.id),
  }));
}

function seedDepartments() {
  const users = store.getAll(COLLECTIONS.USERS) as User[];
  const now = new Date().toISOString();
  const managerById = new Map(users.map((user) => [user.id, user]));

  const departments: Department[] = [
    {
      id: 'd1',
      name: 'Management',
      description: 'Company leadership and administration',
      managerId: 'u1',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'd2',
      name: 'Engineering',
      description: 'Product engineering, infrastructure, and quality',
      managerId: 'u2',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'd3',
      name: 'Design',
      description: 'Product design, research, and creative work',
      managerId: 'u12',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'd4',
      name: 'Marketing',
      description: 'Growth, content, and brand communications',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'd5',
      name: 'HR',
      description: 'People operations, hiring, and employee support',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'd6',
      name: 'Finance',
      description: 'Accounting, planning, and financial operations',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
  ];

  departments.forEach((department) => {
    const manager = department.managerId ? managerById.get(department.managerId) : undefined;
    store.create(COLLECTIONS.DEPARTMENTS, {
      ...department,
      managerName: manager ? `${manager.firstName} ${manager.lastName}` : undefined,
    });
  });
}

function seedLeaveRequests() {
  const leaves = [
    { id: 'l1', userId: 'u3', userName: 'John Smith', type: 'annual', startDate: '2026-06-25', endDate: '2026-06-27', reason: 'Family vacation trip to the beach', status: 'pending', createdAt: '2026-06-18T10:00:00Z', updatedAt: '2026-06-18T10:00:00Z' },
    { id: 'l2', userId: 'u4', userName: 'Jane Doe', type: 'sick', startDate: '2026-06-16', endDate: '2026-06-16', reason: 'Not feeling well, need rest', status: 'approved', reviewedBy: 'u12', reviewerName: 'Anna Taylor', reviewNote: 'Get well soon!', createdAt: '2026-06-15T08:00:00Z', updatedAt: '2026-06-15T09:00:00Z' },
    { id: 'l3', userId: 'u5', userName: 'Bob Wilson', type: 'personal', startDate: '2026-06-20', endDate: '2026-06-20', reason: 'Moving to a new apartment', status: 'approved', reviewedBy: 'u2', reviewerName: 'Maya Manager', reviewNote: 'Approved', createdAt: '2026-06-14T14:00:00Z', updatedAt: '2026-06-14T16:00:00Z' },
    { id: 'l4', userId: 'u6', userName: 'Sarah Johnson', type: 'remote', startDate: '2026-06-23', endDate: '2026-06-27', reason: 'Working remotely from hometown', status: 'pending', createdAt: '2026-06-17T09:00:00Z', updatedAt: '2026-06-17T09:00:00Z' },
    { id: 'l5', userId: 'u7', userName: 'Mike Brown', type: 'annual', startDate: '2026-07-01', endDate: '2026-07-05', reason: 'Summer holiday', status: 'pending', createdAt: '2026-06-16T11:00:00Z', updatedAt: '2026-06-16T11:00:00Z' },
    { id: 'l6', userId: 'u9', userName: 'David Lee', type: 'sick', startDate: '2026-06-10', endDate: '2026-06-11', reason: 'Doctor appointment and recovery', status: 'approved', reviewedBy: 'u2', reviewerName: 'Maya Manager', reviewNote: 'Take care', createdAt: '2026-06-09T07:00:00Z', updatedAt: '2026-06-09T08:30:00Z' },
    { id: 'l7', userId: 'u10', userName: 'Lisa Garcia', type: 'personal', startDate: '2026-06-28', endDate: '2026-06-28', reason: 'Attending a conference', status: 'rejected', reviewedBy: 'u12', reviewerName: 'Anna Taylor', reviewNote: 'Please reschedule, team deadline that week', createdAt: '2026-06-15T10:00:00Z', updatedAt: '2026-06-15T14:00:00Z' },
    { id: 'l8', userId: 'u11', userName: 'Chris Martinez', type: 'annual', startDate: '2026-07-10', endDate: '2026-07-14', reason: 'Planned vacation', status: 'pending', createdAt: '2026-06-18T13:00:00Z', updatedAt: '2026-06-18T13:00:00Z' },
    { id: 'l9', userId: 'u3', userName: 'John Smith', type: 'sick', startDate: '2026-06-05', endDate: '2026-06-05', reason: 'Migraine', status: 'approved', reviewedBy: 'u2', reviewerName: 'Maya Manager', reviewNote: 'Feel better', createdAt: '2026-06-05T06:00:00Z', updatedAt: '2026-06-05T07:00:00Z' },
    { id: 'l10', userId: 'u8', userName: 'Emily Davis', type: 'remote', startDate: '2026-06-19', endDate: '2026-06-20', reason: 'Home internet installation', status: 'approved', reviewedBy: 'u2', reviewerName: 'Maya Manager', reviewNote: 'OK', createdAt: '2026-06-17T15:00:00Z', updatedAt: '2026-06-17T16:00:00Z' },
  ];

  leaves.forEach(l => store.create('leaves', l));
}

function seedMeetingRooms() {
  const rooms = [
    { id: 'r1', name: 'Horizon', capacity: 10, floor: '3rd Floor', amenities: ['Projector', 'Whiteboard', 'Video Conference'], color: '#6366F1' },
    { id: 'r2', name: 'Summit', capacity: 6, floor: '3rd Floor', amenities: ['TV Screen', 'Whiteboard'], color: '#10B981' },
    { id: 'r3', name: 'Spark', capacity: 4, floor: '2nd Floor', amenities: ['TV Screen', 'Phone'], color: '#F59E0B' },
    { id: 'r4', name: 'Vista', capacity: 12, floor: '4th Floor', amenities: ['Projector', 'Video Conference', 'Whiteboard', 'Sound System'], color: '#F43F5E' },
    { id: 'r5', name: 'Focus', capacity: 2, floor: '2nd Floor', amenities: ['Phone'], color: '#0EA5E9' },
  ];

  rooms.forEach(r => store.create('rooms', r));
}

function seedMeetings() {
  const today = new Date().toISOString().split('T')[0];

  const meetings = [
    { id: 'm1', roomId: 'r1', roomName: 'Horizon', title: 'Sprint Planning', organizer: 'u2', organizerName: 'Maya Manager', attendees: ['u3', 'u6', 'u9', 'u13'], date: today, startTime: '09:00', endTime: '10:00', status: 'scheduled', createdAt: '2026-06-18T08:00:00Z' },
    { id: 'm2', roomId: 'r2', roomName: 'Summit', title: 'Design Review', organizer: 'u12', organizerName: 'Anna Taylor', attendees: ['u4', 'u10'], date: today, startTime: '11:00', endTime: '12:00', status: 'scheduled', createdAt: '2026-06-17T14:00:00Z' },
    { id: 'm3', roomId: 'r4', roomName: 'Vista', title: 'All Hands Meeting', organizer: 'u1', organizerName: 'Alex Admin', attendees: ['u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8'], date: today, startTime: '14:00', endTime: '15:00', status: 'scheduled', createdAt: '2026-06-16T10:00:00Z' },
    { id: 'm4', roomId: 'r3', roomName: 'Spark', title: '1-on-1 with John', organizer: 'u2', organizerName: 'Maya Manager', attendees: ['u3'], date: today, startTime: '16:00', endTime: '16:30', status: 'scheduled', createdAt: '2026-06-18T09:00:00Z' },
    { id: 'm5', roomId: 'r1', roomName: 'Horizon', title: 'Product Demo', organizer: 'u3', organizerName: 'John Smith', attendees: ['u2', 'u4', 'u5'], date: '2026-06-20', startTime: '10:00', endTime: '11:30', status: 'scheduled', createdAt: '2026-06-15T11:00:00Z' },
    { id: 'm6', roomId: 'r5', roomName: 'Focus', title: 'Quick Sync', organizer: 'u6', organizerName: 'Sarah Johnson', attendees: ['u9'], date: '2026-06-20', startTime: '14:00', endTime: '14:30', status: 'scheduled', createdAt: '2026-06-18T12:00:00Z' },
    { id: 'm7', roomId: 'r2', roomName: 'Summit', title: 'Marketing Strategy', organizer: 'u5', organizerName: 'Bob Wilson', attendees: ['u11'], date: '2026-06-21', startTime: '09:00', endTime: '10:00', status: 'scheduled', createdAt: '2026-06-17T16:00:00Z' },
    { id: 'm8', roomId: 'r4', roomName: 'Vista', title: 'Quarterly Review', organizer: 'u1', organizerName: 'Alex Admin', attendees: ['u2', 'u7', 'u12', 'u14'], date: '2026-06-22', startTime: '13:00', endTime: '15:00', status: 'scheduled', createdAt: '2026-06-10T08:00:00Z' },
  ];

  meetings.forEach(m => store.create('meetings', m));
}

function seedTasks() {
  const tasks = [
    { id: 't1', title: 'Setup CI/CD Pipeline', description: 'Configure GitHub Actions for automated testing and deployment', assignee: 'u9', assigneeName: 'David Lee', reporter: 'u2', reporterName: 'Maya Manager', priority: 'high', status: 'in-progress', dueDate: '2026-06-25', tags: ['devops', 'infrastructure'], createdAt: '2026-06-10T08:00:00Z', updatedAt: '2026-06-18T10:00:00Z' },
    { id: 't2', title: 'Design Landing Page', description: 'Create mockups for the new product landing page', assignee: 'u4', assigneeName: 'Jane Doe', reporter: 'u12', reporterName: 'Anna Taylor', priority: 'medium', status: 'review', dueDate: '2026-06-20', tags: ['design', 'ui'], createdAt: '2026-06-08T09:00:00Z', updatedAt: '2026-06-17T15:00:00Z' },
    { id: 't3', title: 'Fix Login Bug', description: 'Users report intermittent login failures on mobile devices', assignee: 'u3', assigneeName: 'John Smith', reporter: 'u13', reporterName: 'Tom Anderson', priority: 'urgent', status: 'in-progress', dueDate: '2026-06-19', tags: ['bug', 'auth'], createdAt: '2026-06-17T11:00:00Z', updatedAt: '2026-06-18T08:00:00Z' },
    { id: 't4', title: 'Write API Documentation', description: 'Document all REST API endpoints with examples', assignee: 'u6', assigneeName: 'Sarah Johnson', reporter: 'u2', reporterName: 'Maya Manager', priority: 'medium', status: 'todo', dueDate: '2026-06-28', tags: ['docs', 'api'], createdAt: '2026-06-15T14:00:00Z', updatedAt: '2026-06-15T14:00:00Z' },
    { id: 't5', title: 'Implement Dark Mode', description: 'Add dark theme support across all pages', assignee: 'u3', assigneeName: 'John Smith', reporter: 'u4', reporterName: 'Jane Doe', priority: 'low', status: 'todo', dueDate: '2026-07-10', tags: ['feature', 'ui'], createdAt: '2026-06-12T10:00:00Z', updatedAt: '2026-06-12T10:00:00Z' },
    { id: 't6', title: 'Optimize Database Queries', description: 'Review and optimize slow-running database queries', assignee: 'u6', assigneeName: 'Sarah Johnson', reporter: 'u9', reporterName: 'David Lee', priority: 'high', status: 'todo', dueDate: '2026-06-30', tags: ['performance', 'backend'], createdAt: '2026-06-14T08:00:00Z', updatedAt: '2026-06-14T08:00:00Z' },
    { id: 't7', title: 'Create Marketing Materials', description: 'Prepare social media graphics and blog posts for product launch', assignee: 'u5', assigneeName: 'Bob Wilson', reporter: 'u11', reporterName: 'Chris Martinez', priority: 'medium', status: 'in-progress', dueDate: '2026-06-22', tags: ['marketing', 'content'], createdAt: '2026-06-11T09:00:00Z', updatedAt: '2026-06-18T11:00:00Z' },
    { id: 't8', title: 'User Research Interviews', description: 'Conduct 5 user interviews for the new feature set', assignee: 'u4', assigneeName: 'Jane Doe', reporter: 'u12', reporterName: 'Anna Taylor', priority: 'medium', status: 'done', dueDate: '2026-06-15', tags: ['research', 'ux'], createdAt: '2026-06-05T10:00:00Z', updatedAt: '2026-06-15T17:00:00Z' },
    { id: 't9', title: 'Security Audit', description: 'Perform security review of authentication and authorization systems', assignee: 'u9', assigneeName: 'David Lee', reporter: 'u1', reporterName: 'Alex Admin', priority: 'urgent', status: 'todo', dueDate: '2026-06-24', tags: ['security', 'audit'], createdAt: '2026-06-16T08:00:00Z', updatedAt: '2026-06-16T08:00:00Z' },
    { id: 't10', title: 'Update Employee Handbook', description: 'Revise company policies and add new remote work guidelines', assignee: 'u8', assigneeName: 'Emily Davis', reporter: 'u1', reporterName: 'Alex Admin', priority: 'low', status: 'in-progress', dueDate: '2026-07-01', tags: ['hr', 'policy'], createdAt: '2026-06-10T14:00:00Z', updatedAt: '2026-06-17T10:00:00Z' },
    { id: 't11', title: 'Budget Report Q2', description: 'Compile and present Q2 financial report', assignee: 'u7', assigneeName: 'Mike Brown', reporter: 'u14', reporterName: 'Rachel White', priority: 'high', status: 'review', dueDate: '2026-06-21', tags: ['finance', 'report'], createdAt: '2026-06-01T09:00:00Z', updatedAt: '2026-06-18T16:00:00Z' },
    { id: 't12', title: 'Mobile Responsive Fixes', description: 'Fix layout issues on mobile viewport sizes', assignee: 'u3', assigneeName: 'John Smith', reporter: 'u4', reporterName: 'Jane Doe', priority: 'medium', status: 'done', dueDate: '2026-06-12', tags: ['bug', 'mobile'], createdAt: '2026-06-08T11:00:00Z', updatedAt: '2026-06-12T14:00:00Z' },
    { id: 't13', title: 'Onboarding Flow Design', description: 'Design new employee onboarding experience', assignee: 'u10', assigneeName: 'Lisa Garcia', reporter: 'u12', reporterName: 'Anna Taylor', priority: 'medium', status: 'todo', dueDate: '2026-07-05', tags: ['design', 'onboarding'], createdAt: '2026-06-15T13:00:00Z', updatedAt: '2026-06-15T13:00:00Z' },
    { id: 't14', title: 'Recruit Senior Developer', description: 'Post job listing and screen candidates for senior frontend position', assignee: 'u15', assigneeName: 'Kevin Harris', reporter: 'u2', reporterName: 'Maya Manager', priority: 'high', status: 'in-progress', dueDate: '2026-07-15', tags: ['hiring', 'hr'], createdAt: '2026-06-01T08:00:00Z', updatedAt: '2026-06-18T09:00:00Z' },
    { id: 't15', title: 'SEO Optimization', description: 'Improve search engine rankings for product pages', assignee: 'u11', assigneeName: 'Chris Martinez', reporter: 'u5', reporterName: 'Bob Wilson', priority: 'low', status: 'todo', dueDate: '2026-07-20', tags: ['seo', 'marketing'], createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z' },
    { id: 't16', title: 'API Rate Limiting', description: 'Implement rate limiting on public API endpoints', assignee: 'u6', assigneeName: 'Sarah Johnson', reporter: 'u9', reporterName: 'David Lee', priority: 'high', status: 'todo', dueDate: '2026-06-26', tags: ['security', 'api'], createdAt: '2026-06-16T15:00:00Z', updatedAt: '2026-06-16T15:00:00Z' },
    { id: 't17', title: 'Newsletter Campaign', description: 'Draft and send monthly newsletter to subscribers', assignee: 'u5', assigneeName: 'Bob Wilson', reporter: 'u11', reporterName: 'Chris Martinez', priority: 'medium', status: 'done', dueDate: '2026-06-10', tags: ['marketing', 'email'], createdAt: '2026-06-05T09:00:00Z', updatedAt: '2026-06-10T16:00:00Z' },
    { id: 't18', title: 'Unit Test Coverage', description: 'Increase unit test coverage to 80% on core modules', assignee: 'u13', assigneeName: 'Tom Anderson', reporter: 'u2', reporterName: 'Maya Manager', priority: 'medium', status: 'todo', dueDate: '2026-07-10', tags: ['testing', 'quality'], createdAt: '2026-06-14T11:00:00Z', updatedAt: '2026-06-14T11:00:00Z' },
    { id: 't19', title: 'Client Dashboard Redesign', description: 'Redesign the client-facing dashboard with new metrics', assignee: 'u10', assigneeName: 'Lisa Garcia', reporter: 'u4', reporterName: 'Jane Doe', priority: 'high', status: 'in-progress', dueDate: '2026-06-29', tags: ['design', 'dashboard'], createdAt: '2026-06-07T10:00:00Z', updatedAt: '2026-06-18T14:00:00Z' },
    { id: 't20', title: 'Payroll System Integration', description: 'Integrate with third-party payroll provider API', assignee: 'u7', assigneeName: 'Mike Brown', reporter: 'u1', reporterName: 'Alex Admin', priority: 'urgent', status: 'todo', dueDate: '2026-06-30', tags: ['integration', 'finance'], createdAt: '2026-06-12T08:00:00Z', updatedAt: '2026-06-12T08:00:00Z' },
  ];

  tasks.forEach(t => store.create('tasks', t));
}

function seedAnnouncements() {
  const announcements = [
    {
      id: 'a1', title: 'Welcome to WorkNest!', content: 'We are excited to launch our new internal portal. WorkNest will be your one-stop destination for managing tasks, leave requests, meeting rooms, and staying updated with company news. Please explore all the features and don\'t hesitate to provide feedback!',
      author: 'u1', authorName: 'Alex Admin', category: 'general', isPinned: true,
      comments: [
        { id: 'c1', content: 'This looks amazing. Great work team!', author: 'u3', authorName: 'John Smith', createdAt: '2026-06-18T10:30:00Z' },
        { id: 'c2', content: 'Love the new design. Very intuitive!', author: 'u4', authorName: 'Jane Doe', createdAt: '2026-06-18T11:00:00Z' },
        { id: 'c3', content: 'Can we get a mobile app version too?', author: 'u5', authorName: 'Bob Wilson', createdAt: '2026-06-18T14:00:00Z' },
      ],
      createdAt: '2026-06-18T09:00:00Z', updatedAt: '2026-06-18T09:00:00Z'
    },
    {
      id: 'a2', title: 'System Maintenance - June 22', content: 'Please be advised that there will be a scheduled system maintenance on June 22, 2026, from 10:00 PM to 2:00 AM. During this time, some services may be temporarily unavailable. We recommend saving your work beforehand.',
      author: 'u1', authorName: 'Alex Admin', category: 'urgent', isPinned: true,
      comments: [
        { id: 'c4', content: 'Thanks for the heads up!', author: 'u6', authorName: 'Sarah Johnson', createdAt: '2026-06-17T15:00:00Z' },
      ],
      createdAt: '2026-06-17T14:00:00Z', updatedAt: '2026-06-17T14:00:00Z'
    },
    {
      id: 'a3', title: 'Summer Team Building Event', content: 'Join us for our annual summer team building event on July 5th. We\'ve planned activities including beach games, BBQ, and a sunset boat tour. Details and sign-up form will be shared via email. Mark your calendars.',
      author: 'u8', authorName: 'Emily Davis', category: 'event', isPinned: false,
      comments: [
        { id: 'c5', content: 'Count me in.', author: 'u3', authorName: 'John Smith', createdAt: '2026-06-16T10:00:00Z' },
        { id: 'c6', content: 'Can we bring family members?', author: 'u7', authorName: 'Mike Brown', createdAt: '2026-06-16T11:30:00Z' },
      ],
      createdAt: '2026-06-16T09:00:00Z', updatedAt: '2026-06-16T09:00:00Z'
    },
    {
      id: 'a4', title: 'Updated Remote Work Policy', content: 'We have updated our remote work policy effective July 1, 2026. Key changes include: flexible work hours (core hours 10 AM - 3 PM), up to 3 remote days per week, and a monthly home office stipend of $100. Please review the full policy document in the HR portal.',
      author: 'u1', authorName: 'Alex Admin', category: 'policy', isPinned: false,
      comments: [],
      createdAt: '2026-06-15T08:00:00Z', updatedAt: '2026-06-15T08:00:00Z'
    },
    {
      id: 'a5', title: 'New Health Insurance Benefits', content: 'Starting next month, we are upgrading our health insurance plan to include dental and vision coverage for all employees. Dependents can also be added at a reduced rate. HR will schedule individual sessions to walk you through the enrollment process.',
      author: 'u8', authorName: 'Emily Davis', category: 'general', isPinned: false,
      comments: [
        { id: 'c7', content: 'This is wonderful news! Thank you!', author: 'u14', authorName: 'Rachel White', createdAt: '2026-06-14T16:00:00Z' },
      ],
      createdAt: '2026-06-14T10:00:00Z', updatedAt: '2026-06-14T10:00:00Z'
    },
    {
      id: 'a6', title: 'Q2 Engineering All-Hands Recap', content: 'For those who missed the Engineering All-Hands meeting, here are the key highlights: We shipped 23 features this quarter, reduced bug count by 40%, and onboarded 3 new team members. The recording is available on the shared drive. Great job, engineering team!',
      author: 'u2', authorName: 'Maya Manager', category: 'general', isPinned: false,
      comments: [
        { id: 'c8', content: 'Proud of what we accomplished.', author: 'u9', authorName: 'David Lee', createdAt: '2026-06-13T11:00:00Z' },
        { id: 'c9', content: 'Looking forward to an even better Q3!', author: 'u6', authorName: 'Sarah Johnson', createdAt: '2026-06-13T12:00:00Z' },
      ],
      createdAt: '2026-06-13T09:00:00Z', updatedAt: '2026-06-13T09:00:00Z'
    },
  ];

  announcements.forEach(a => store.create('announcements', a));
}

function seedNotifications() {
  const notifications = [
    { id: 'n1', userId: 'u3', type: 'task_assigned', title: 'New Task Assigned', message: 'Tom Anderson assigned you the task "Fix Login Bug"', isRead: false, timestamp: '2026-06-17T11:05:00Z', link: '/tasks', actorName: 'Tom Anderson' },
    { id: 'n2', userId: 'u3', type: 'meeting_scheduled', title: 'Meeting Scheduled', message: 'Maya Manager invited you to "Sprint Planning"', isRead: false, timestamp: '2026-06-18T08:05:00Z', link: '/meetings', actorName: 'Maya Manager' },
    { id: 'n3', userId: 'u3', type: 'announcement_new', title: 'New Announcement', message: 'Alex Admin posted "Welcome to WorkNest!"', isRead: true, timestamp: '2026-06-18T09:05:00Z', link: '/announcements', actorName: 'Alex Admin' },
    { id: 'n4', userId: 'u4', type: 'leave_approved', title: 'Leave Approved', message: 'Anna Taylor approved your sick leave', isRead: false, timestamp: '2026-06-15T09:05:00Z', link: '/leave', actorName: 'Anna Taylor' },
    { id: 'n5', userId: 'u4', type: 'task_assigned', title: 'New Task Assigned', message: 'Anna Taylor assigned you the task "Design Landing Page"', isRead: true, timestamp: '2026-06-08T09:05:00Z', link: '/tasks', actorName: 'Anna Taylor' },
  ];

  notifications.forEach(n => store.create('notifications', n));
}

import { NextResponse } from 'next/server';
import store from '@/lib/store';
import { verifyToken, extractToken } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';

export async function GET(request: Request) {
  ensureSeeded();

  try {
    const token = extractToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    await verifyToken(token);

    // 1. Tasks by Status (Doughnut)
    const tasks = store.getAll('tasks');
    const tasksByStatusCount: Record<string, number> = { todo: 0, 'in-progress': 0, review: 0, done: 0 };
    tasks.forEach(t => {
      if (tasksByStatusCount[t.status as string] !== undefined) {
        tasksByStatusCount[t.status as string]++;
      }
    });
    const tasksByStatus = [
      { label: 'To Do', count: tasksByStatusCount['todo'] },
      { label: 'In Progress', count: tasksByStatusCount['in-progress'] },
      { label: 'Review', count: tasksByStatusCount['review'] },
      { label: 'Done', count: tasksByStatusCount['done'] },
    ];

    // 2. Tasks by Department (Bar)
    const users = store.getAll('users');
    const deptMap: Record<string, string> = {};
    users.forEach(u => deptMap[u.id as string] = u.department as string);
    
    const tasksByDeptMap: Record<string, { total: number, completed: number }> = {};
    tasks.forEach(t => {
      const dept = deptMap[t.assignee as string] || 'Unknown';
      if (!tasksByDeptMap[dept]) tasksByDeptMap[dept] = { total: 0, completed: 0 };
      tasksByDeptMap[dept].total++;
      if (t.status === 'done') tasksByDeptMap[dept].completed++;
    });
    
    const tasksByDepartment = Object.entries(tasksByDeptMap).map(([department, stats]) => ({
      department,
      total: stats.total,
      completed: stats.completed
    })).sort((a, b) => b.total - a.total);

    // 3. Leaves by Month (Line)
    const leaves = store.getAll('leaves');
    const leavesByMonthMap: Record<string, number> = {};
    
    // Get last 6 months including current
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toISOString().substring(0, 7); // YYYY-MM
      months.push(monthStr);
      leavesByMonthMap[monthStr] = 0;
    }

    leaves.forEach(l => {
      const startMonth = (l.startDate as string).substring(0, 7);
      if (leavesByMonthMap[startMonth] !== undefined) {
        leavesByMonthMap[startMonth]++;
      }
    });
    
    const leavesByMonth = months.map(month => ({
      month,
      count: leavesByMonthMap[month]
    }));

    // 4. Employees by Department (Doughnut)
    const empByDeptMap: Record<string, number> = {};
    users.filter(u => u.status === 'active').forEach(u => {
      const dept = u.department as string;
      if (!empByDeptMap[dept]) empByDeptMap[dept] = 0;
      empByDeptMap[dept]++;
    });
    const employeesByDepartment = Object.entries(empByDeptMap).map(([department, count]) => ({
      department,
      count
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      data: {
        tasksByStatus,
        tasksByDepartment,
        leavesByMonth,
        employeesByDepartment
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}

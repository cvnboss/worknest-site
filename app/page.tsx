'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Users, ClipboardList, Calendar, CheckSquare, CalendarDays, Activity, Inbox, PartyPopper, PieChart, Clock, MapPin, CheckCircle2, Circle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { timeAgo } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartTitle,
  Tooltip,
  Legend
);

interface Stats {
  totalEmployees: number;
  pendingLeaves: number;
  todayMeetings: number;
  openTasks: number;
  approvedLeaves?: number;
  recentActivities: Array<{ id: string; type: string; message: string; timestamp: string }>;
  upcomingMeetings: Array<{ id: string; title: string; roomName: string; startTime: string; endTime: string; date: string }>;
  myTasks: Array<{ id: string; title: string; priority: string; status: string; dueDate: string }>;
}

interface ChartsData {
  tasksByStatus: Array<{ label: string; count: number }>;
  tasksByDepartment: Array<{ department: string; total: number; completed: number }>;
  leavesByMonth: Array<{ month: string; count: number }>;
  employeesByDepartment: Array<{ department: string; count: number }>;
}

const roomColors: Record<string, string> = {
  'Horizon': '#6366F1',
  'Summit': '#10B981',
  'Spark': '#F59E0B',
  'Vista': '#F43F5E',
  'Focus': '#0EA5E9',
};

const priorityBadgeStyles = (p: string) => {
  const map: Record<string, { bg: string, text: string, border: string, indicator: string }> = {
    urgent: { bg: 'rgba(254, 226, 226, 0.7)', text: '#EF4444', border: '#FCA5A5', indicator: '#EF4444' },
    high: { bg: 'rgba(255, 237, 213, 0.7)', text: '#F97316', border: '#FDBA74', indicator: '#F97316' },
    medium: { bg: 'rgba(239, 246, 255, 0.7)', text: '#3B82F6', border: '#93C5FD', indicator: '#3B82F6' },
    low: { bg: 'rgba(241, 245, 249, 0.7)', text: '#64748B', border: '#CBD5E1', indicator: '#94A3B8' }
  };
  return map[p] || { bg: 'rgba(241, 245, 249, 0.7)', text: '#64748B', border: '#CBD5E1', indicator: '#94A3B8' };
};

const statusBadgeStyles = (s: string) => {
  const map: Record<string, { bg: string, text: string, border: string }> = {
    'todo': { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
    'in-progress': { bg: '#EFF6FF', text: '#2563EB', border: '#DBEAFE' },
    'review': { bg: '#F5F3FF', text: '#7C3AED', border: '#EDE9FE' },
    'done': { bg: '#ECFDF5', text: '#059669', border: '#D1FAE5' }
  };
  return map[s] || { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
};

export default function DashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartsData, setChartsData] = useState<ChartsData | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/dashboard/charts', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ])
      .then(([statsData, chartsRes]) => { 
        if (statsData.success) setStats(statsData.data); 
        if (chartsRes.success) setChartsData(chartsRes.data);
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, [token]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const priorityBadge = (p: string) => {
    const map: Record<string, string> = { urgent: 'badge-danger', high: 'badge-warning', medium: 'badge-info', low: 'badge-neutral' };
    return map[p] || 'badge-neutral';
  };



  if (loading) {
    return (
      <div data-testid="dashboard-loading">
        <div className="skeleton" style={{ height: 120, marginBottom: 24, borderRadius: 'var(--radius-xl)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Welcome Banner */}
      <div className="animate-fadeInUp" data-testid="welcome-banner" style={{
        background: 'linear-gradient(135deg, var(--primary-600) 0%, #4F46E5 100%)',
        color: 'var(--text-inverse)',
        padding: 'var(--space-6) var(--space-8)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-overlay)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 'var(--space-2)'
      }}>
        {/* Subtle decorative background circles */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 240, height: 240, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40%', right: '10%', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', pointerEvents: 'none' }} />
        
        <div style={{ zIndex: 1 }}>
          <h2 style={{ fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: 'white', fontFamily: 'var(--font-display)' }}>
            {greeting()}, {user?.firstName}!
          </h2>
          <p style={{ opacity: 0.9, marginTop: 6, fontSize: 'var(--text-base)' }}>
            Welcome back! Here is what is happening in your portal today.
          </p>
        </div>
        <div style={{ zIndex: 1, textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'white' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </span>
          <span style={{ opacity: 0.8, fontSize: 'var(--text-sm)' }}>
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="dashboard-grid">
        
        {/* LEFT COLUMN: Stats + Analytics or Employee Main Boards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Stat Cards */}
          <div className="dashboard-stats stagger-children" data-testid="stat-cards" style={{ margin: 0 }}>
            {isAdminOrManager ? (
              <>
                {/* Card 1: Total Employees */}
                <div 
                  className="stat-card" 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                  onClick={() => router.push('/employees')}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-overlay)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  data-testid="stat-employees"
                >
                  <div>
                    <div className="stat-card-value">{stats?.totalEmployees || 0}</div>
                    <div className="stat-card-label">Total Employees</div>
                  </div>
                  <div className="stat-card-icon" style={{ margin: 0, padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--primary-50)' }}>
                    <Users size={24} className="text-primary-600" />
                  </div>
                </div>

                {/* Card 2: Pending Leaves */}
                <div 
                  className="stat-card" 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                  onClick={() => router.push('/leave')}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-overlay)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  data-testid="stat-leaves"
                >
                  <div>
                    <div className="stat-card-value">{stats?.pendingLeaves || 0}</div>
                    <div className="stat-card-label">Pending Leaves</div>
                  </div>
                  <div className="stat-card-icon" style={{ margin: 0, padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--warning-bg)' }}>
                    <ClipboardList size={24} className="text-warning-600" />
                  </div>
                </div>

                {/* Card 3: Today's Meetings */}
                <div 
                  className="stat-card" 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                  onClick={() => router.push('/meetings')}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-overlay)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  data-testid="stat-meetings"
                >
                  <div>
                    <div className="stat-card-value">{stats?.todayMeetings || 0}</div>
                    <div className="stat-card-label">Today's Meetings</div>
                  </div>
                  <div className="stat-card-icon" style={{ margin: 0, padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--info-bg)' }}>
                    <Calendar size={24} className="text-info-600" />
                  </div>
                </div>

                {/* Card 4: Open Tasks */}
                <div 
                  className="stat-card" 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                  onClick={() => router.push('/tasks')}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-overlay)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  data-testid="stat-tasks"
                >
                  <div>
                    <div className="stat-card-value">{stats?.openTasks || 0}</div>
                    <div className="stat-card-label">Open Tasks</div>
                  </div>
                  <div className="stat-card-icon" style={{ margin: 0, padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', backgroundColor: '#EDE9FE' }}>
                    <CheckSquare size={24} style={{ color: '#7C3AED' }} />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Card 1: My Approved Leaves */}
                <div 
                  className="stat-card" 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                  onClick={() => router.push('/leave')}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-overlay)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  data-testid="stat-employees"
                >
                  <div>
                    <div className="stat-card-value">{stats?.approvedLeaves || 0}</div>
                    <div className="stat-card-label">My Approved Leaves</div>
                  </div>
                  <div className="stat-card-icon" style={{ margin: 0, padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--success-bg)' }}>
                    <PartyPopper size={24} className="text-success" />
                  </div>
                </div>

                {/* Card 2: My Pending Leaves */}
                <div 
                  className="stat-card" 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                  onClick={() => router.push('/leave')}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-overlay)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  data-testid="stat-leaves"
                >
                  <div>
                    <div className="stat-card-value">{stats?.pendingLeaves || 0}</div>
                    <div className="stat-card-label">My Pending Leaves</div>
                  </div>
                  <div className="stat-card-icon" style={{ margin: 0, padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--warning-bg)' }}>
                    <ClipboardList size={24} className="text-warning-600" />
                  </div>
                </div>

                {/* Card 3: My Meetings Today */}
                <div 
                  className="stat-card" 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                  onClick={() => router.push('/meetings')}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-overlay)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  data-testid="stat-meetings"
                >
                  <div>
                    <div className="stat-card-value">{stats?.todayMeetings || 0}</div>
                    <div className="stat-card-label">My Meetings Today</div>
                  </div>
                  <div className="stat-card-icon" style={{ margin: 0, padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--info-bg)' }}>
                    <Calendar size={24} className="text-info-600" />
                  </div>
                </div>

                {/* Card 4: My Open Tasks */}
                <div 
                  className="stat-card" 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                  onClick={() => router.push('/tasks')}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-overlay)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  data-testid="stat-tasks"
                >
                  <div>
                    <div className="stat-card-value">{stats?.openTasks || 0}</div>
                    <div className="stat-card-label">My Open Tasks</div>
                  </div>
                  <div className="stat-card-icon" style={{ margin: 0, padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', backgroundColor: '#EDE9FE' }}>
                    <CheckSquare size={24} style={{ color: '#7C3AED' }} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Main Left Content based on Role */}
          {isAdminOrManager ? (
            /* Admin/Manager Analytics Charts */
            chartsData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <PieChart size={22} className="text-primary-600" />
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Analytics Overview</h3>
                </div>

                {/* Row 1: Line Chart + Doughnut Chart */}
                <div className="dashboard-grid" style={{ margin: 0 }}>
                  {/* Leave Trends (Line) */}
                  <div className="card" style={{ height: '100%' }}>
                    <div className="card-header"><span className="card-header-title">Leave Trends (Last 6 Months)</span></div>
                    <div className="card-body" style={{ height: 260 }}>
                      <Line 
                        data={{
                          labels: chartsData.leavesByMonth.map(d => d.month),
                          datasets: [{
                            label: 'Approved Leaves',
                            data: chartsData.leavesByMonth.map(d => d.count),
                            borderColor: '#8B5CF6',
                            backgroundColor: 'rgba(139, 92, 246, 0.05)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                          }]
                        }}
                        options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }}
                      />
                    </div>
                  </div>

                  {/* Task Distribution (Doughnut) */}
                  <div className="card" style={{ height: '100%' }}>
                    <div className="card-header"><span className="card-header-title">Task Distribution</span></div>
                    <div className="card-body" style={{ height: 260, display: 'flex', justifyContent: 'center' }}>
                      <Doughnut 
                        data={{
                          labels: chartsData.tasksByStatus.map(d => d.label),
                          datasets: [{
                            data: chartsData.tasksByStatus.map(d => d.count),
                            backgroundColor: ['#94A3B8', '#3B82F6', '#F59E0B', '#10B981'],
                            borderWidth: 0,
                          }]
                        }}
                        options={{ maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } }}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Bar Chart + Doughnut Chart */}
                <div className="dashboard-grid" style={{ margin: 0 }}>
                  {/* Tasks by Department (Bar) */}
                  <div className="card" style={{ height: '100%' }}>
                    <div className="card-header"><span className="card-header-title">Tasks by Department</span></div>
                    <div className="card-body" style={{ height: 260 }}>
                      <Bar 
                        data={{
                          labels: chartsData.tasksByDepartment.map(d => d.department),
                          datasets: [
                            { label: 'Completed', data: chartsData.tasksByDepartment.map(d => d.completed), backgroundColor: '#10B981', borderRadius: 4 },
                            { label: 'Total', data: chartsData.tasksByDepartment.map(d => d.total), backgroundColor: '#E2E8F0', borderRadius: 4 }
                          ]
                        }}
                        options={{ maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { position: 'bottom' } }, scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } } }}
                      />
                    </div>
                  </div>

                  {/* Headcount by Department (Doughnut) */}
                  <div className="card" style={{ height: '100%' }}>
                    <div className="card-header"><span className="card-header-title">Headcount by Department</span></div>
                    <div className="card-body" style={{ height: 260, display: 'flex', justifyContent: 'center' }}>
                      <Doughnut 
                        data={{
                          labels: chartsData.employeesByDepartment.map(d => d.department),
                          datasets: [{
                            data: chartsData.employeesByDepartment.map(d => d.count),
                            backgroundColor: ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#8B5CF6'],
                            borderWidth: 0,
                          }]
                        }}
                        options={{ maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Employee Main Boards (Highly visual card/list layout) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              
              {/* My Tasks Board */}
              <div className="card animate-fadeInUp" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                <div className="card-header" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  borderBottom: '1px solid var(--border-default)',
                  padding: 'var(--space-4) var(--space-5)',
                  backgroundColor: 'var(--bg-surface)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <CheckSquare size={20} className="text-primary-600" />
                    <span className="card-header-title" style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>My Tasks Board</span>
                    <span style={{ 
                      fontSize: 'var(--text-xs)', 
                      fontWeight: 600, 
                      backgroundColor: 'var(--primary-50)', 
                      color: 'var(--primary-700)', 
                      padding: '2px 8px', 
                      borderRadius: 'var(--radius-full)' 
                    }}>
                      {stats?.myTasks?.length || 0} active
                    </span>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => router.push('/tasks')} style={{ fontWeight: 600 }}>View All</button>
                </div>
                <div className="card-body" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {stats?.myTasks?.length ? (
                    stats.myTasks.map(t => {
                      const pStyle = priorityBadgeStyles(t.priority);
                      const sStyle = statusBadgeStyles(t.status);
                      return (
                        <div 
                          key={t.id}
                          onClick={() => router.push(`/tasks?id=${t.id}`)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 'var(--space-4)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-default)',
                            borderLeft: `4px solid ${pStyle.indicator}`,
                            background: 'var(--bg-surface)',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateX(4px)';
                            e.currentTarget.style.borderColor = 'var(--primary-300)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.borderColor = 'var(--border-default)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
                            {t.status === 'done' ? (
                              <CheckCircle2 size={18} className="text-success" style={{ flexShrink: 0 }} />
                            ) : (
                              <Circle size={18} className="text-muted" style={{ flexShrink: 0 }} />
                            )}
                            <div style={{ minWidth: 0 }}>
                              <div style={{ 
                                fontWeight: 600, 
                                fontSize: 'var(--text-sm)', 
                                color: 'var(--text-primary)', 
                                textDecoration: t.status === 'done' ? 'line-through' : 'none',
                                opacity: t.status === 'done' ? 0.7 : 1,
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis' 
                              }}>
                                {t.title}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 4 }}>
                                <span style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 4, 
                                  fontSize: '11px', 
                                  color: 'var(--text-secondary)' 
                                }}>
                                  <Calendar size={12} />
                                  Due: {t.dueDate || 'No date'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
                            {/* Priority Badge */}
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: pStyle.bg,
                              color: pStyle.text,
                              border: `1px solid ${pStyle.border}`
                            }}>
                              {t.priority}
                            </span>
                            {/* Status Badge */}
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: sStyle.bg,
                              color: sStyle.text,
                              border: `1px solid ${sStyle.border}`
                            }}>
                              {t.status.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                      <div className="empty-state-icon"><PartyPopper size={40} className="text-success" /></div>
                      <div className="empty-state-title">All caught up!</div>
                      <p className="empty-state-desc" style={{ color: 'var(--text-secondary)' }}>You have no pending tasks assigned.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* My Upcoming Meetings Board */}
              <div className="card animate-fadeInUp" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                <div className="card-header" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  borderBottom: '1px solid var(--border-default)',
                  padding: 'var(--space-4) var(--space-5)',
                  backgroundColor: 'var(--bg-surface)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Calendar size={20} className="text-primary-600" />
                    <span className="card-header-title" style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>My Upcoming Meetings</span>
                    <span style={{ 
                      fontSize: 'var(--text-xs)', 
                      fontWeight: 600, 
                      backgroundColor: 'var(--info-bg)', 
                      color: 'var(--info)', 
                      padding: '2px 8px', 
                      borderRadius: 'var(--radius-full)' 
                    }}>
                      {stats?.upcomingMeetings?.length || 0} scheduled
                    </span>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => router.push('/meetings')} style={{ fontWeight: 600 }}>Book Room</button>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-5)' }}>
                  {stats?.upcomingMeetings?.length ? (
                    stats.upcomingMeetings.map(m => {
                      const rColor = roomColors[m.roomName] || '#6366F1';
                      return (
                        <div 
                          key={m.id} 
                          onClick={() => router.push('/meetings')}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 'var(--space-4)', 
                            padding: 'var(--space-4)', 
                            borderRadius: 'var(--radius-lg)', 
                            backgroundColor: 'var(--bg-surface)', 
                            border: '1px solid var(--border-default)',
                            borderLeft: `4px solid ${rColor}`,
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateX(4px)';
                            e.currentTarget.style.borderColor = 'var(--primary-300)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.borderColor = 'var(--border-default)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                          }}
                        >
                          {/* Time Indicator Block */}
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            padding: 'var(--space-2) var(--space-3)', 
                            borderRadius: 'var(--radius-md)', 
                            backgroundColor: `${rColor}15`, 
                            color: rColor,
                            minWidth: 90,
                            textAlign: 'center',
                            border: `1px solid ${rColor}30`
                          }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.05em' }}>Time</span>
                            <span style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>{m.startTime}</span>
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <MapPin size={12} style={{ color: rColor }} />
                                Room: <strong style={{ color: 'var(--text-primary)' }}>{m.roomName}</strong>
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Calendar size={12} />
                                Date: {m.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                      <div className="empty-state-icon"><Calendar size={40} className="text-muted" /></div>
                      <div className="empty-state-title">No upcoming meetings</div>
                      <p className="empty-state-desc" style={{ color: 'var(--text-secondary)' }}>You are free for the next couple of days.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Quick Actions + Widgets (depending on role) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Quick Actions Card */}
          <div className="card" data-testid="quick-actions">
            <div className="card-header">
              <span className="card-header-title flex items-center gap-2">Quick Actions</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { icon: <CalendarDays size={18} className="text-primary-600" />, label: 'New Leave Request', href: '/leave', desc: 'Submit a new leave application' },
                { icon: <Calendar size={18} className="text-info-600" />, label: 'Book Meeting Room', href: '/meetings', desc: 'Reserve a room for discussions' },
                { icon: <CheckSquare size={18} style={{ color: '#7C3AED' }} />, label: 'Create Task', href: '/tasks', desc: 'Assign a new task to team members' },
              ].map(a => (
                <button
                  key={a.label}
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    height: 'auto',
                    width: '100%',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    e.currentTarget.style.borderColor = 'var(--border-focus)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                  }}
                  onClick={() => router.push(a.href)}
                  data-testid={`quick-${a.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {a.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{a.label}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Admin/Manager specific sidebar widgets */}
          {isAdminOrManager && (
            <>
              {/* Upcoming Meetings (Small) */}
              <div className="card">
                <div className="card-header">
                  <span className="card-header-title flex items-center gap-2"><Calendar size={18} className="text-primary-600" /> Upcoming Meetings</span>
                </div>
                <div className="card-body" data-testid="upcoming-meetings" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {stats?.upcomingMeetings?.length ? stats.upcomingMeetings.map((m) => (
                    <div key={m.id} className="upcoming-meeting-item">
                      <span className="upcoming-meeting-time" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, minWidth: 45, color: 'var(--primary-600)' }}>{m.startTime}</span>
                      <div className="upcoming-meeting-info">
                        <div className="upcoming-meeting-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{m.title}</div>
                        <div className="upcoming-meeting-room" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>{m.roomName} · {m.date}</div>
                      </div>
                    </div>
                  )) : <div className="empty-state" style={{ padding: 'var(--space-6)' }}><div className="empty-state-icon"><Calendar size={32} className="text-muted" /></div><div className="empty-state-title">No upcoming meetings</div></div>}
                </div>
              </div>

              {/* My Tasks (Small) */}
              <div className="card">
                <div className="card-header">
                  <span className="card-header-title flex items-center gap-2"><CheckSquare size={18} className="text-primary-600" /> My Tasks</span>
                </div>
                <div className="card-body" data-testid="my-tasks" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {stats?.myTasks?.length ? stats.myTasks.map((t) => (
                    <div key={t.id} className="upcoming-meeting-item" style={{ alignItems: 'center' }}>
                      <span className={`badge ${priorityBadge(t.priority)}`} style={{ textTransform: 'capitalize', padding: '2px 8px', fontSize: '10px' }}>{t.priority}</span>
                      <div className="upcoming-meeting-info" style={{ flex: 1 }}>
                        <div className="upcoming-meeting-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</div>
                        <div className="upcoming-meeting-room" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>Due: {t.dueDate || 'No date'}</div>
                      </div>
                    </div>
                  )) : <div className="empty-state" style={{ padding: 'var(--space-6)' }}><div className="empty-state-icon"><PartyPopper size={32} className="text-success" /></div><div className="empty-state-title">All caught up!</div></div>}
                </div>
              </div>
            </>
          )}

          {/* Recent Activity (Everyone) */}
          <div className="card">
            <div className="card-header">
              <span className="card-header-title flex items-center gap-2"><Activity size={18} className="text-primary-600" /> Recent Activity</span>
            </div>
            <div className="card-body">
              <div className="activity-timeline" data-testid="recent-activity" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {stats?.recentActivities?.length ? stats.recentActivities.map((a, idx, arr) => (
                  <div key={a.id} className="activity-item" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', borderBottom: idx === arr.length - 1 ? 'none' : '1px solid var(--border-default)', paddingBottom: idx === arr.length - 1 ? 0 : 'var(--space-3)' }}>
                    <div className="activity-dot" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary-500)', marginTop: 6 }} />
                    <div style={{ flex: 1 }}>
                      <div className="activity-text" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{a.message}</div>
                      <div className="activity-time" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{timeAgo(a.timestamp)}</div>
                    </div>
                  </div>
                )) : <div className="empty-state"><div className="empty-state-icon"><Inbox size={32} className="text-muted" /></div><div className="empty-state-title">No recent activity</div></div>}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

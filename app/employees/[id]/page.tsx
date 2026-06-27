'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Building2, Briefcase, Calendar, CheckSquare, Clock, ClipboardList, Star } from 'lucide-react';

interface ProfileData {
  employee: { id: string; firstName: string; lastName: string; email: string; department: string; position: string; phone: string; role: string; joinDate: string; status: string; avatar?: string };
  leaveHistory: Array<{ id: string; type: string; startDate: string; endDate: string; reason: string; status: string; createdAt: string }>;
  tasks: Array<{ id: string; title: string; priority: string; status: string; dueDate: string; tags: string[] }>;
  stats: { totalTasks: number; completedTasks: number; inProgressTasks: number; reviewTasks: number; leaveDaysUsed: number; leaveDaysPending: number };
}

function getAvatarColor(name: string) { 
  let h = 0; 
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h); 
  return `hsl(${Math.abs(h % 360)}, 65%, 55%)`; 
}

const statusBadgeStyles = (s: string) => {
  const map: Record<string, { bg: string, text: string }> = {
    approved: { bg: 'rgba(16, 185, 129, 0.08)', text: 'var(--success)' },
    pending: { bg: 'rgba(245, 158, 11, 0.08)', text: 'var(--warning)' },
    rejected: { bg: 'rgba(239, 68, 68, 0.08)', text: 'var(--danger)' },
    active: { bg: 'rgba(16, 185, 129, 0.08)', text: 'var(--success)' },
    inactive: { bg: 'rgba(239, 68, 68, 0.08)', text: 'var(--danger)' }
  };
  return map[s] || { bg: 'var(--bg-hover)', text: 'var(--text-secondary)' };
};

const priorityBadgeStyles = (p: string) => {
  const map: Record<string, { bg: string, text: string, indicator: string }> = {
    urgent: { bg: 'rgba(239, 68, 68, 0.08)', text: 'var(--danger)', indicator: 'var(--danger)' },
    high: { bg: 'rgba(245, 158, 11, 0.08)', text: 'var(--warning)', indicator: 'var(--warning)' },
    medium: { bg: 'rgba(59, 130, 246, 0.08)', text: 'var(--info)', indicator: 'var(--info)' },
    low: { bg: 'rgba(148, 163, 184, 0.08)', text: 'var(--text-secondary)', indicator: 'var(--text-muted)' }
  };
  return map[p] || { bg: 'var(--bg-hover)', text: 'var(--text-secondary)', indicator: 'var(--text-muted)' };
};

const taskStatusLabel = (s: string) => ({ todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' }[s] || s);

export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { token } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [empId, setEmpId] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => { params.then(p => setEmpId(p.id)); }, [params]);

  const fetchProfile = useCallback(async () => {
    if (!token || !empId) return;
    if (!hasLoadedRef.current) setLoading(true);
    try {
      const res = await fetch(`/api/employees/${empId}/profile`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setProfile(data.data); hasLoadedRef.current = true; }
    } catch (err) { console.error('Error fetching profile:', err); }
    finally { setLoading(false); }
  }, [token, empId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  if (loading) {
    return (
      <div data-testid="profile-loading" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-xl)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="empty-state" data-testid="profile-not-found" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-12)' }}>
        <div className="empty-state-icon" style={{ marginBottom: 'var(--space-4)', color: 'var(--text-muted)' }}><Building2 size={48} /></div>
        <div className="empty-state-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Employee not found</div>
        <button className="btn btn-primary" onClick={() => router.push('/employees')}>Back to Directory</button>
      </div>
    );
  }

  const { employee: emp, leaveHistory, tasks, stats } = profile;
  const fullName = `${emp.firstName} ${emp.lastName}`;
  const avatarColor = getAvatarColor(fullName);

  return (
    <div data-testid="employee-profile-page" className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Back button */}
      <div>
        <button 
          className="btn btn-ghost" 
          onClick={() => router.push('/employees')} 
          data-testid="back-to-employees"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontWeight: 600,
            padding: '8px 14px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>
      </div>

      {/* Profile Header Card */}
      <div 
        className="card relative overflow-hidden animate-fadeInUp" 
        style={{ 
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-sm)'
        }} 
        data-testid="profile-header"
      >
        {/* Dynamic header cover background */}
        <div style={{ height: '70px', background: `linear-gradient(135deg, ${avatarColor} 0%, rgba(255,255,255,0) 100%)`, opacity: 0.12 }} />
        
        <div style={{ padding: 'var(--space-5)', marginTop: '-32px', display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
          <div 
            className="avatar" 
            style={{ 
              background: avatarColor, 
              width: 76, 
              height: 76, 
              fontSize: '24px', 
              fontWeight: 800, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: '50%', 
              color: '#fff', 
              flexShrink: 0,
              border: '4px solid var(--bg-surface)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {emp.avatar ? (
              <img src={emp.avatar} alt={fullName} />
            ) : (
              `${emp.firstName[0]}${emp.lastName[0]}`
            )}
          </div>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {fullName}
              </h2>
              
              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: statusBadgeStyles(emp.status).bg,
                  color: statusBadgeStyles(emp.status).text
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: statusBadgeStyles(emp.status).text }} />
                {emp.status}
              </span>

              <span 
                className="badge" 
                style={{ 
                  padding: '3px 8px', 
                  fontSize: '10px', 
                  fontWeight: 700, 
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                  color: '#4F46E5',
                  borderRadius: 'var(--radius-md)',
                  textTransform: 'uppercase'
                }}
              >
                {emp.role}
              </span>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500, margin: 0 }}>
              {emp.position} · {emp.department}
            </p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div 
        className="stagger-children" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: 'var(--space-4)' 
        }} 
        data-testid="profile-info"
      >
        {[
          { icon: <Mail size={16} />, label: 'Email Address', value: emp.email, isLink: true, linkHref: `mailto:${emp.email}` },
          { icon: <Phone size={16} />, label: 'Phone Number', value: emp.phone || 'Not set', isLink: !!emp.phone, linkHref: `tel:${emp.phone}` },
          { icon: <Building2 size={16} />, label: 'Department', value: emp.department },
          { icon: <Briefcase size={16} />, label: 'Job Position', value: emp.position },
          { icon: <Calendar size={16} />, label: 'Join Date', value: emp.joinDate },
          { icon: <Star size={16} />, label: 'Account Permission', value: emp.role.charAt(0).toUpperCase() + emp.role.slice(1) },
        ].map(info => (
          <div 
            key={info.label} 
            className="card" 
            style={{ 
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div 
                style={{ 
                  width: 34, 
                  height: 34, 
                  borderRadius: 'var(--radius-lg)', 
                  background: 'rgba(79, 70, 229, 0.06)', 
                  color: '#4F46E5',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0 
                }}
              >
                {info.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {info.label}
                </div>
                {info.isLink ? (
                  <a 
                    href={info.linkHref} 
                    style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: '#4F46E5', textDecoration: 'none', wordBreak: 'break-all' }}
                    className="hover:underline"
                  >
                    {info.value}
                  </a>
                ) : (
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                    {info.value}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div 
        className="dashboard-stats stagger-children" 
        style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
          margin: 0
        }} 
        data-testid="profile-stats"
      >
        {[
          { label: 'Total Tasks', value: stats.totalTasks, icon: <CheckSquare size={20} />, color: '#4F46E5', bg: 'rgba(79, 70, 229, 0.06)' },
          { label: 'Completed Tasks', value: stats.completedTasks, icon: <CheckSquare size={20} />, color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.06)' },
          { label: 'In Progress Tasks', value: stats.inProgressTasks, icon: <Clock size={20} />, color: 'var(--info)', bg: 'rgba(14, 165, 233, 0.06)' },
          { label: 'Leave Days Used', value: stats.leaveDaysUsed, icon: <ClipboardList size={20} />, color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.06)' }
        ].map((item, idx) => (
          <div 
            key={idx}
            className="stat-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-4) var(--space-5)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.label}
              </span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {item.value}
              </span>
            </div>
            
            <div 
              style={{ 
                width: 38, 
                height: 38, 
                borderRadius: 'var(--radius-lg)', 
                backgroundColor: item.bg, 
                color: item.color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout: Tasks + Leave History */}
      <div className="dashboard-grid">
        {/* Assigned Tasks */}
        <div 
          className="card" 
          data-testid="profile-tasks"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}
        >
          <div className="card-header" style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-default)' }}>
            <span className="card-header-title flex items-center gap-2" style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
              <CheckSquare size={18} style={{ color: '#4F46E5' }} /> Assigned Tasks ({tasks.length})
            </span>
          </div>
          
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: 400, overflowY: 'auto', padding: 'var(--space-5)' }}>
            {tasks.length ? tasks.map(t => {
              const pStyles = priorityBadgeStyles(t.priority);
              return (
                <div 
                  key={t.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--space-3)', 
                    padding: 'var(--space-3) var(--space-4)', 
                    borderRadius: 'var(--radius-lg)', 
                    background: 'rgba(248, 250, 252, 0.5)', 
                    border: '1px solid var(--border-default)',
                    borderLeft: `4px solid ${pStyles.indicator}` 
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.title}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span 
                        style={{ 
                          fontSize: '9px', 
                          fontWeight: 700, 
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: pStyles.bg,
                          color: pStyles.text
                        }}
                      >
                        {t.priority}
                      </span>
                      
                      <span 
                        style={{ 
                          fontSize: '9px', 
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-hover)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {taskStatusLabel(t.status)}
                      </span>
                      
                      {t.dueDate && (
                        <span 
                          style={{ 
                            fontSize: '9px', 
                            fontWeight: 500,
                            padding: '2px 6px',
                            color: 'var(--text-muted)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Calendar size={10} />
                          Due: {t.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-state-title" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>No tasks assigned</div>
              </div>
            )}
          </div>
        </div>

        {/* Leave History */}
        <div 
          className="card" 
          data-testid="profile-leaves"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}
        >
          <div className="card-header" style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-default)' }}>
            <span className="card-header-title flex items-center gap-2" style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
              <ClipboardList size={18} style={{ color: '#4F46E5' }} /> Leave History ({leaveHistory.length})
            </span>
          </div>
          
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: 400, overflowY: 'auto', padding: 'var(--space-5)' }}>
            {leaveHistory.length ? leaveHistory.map(l => {
              const sStyles = statusBadgeStyles(l.status);
              return (
                <div 
                  key={l.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: 'var(--space-3) var(--space-4)', 
                    borderRadius: 'var(--radius-lg)', 
                    background: 'rgba(248, 250, 252, 0.5)',
                    border: '1px solid var(--border-default)' 
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span 
                        style={{ 
                          fontSize: '10px', 
                          fontWeight: 700, 
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          backgroundColor: 'var(--bg-hover)',
                          color: 'var(--text-secondary)',
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        {l.type}
                      </span>
                      
                      <span 
                        style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10px', 
                          fontWeight: 700, 
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: sStyles.bg,
                          color: sStyles.text
                        }}
                      >
                        <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: sStyles.text }} />
                        {l.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={11} /> {l.startDate} → {l.endDate}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-state-title" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>No leave history</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import CustomSelect from '@/components/ui/CustomSelect';
import { CalendarDays, Thermometer, User, Home, ClipboardList, Check, X, Trash2, Plus, Filter } from 'lucide-react';

interface LeaveData { id: string; userId: string; userName: string; type: string; startDate: string; endDate: string; reason: string; status: string; reviewerName?: string; reviewNote?: string; createdAt: string; }

const typeIcons: Record<string, React.ReactNode> = { 
  annual: <CalendarDays size={14} />, 
  sick: <Thermometer size={14} />, 
  personal: <User size={14} />, 
  remote: <Home size={14} /> 
};

const leaveTypeLabels: Record<string, string> = {
  annual: 'Annual Leave',
  sick: 'Sick Leave',
  personal: 'Personal Leave',
  remote: 'Remote Work'
};

const statusBadgeClasses = (s: string) => {
  const map: Record<string, string> = {
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30',
    pending: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30',
    rejected: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30'
  };
  return map[s] || 'bg-slate-50 text-slate-700 border-slate-100';
};

const leaveStatusColors: Record<string, { text: string, bg: string, border: string }> = {
  approved: { text: '#059669', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.18)' },
  pending: { text: '#D97706', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.22)' },
  rejected: { text: '#DC2626', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.18)' }
};

const leaveTypeColors: Record<string, { stroke: string, bg: string, text: string }> = {
  annual: { stroke: '#4F46E5', bg: 'rgba(79, 70, 229, 0.08)', text: '#4F46E5' },
  sick: { stroke: '#F97316', bg: 'rgba(249, 115, 22, 0.08)', text: '#F97316' },
  personal: { stroke: '#EC4899', bg: 'rgba(236, 72, 153, 0.08)', text: '#EC4899' },
  remote: { stroke: '#0EA5E9', bg: 'rgba(14, 165, 233, 0.08)', text: '#0EA5E9' }
};

const leaveTypeBadgeStyle = (type: string) => {
  const color = leaveTypeColors[type] || { bg: 'rgba(241, 245, 249, 0.8)', text: '#64748B' };
  return {
    backgroundColor: color.bg,
    border: `1px solid ${color.text}33`,
    color: color.text
  };
};

const leaveStatusTextStyle = (status: string) => {
  const color = leaveStatusColors[status] || { text: '#64748B' };
  return { color: color.text };
};

// CustomSelect is imported from components/ui/CustomSelect

export default function LeavePage() {
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const [leaves, setLeaves] = useState<LeaveData[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('my');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState<LeaveData | null>(null);
  const [form, setForm] = useState({ type: 'annual', startDate: '', endDate: '', reason: '' });
  const [approveAction, setApproveAction] = useState<'approve' | 'reject'>('approve');
  const [approveNote, setApproveNote] = useState('');

  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';

  const fetchLeaves = useCallback(async (silent = false) => {
    if (!token) return;
    const showLoader = !silent && !hasLoadedRef.current;
    if (showLoader) setLoading(true);
    const params = new URLSearchParams({ view: activeTab, status: statusFilter, type: typeFilter });
    try {
      const res = await fetch(`/api/leave?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setLeaves(data.data);
        hasLoadedRef.current = true;
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [token, activeTab, statusFilter, typeFilter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  // Listen to global open-add-leave event from Header
  useEffect(() => {
    const handleOpenCreate = () => {
      setShowCreateModal(true);
    };
    window.addEventListener('open-add-leave', handleOpenCreate);
    return () => window.removeEventListener('open-add-leave', handleOpenCreate);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/leave', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.success) {
      addToast({ type: 'success', title: 'Leave request submitted' });
      setShowCreateModal(false);
      setForm({ type: 'annual', startDate: '', endDate: '', reason: '' });
      fetchLeaves(true); // Silent reload
    }
    else addToast({ type: 'error', title: 'Error', message: data.error });
  };

  const handleApprove = async () => {
    if (!showApproveModal) return;
    const originalLeaves = [...leaves];
    const targetId = showApproveModal.id;
    const nextStatus = approveAction === 'approve' ? 'approved' : 'rejected';

    // Optimistic UI Update
    setLeaves(prev => prev.map(l => l.id === targetId ? { ...l, status: nextStatus } : l));
    setShowApproveModal(null);
    setApproveNote('');

    try {
      const res = await fetch(`/api/leave/${targetId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: approveAction, note: approveNote })
      });
      const data = await res.json();
      if (data.success) {
        addToast({ type: 'success', title: `Leave request ${approveAction}d` });
        fetchLeaves(true); // Silent sync in background
      } else {
        setLeaves(originalLeaves);
        addToast({ type: 'error', title: 'Error approving request', message: data.error });
      }
    } catch (err) {
      setLeaves(originalLeaves);
      addToast({ type: 'error', title: 'Network Error', message: 'Failed to connect to the server.' });
    }
  };

  const handleDelete = async (id: string) => {
    const originalLeaves = [...leaves];

    // Optimistic UI Update: remove from local list immediately
    setLeaves(prev => prev.filter(l => l.id !== id));

    try {
      const res = await fetch(`/api/leave/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        addToast({ type: 'success', title: 'Leave request deleted' });
        fetchLeaves(true); // Silent sync
      } else {
        setLeaves(originalLeaves);
        addToast({ type: 'error', title: 'Error deleting request', message: data.error });
      }
    } catch (err) {
      setLeaves(originalLeaves);
      addToast({ type: 'error', title: 'Network Error', message: 'Failed to connect to the server.' });
    }
  };

  // Static leave limits for visual premium indicators
  const leaveBalances = [
    { type: 'annual', value: 12, max: 15, icon: <CalendarDays size={20} /> },
    { type: 'sick', value: 8, max: 10, icon: <Thermometer size={20} /> },
    { type: 'personal', value: 3, max: 5, icon: <User size={20} /> },
    { type: 'remote', value: 20, max: 30, icon: <Home size={20} /> }
  ];

  return (
    <div data-testid="leave-page" className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* Bento Stats Indicators */}
      <div 
        className="dashboard-stats stagger-children" 
        data-testid="leave-balance"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
          margin: 0
        }}
      >
        {leaveBalances.map(b => {
          const colors = leaveTypeColors[b.type];
          const percent = (b.value / b.max) * 100;
          return (
            <div 
              key={b.type} 
              className="stat-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-5)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-overlay)';
                e.currentTarget.style.borderColor = 'var(--border-focus)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {leaveTypeLabels[b.type]}
                </span>
                <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {b.value} <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-muted)' }}>/ {b.max} days</span>
                </span>
              </div>

              {/* Circle Progress Bar SVG */}
              <div style={{ position: 'relative', width: 50, height: 50 }}>
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(226, 232, 240, 0.6)" strokeWidth="4" />
                  <circle 
                    cx="25" cy="25" r="20" fill="none" 
                    stroke={colors.stroke} strokeWidth="4" 
                    strokeDasharray={2 * Math.PI * 20}
                    strokeDashoffset={2 * Math.PI * 20 * (1 - percent / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 25 25)"
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.text }}>
                  {b.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs & Filters bar (Perfect 40px Height Alignment) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        {/* Tabs */}
        <div 
          className="segmented-tabs" 
          data-testid="leave-tabs"
          style={{
            display: 'flex',
            gap: '2px',
            padding: '3px',
            backgroundColor: 'rgba(241, 245, 249, 0.7)',
            borderRadius: 'var(--radius-lg)',
            width: 'fit-content',
            border: '1px solid var(--border-default)',
            margin: 0,
            height: '40px',
            alignItems: 'center',
            minWidth: isManagerOrAdmin ? '292px' : '146px'
          }}
        >
          <button 
            className={`segmented-tab ${activeTab === 'my' ? 'active' : ''}`} 
            onClick={() => setActiveTab('my')} 
            data-testid="tab-my-requests"
            style={{
              height: '32px',
              padding: '0 16px',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              color: activeTab === 'my' ? 'var(--primary-700)' : 'var(--text-secondary)',
              backgroundColor: activeTab === 'my' ? 'var(--bg-surface)' : 'transparent',
              border: 'none',
              boxShadow: activeTab === 'my' ? 'var(--shadow-xs)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '140px'
            }}
          >
            My Requests
          </button>
          {isManagerOrAdmin && (
            <button 
              className={`segmented-tab ${activeTab === 'team' ? 'active' : ''}`} 
              onClick={() => setActiveTab('team')} 
              data-testid="tab-team-requests"
              style={{
                height: '32px',
                padding: '0 16px',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                color: activeTab === 'team' ? 'var(--primary-700)' : 'var(--text-secondary)',
                backgroundColor: activeTab === 'team' ? 'var(--bg-surface)' : 'transparent',
                border: 'none',
                boxShadow: activeTab === 'team' ? 'var(--shadow-xs)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '140px'
              }}
            >
              Team Requests
            </button>
          )}
        </div>

        {/* Filters and Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <CustomSelect 
            value={typeFilter}
            onChange={setTypeFilter}
            testId="leave-type-filter"
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'annual', label: 'Annual' },
              { value: 'sick', label: 'Sick' },
              { value: 'personal', label: 'Personal' },
              { value: 'remote', label: 'Remote' }
            ]}
            align="right"
          />
          <CustomSelect 
            value={statusFilter}
            onChange={setStatusFilter}
            testId="leave-status-filter"
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' }
            ]}
            align="right"
          />
        </div>
      </div>

      {/* Data Table */}
      <div 
        className="data-table-wrapper animate-fadeInUp"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.borderColor = 'var(--border-focus)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.borderColor = 'var(--border-default)';
        }}
      >
        <table className="data-table" data-testid="leave-table" role="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <colgroup>
            <col style={{ width: '15%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: 'rgba(248, 250, 252, 0.8)', borderBottom: '1px solid var(--border-default)' }}>
              <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: 'var(--space-4)', textAlign: 'right', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <td colSpan={6} style={{ padding: 'var(--space-4)' }}><div className="skeleton" style={{ height: 22, borderRadius: 'var(--radius-sm)' }} /></td>
                </tr>
              ))
            ) : leaves.length ? (
              leaves.map(l => (
                <tr 
                  key={l.id} 
                  data-testid={`leave-row-${l.id}`}
                  style={{ borderBottom: '1px solid var(--border-default)', transition: 'background-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(248, 250, 252, 0.4)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: 'var(--space-4)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    {l.userName}
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span 
                      className="badge" 
                      style={{ fontSize: 'var(--text-xs)', lineHeight: 1.4, display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', ...leaveTypeBadgeStyle(l.type) }}
                    >
                      {typeIcons[l.type]} {l.type.charAt(0).toUpperCase() + l.type.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    {l.startDate} <span style={{ color: 'var(--text-muted)' }}>-</span> {l.endDate}
                  </td>
                  <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 220 }}>
                    <span className="truncate block" title={l.reason}>{l.reason}</span>
                  </td>
                  <td style={{ padding: 'var(--space-4)', textAlign: 'left' }}>
                    <span 
                      className={`badge border ${statusBadgeClasses(l.status)}`}
                      style={{ fontSize: 'var(--text-xs)', lineHeight: 1.4, fontWeight: 700, textTransform: 'capitalize', padding: 0, border: 'none', background: 'transparent', justifyContent: 'flex-start', ...leaveStatusTextStyle(l.status) }}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '4px', justifyContent: 'flex-end' }}>
                      {activeTab === 'team' && l.status === 'pending' && isManagerOrAdmin && (
                        <>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            onClick={() => { setShowApproveModal(l); setApproveAction('approve'); }} 
                            data-testid={`approve-${l.id}`}
                            style={{ padding: '6px', borderRadius: 'var(--radius-md)', color: '#059669' }}
                            title="Approve Request"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            onClick={() => { setShowApproveModal(l); setApproveAction('reject'); }} 
                            data-testid={`reject-${l.id}`}
                            style={{ padding: '6px', borderRadius: 'var(--radius-md)', color: '#EF4444' }}
                            title="Reject Request"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      {l.status === 'pending' && l.userId === user?.id && (
                        <button 
                          className="btn btn-ghost btn-sm" 
                          onClick={() => handleDelete(l.id)} 
                          data-testid={`delete-leave-${l.id}`}
                          style={{ padding: '6px', borderRadius: 'var(--radius-md)', color: '#EF4444' }}
                          title="Delete Request"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
                  <div className="empty-state">
                    <div className="empty-state-icon" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', padding: 'var(--space-4)', borderRadius: '50%', marginBottom: 'var(--space-3)' }}><ClipboardList size={32} /></div>
                    <div className="empty-state-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>No Leave Requests Found</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', margin: '4px 0 0 0' }}>There are no records matching the criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Leave Request Modal */}
      {showCreateModal && (
        <div className="modal-overlay animate-fadeIn app-form-dialog-overlay" onClick={() => setShowCreateModal(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)', padding: 'var(--space-6)' }}>
          <div 
            className="modal app-form-dialog animate-scaleIn" 
            onClick={e => e.stopPropagation()} 
            role="dialog" 
            aria-labelledby="leave-modal-title"
            aria-modal="true"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: 'calc(100vh - 48px)',
              backgroundColor: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-2xl)',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden'
            }}
          >
            <div className="modal-header app-form-dialog-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border-default)', backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
              <h3 className="modal-title app-form-dialog-title" id="leave-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                New Leave Request
              </h3>
              <button 
                className="modal-close app-form-dialog-close" 
                onClick={() => setShowCreateModal(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form className="app-form-dialog-form" onSubmit={handleCreate} data-testid="leave-form" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', margin: 0 }}>
              <div className="modal-body app-form-dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-6)', overflowY: 'auto', flex: 1 }}>
                
                {/* Leave Type */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '6px' }}>Leave Type</label>
                  <CustomSelect
                    value={form.type}
                    onChange={val => setForm({ ...form, type: val })}
                    testId="leave-type"
                    width="100%"
                    icon={null}
                    options={[
                      { value: 'annual', label: 'Annual' },
                      { value: 'sick', label: 'Sick' },
                      { value: 'personal', label: 'Personal' },
                      { value: 'remote', label: 'Remote' }
                    ]}
                  />
                </div>

                {/* Dates */}
                <div className="auth-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '6px' }}>Start Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={form.startDate} 
                      onChange={e => setForm({ ...form, startDate: e.target.value })} 
                      required 
                      data-testid="leave-start" 
                      style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', fontSize: 'var(--text-sm)', padding: '9px 12px' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '6px' }}>End Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={form.endDate} 
                      onChange={e => setForm({ ...form, endDate: e.target.value })} 
                      required 
                      data-testid="leave-end" 
                      style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', fontSize: 'var(--text-sm)', padding: '9px 12px' }}
                    />
                  </div>
                </div>

                {/* Reason */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '6px' }}>Reason</label>
                  <textarea 
                    className="form-input form-textarea" 
                    value={form.reason} 
                    onChange={e => setForm({ ...form, reason: e.target.value })} 
                    required 
                    placeholder="Provide details or reasons for your request..." 
                    data-testid="leave-reason" 
                    rows={4}
                    style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', fontSize: 'var(--text-sm)', padding: '10px 12px', minHeight: '100px' }}
                  />
                </div>

              </div>

              <div className="modal-footer app-form-dialog-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--border-default)', backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)} style={{ padding: '8px 16px', fontWeight: 600 }}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  data-testid="submit-leave"
                  style={{ padding: '8px 20px', fontWeight: 600, boxShadow: 'var(--shadow-sm)' }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal (Approve / Reject) */}
      {showApproveModal && (
        <div className="modal-overlay" onClick={() => setShowApproveModal(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}>
          <div 
            className="modal modal-sm animate-scaleIn" 
            onClick={e => e.stopPropagation()} 
            role="dialog"
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-2xl)',
              border: '1px solid var(--border-default)',
              overflow: 'hidden',
              padding: 0
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-default)', backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
              <h3 className="modal-title" style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {approveAction === 'approve' ? 'Approve' : 'Reject'} Request
              </h3>
              <button 
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} 
                onClick={() => setShowApproveModal(null)}
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: 'var(--space-5)' }}>
              <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'rgba(248, 250, 252, 0.8)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', marginBottom: 'var(--space-4)' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  {showApproveModal.userName}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {showApproveModal.type.toUpperCase()} Leave ({showApproveModal.startDate} to {showApproveModal.endDate})
                </div>
              </div>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '6px' }}>Note (optional)</label>
                <textarea 
                  className="form-input form-textarea" 
                  value={approveNote} 
                  onChange={e => setApproveNote(e.target.value)} 
                  placeholder="E.g., Approved, have a good trip! or Please reschedule..." 
                  data-testid="approve-note" 
                  rows={3}
                  style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', fontSize: 'var(--text-sm)', padding: '10px 12px', minHeight: '80px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid var(--border-default)', backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
              <button className="btn btn-secondary" onClick={() => setShowApproveModal(null)} style={{ padding: '8px 16px', fontWeight: 600 }}>
                Cancel
              </button>
              <button 
                className={`btn ${approveAction === 'approve' ? 'btn-primary' : 'btn-danger'}`} 
                onClick={handleApprove} 
                data-testid="confirm-approve"
                style={{ padding: '8px 20px', fontWeight: 600, boxShadow: 'var(--shadow-sm)' }}
              >
                {approveAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

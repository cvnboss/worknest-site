'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import CustomSelect from '@/components/ui/CustomSelect';
import { Search, Calendar, Trash2, Plus, X, Filter, Tag, CheckCircle2, Circle, Clock, ChevronRight, AlertCircle } from 'lucide-react';

interface TaskData {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeName: string;
  reporter: string;
  reporterName: string;
  priority: string;
  status: string;
  dueDate: string;
  tags: string[];
  createdAt: string;
}

const columns = [
  { id: 'todo', label: 'To Do', color: '#64748B', lightBg: 'rgba(100, 116, 139, 0.08)', dotColor: '#94A3B8' },
  { id: 'in-progress', label: 'In Progress', color: '#2563EB', lightBg: 'rgba(37, 99, 235, 0.08)', dotColor: '#3B82F6' },
  { id: 'review', label: 'Review', color: '#7C3AED', lightBg: 'rgba(124, 58, 237, 0.08)', dotColor: '#8B5CF6' },
  { id: 'done', label: 'Done', color: '#059669', lightBg: 'rgba(5, 150, 105, 0.08)', dotColor: '#10B981' },
];



function getPriorityBadgeClass(priority: string) {
  const map: Record<string, string> = {
    urgent: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30',
    high: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/30',
    medium: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30',
    low: 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800/50'
  };
  return map[priority] || 'bg-slate-50 text-slate-600 border-slate-100';
}

function getPriorityBorderColor(priority: string) {
  const map: Record<string, string> = {
    urgent: '#EF4444',
    high: '#F97316',
    medium: '#3B82F6',
    low: '#94A3B8'
  };
  return map[priority] || '#94A3B8';
}

export default function TasksPage() {
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [employees, setEmployees] = useState<Array<{ id: string; firstName: string; lastName: string; avatar?: string }>>([]);
  const [form, setForm] = useState({ title: '', description: '', assignee: '', priority: 'medium', status: 'todo', dueDate: '', tags: '' });
  const hasProcessedUrlParam = useRef(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchDebounced(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Listen to global open-add-task event from Header
  useEffect(() => {
    const handleOpenCreate = () => {
      setEditingTask(null);
      setForm({
        title: '',
        description: '',
        assignee: user?.id || '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        tags: ''
      });
      setShowModal(true);
    };
    window.addEventListener('open-add-task', handleOpenCreate);
    return () => window.removeEventListener('open-add-task', handleOpenCreate);
  }, [user]);

  const fetchTasks = useCallback(async (silent = false) => {
    if (!token) return;
    const showLoader = !silent && !hasLoadedRef.current;
    if (showLoader) setLoading(true);
    const params = new URLSearchParams({ priority: priorityFilter, search: searchDebounced });
    try {
      const res = await fetch(`/api/tasks?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
        hasLoadedRef.current = true;
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [token, priorityFilter, searchDebounced]);

  const fetchEmployees = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/employees?limit=50', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setEmployees(data.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, [fetchTasks, fetchEmployees]);

  // Handle URL query parameters to open task on load
  useEffect(() => {
    if (tasks.length > 0 && !hasProcessedUrlParam.current && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const taskId = urlParams.get('id');
      if (taskId) {
        const foundTask = tasks.find(t => t.id === taskId);
        if (foundTask) {
          hasProcessedUrlParam.current = true;
          // Clear param from URL silently without page reload to keep it clean
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          openEditModal(foundTask);
        }
      }
    }
  }, [tasks]);

  const openCreateModal = () => {
    setEditingTask(null);
    setForm({
      title: '',
      description: '',
      assignee: user?.id || '',
      priority: 'medium',
      status: 'todo',
      dueDate: '',
      tags: ''
    });
    setShowModal(true);
  };

  const openEditModal = (task: TaskData) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate || '',
      tags: task.tags.join(', ')
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    const method = editingTask ? 'PUT' : 'POST';
    const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      addToast({ type: 'success', title: editingTask ? 'Task updated' : 'Task created' });
      setShowModal(false);
      fetchTasks(true); // Silent reload
    } else {
      addToast({ type: 'error', title: 'Error', message: data.error });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const originalTasks = [...tasks];

    // Optimistic UI Update: instantly update task status locally to make UI feel snappy and responsive
    setTasks(prevTasks =>
      prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!data.success) {
        setTasks(originalTasks);
        addToast({ type: 'error', title: 'Status update failed', message: data.error });
      } else {
        fetchTasks(true); // Silent sync in the background
      }
    } catch (err) {
      setTasks(originalTasks);
      addToast({ type: 'error', title: 'Network error', message: 'Unable to connect to server.' });
    }
  };

  const handleDelete = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.success) {
      addToast({ type: 'success', title: 'Task deleted' });
      fetchTasks(true); // Silent reload
    } else {
      addToast({ type: 'error', title: 'Error', message: data.error });
    }
  };

  const isOverdue = (dueDate: string) => dueDate && new Date(dueDate) < new Date();

  return (
    <div data-testid="tasks-page" className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* Filter and Legend Bar */}
      <div className="filter-bar" style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--space-4)'
      }}>
        <div className="search-bar" style={{ flex: 1, minWidth: '200px', margin: 0 }}>
          <span className="search-bar-icon"><Search size={18} /></span>
          <input 
            className="search-bar-input" 
            placeholder="Search tasks by title or desc..." 
            value={searchInput} 
            onChange={e => setSearchInput(e.target.value)} 
            data-testid="task-search" 
            style={{ height: '40px', paddingLeft: '38px', fontSize: 'var(--text-sm)', width: '100%' }}
          />
        </div>
        <CustomSelect
          value={priorityFilter}
          onChange={setPriorityFilter}
          testId="task-filter-priority"
          options={[
            { value: 'all', label: 'All Priorities' },
            { value: 'urgent', label: 'Urgent' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' }
          ]}
        />
      </div>

      {/* Priority Color Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        gap: 'var(--space-4)', 
        fontSize: 'var(--text-xs)', 
        color: 'var(--text-secondary)', 
        padding: '0 var(--space-2)', 
        marginTop: '-4px', 
        marginBottom: '4px',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Priority Legend:</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444' }} /> Urgent</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F97316' }} /> High</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3B82F6' }} /> Medium</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#94A3B8' }} /> Low</span>
      </div>

      {/* Kanban Board Container */}
      {loading ? (
        <div className="skeleton" style={{ height: '500px', borderRadius: 'var(--radius-xl)' }} />
      ) : (
        <div 
          data-testid="kanban-board" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', 
            gap: 'var(--space-5)', 
            alignItems: 'start'
          }}
        >
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id} 
                data-testid={`column-${col.id}`} 
                style={{ 
                  backgroundColor: 'rgba(248, 250, 252, 0.6)', 
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-xl)', 
                  padding: 'var(--space-4)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 'var(--space-4)',
                  minHeight: '600px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'background-color 0.2s'
                }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-2)', borderBottom: `2px solid ${col.dotColor}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.dotColor }} />
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col.label}</span>
                  </div>
                  <span 
                    data-testid={`count-${col.id}`}
                    style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      backgroundColor: col.lightBg, 
                      color: col.color, 
                      padding: '2px 8px', 
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flex: 1 }}>
                  {colTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="card animate-fadeInUp" 
                      onClick={() => openEditModal(task)} 
                      data-testid={`task-card-${task.id}`} 
                      style={{ 
                        cursor: 'pointer', 
                        border: '1px solid var(--border-default)',
                        borderLeft: `4px solid ${getPriorityBorderColor(task.priority)}`,
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--bg-surface)',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        e.currentTarget.style.borderColor = 'var(--primary-200)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        e.currentTarget.style.borderColor = 'var(--border-default)';
                      }}
                    >
                      <div className="card-body" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {/* Title */}
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                          {task.title}
                        </div>

                        {/* Description (Truncated) */}
                        {task.description && (
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.5' }}>
                            {task.description}
                          </div>
                        )}

                        {/* Priority Badge & Tags */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                          <span className={`badge ${getPriorityBadgeClass(task.priority)}`} style={{ fontSize: '10px', textTransform: 'capitalize', fontWeight: 600, border: '1px solid transparent' }}>
                            {task.priority}
                          </span>
                          {task.tags.map(t => (
                            <span key={t} className="badge badge-neutral" style={{ fontSize: '10px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '2px', backgroundColor: 'rgba(241, 245, 249, 0.8)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                              <Tag size={8} /> {t}
                            </span>
                          ))}
                        </div>

                        {/* Assignee & Date */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px dashed var(--border-default)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {(() => {
                              const assignee = employees.find(emp => emp.id === task.assignee);
                              const assigneeAvatar = assignee?.avatar;
                              return (
                            <div 
                              className="avatar" 
                              style={{ 
                                background: 'var(--bg-hover)', 
                                width: 22, 
                                height: 22, 
                                fontSize: '9px',
                                fontWeight: 700,
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%'
                              }}
                            >
                              {assigneeAvatar ? (
                                <img src={assigneeAvatar} alt={task.assigneeName} />
                              ) : (
                                task.assigneeName.split(' ').map(n => n[0]).join('')
                              )}
                            </div>
                              );
                            })()}
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                              {task.assigneeName.split(' ')[0]}
                            </span>
                          </div>
                          {task.dueDate && (
                            <span 
                              className={`badge ${isOverdue(task.dueDate) && task.status !== 'done' ? 'badge-danger' : 'badge-neutral'}`} 
                              style={{ 
                                fontSize: '10px', 
                                fontWeight: 600,
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '3px',
                                padding: '2px 6px',
                                backgroundColor: isOverdue(task.dueDate) && task.status !== 'done' ? 'rgba(254, 226, 226, 0.8)' : 'rgba(241, 245, 249, 0.8)'
                              }}
                            >
                              <Calendar size={10} /> {task.dueDate.slice(5)}
                            </span>
                          )}
                        </div>

                        {/* Status Switcher */}
                        <div onClick={e => e.stopPropagation()} style={{ marginTop: '2px' }}>
                          <CustomSelect
                            value={task.status}
                            onChange={val => handleStatusChange(task.id, val)}
                            testId={`status-select-${task.id}`}
                            width="100%"
                            height="28px"
                            icon={null}
                            options={columns.map(c => ({ value: c.id, label: c.label }))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 'var(--space-8) var(--space-4)',
                      border: '1px dashed var(--border-default)',
                      borderRadius: 'var(--radius-lg)',
                      color: 'var(--text-muted)',
                      fontSize: 'var(--text-xs)',
                      gap: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    }}>
                      <Clock size={16} style={{ opacity: 0.6 }} />
                      <span>No tasks in this list</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Drawer (Create / Edit Task) */}
      {showModal && (
        <div className="drawer-overlay" onClick={() => setShowModal(false)} style={{ display: 'flex', justifyContent: 'flex-end', zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}>
          <div 
            className="drawer animate-slideInRight" 
            onClick={e => e.stopPropagation()} 
            role="dialog" 
            aria-labelledby="task-modal-title"
            style={{
              width: '100%',
              maxWidth: '480px',
              height: '100vh',
              backgroundColor: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-2xl)',
              display: 'flex',
              flexDirection: 'column',
              padding: 0
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border-default)', backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
              <h3 className="drawer-title" id="task-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ChevronRight size={18} className="text-muted" /> {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editingTask && (
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => { handleDelete(editingTask.id); setShowModal(false); }} 
                    data-testid="delete-task"
                    style={{ padding: '6px', borderRadius: 'var(--radius-md)', color: '#EF4444' }}
                    title="Delete Task"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button 
                  className="drawer-close" 
                  onClick={() => setShowModal(false)}
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
            </div>

            {/* Form */}
            <form onSubmit={handleSave} data-testid="task-form" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', margin: 0 }}>
              <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-6)', overflowY: 'auto', flex: 1 }}>
                
                {/* Title */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '6px' }}>Title</label>
                  <input 
                    className="form-input" 
                    value={form.title} 
                    onChange={e => setForm({ ...form, title: e.target.value })} 
                    required 
                    placeholder="E.g., Design homepage mockups" 
                    data-testid="task-title" 
                    style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', fontSize: 'var(--text-sm)', padding: '10px 12px' }}
                  />
                </div>

                {/* Description */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '6px' }}>Description</label>
                  <textarea 
                    className="form-input form-textarea" 
                    value={form.description} 
                    onChange={e => setForm({ ...form, description: e.target.value })} 
                    placeholder="Provide details about this task..." 
                    data-testid="task-description" 
                    rows={4}
                    style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', fontSize: 'var(--text-sm)', padding: '10px 12px', minHeight: '100px' }}
                  />
                </div>

                {/* Row: Assignee & Priority */}
                <div className="auth-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '6px' }}>Assignee</label>
                    <CustomSelect
                      value={form.assignee}
                      onChange={val => setForm({ ...form, assignee: val })}
                      testId="task-assignee"
                      width="100%"
                      icon={null}
                      options={employees.map(emp => ({ value: emp.id, label: `${emp.firstName} ${emp.lastName}` }))}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '6px' }}>Priority</label>
                    <CustomSelect
                      value={form.priority}
                      onChange={val => setForm({ ...form, priority: val })}
                      testId="task-priority"
                      width="100%"
                      icon={null}
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                        { value: 'urgent', label: 'Urgent' }
                      ]}
                    />
                  </div>
                </div>

                {/* Row: Status & Due Date */}
                <div className="auth-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '6px' }}>Status</label>
                    <CustomSelect
                      value={form.status}
                      onChange={val => setForm({ ...form, status: val })}
                      testId="task-status"
                      width="100%"
                      icon={null}
                      options={columns.map(c => ({ value: c.id, label: c.label }))}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '6px' }}>Due Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={form.dueDate} 
                      onChange={e => setForm({ ...form, dueDate: e.target.value })} 
                      data-testid="task-due-date" 
                      style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', fontSize: 'var(--text-sm)', padding: '9px 12px' }}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '6px' }}>Tags</label>
                  <input 
                    className="form-input" 
                    value={form.tags} 
                    onChange={e => setForm({ ...form, tags: e.target.value })} 
                    placeholder="E.g., bug, frontend, doc (comma-separated)" 
                    data-testid="task-tags" 
                    style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', fontSize: 'var(--text-sm)', padding: '10px 12px' }}
                  />
                  <small style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Separate tags with commas.
                  </small>
                </div>

              </div>

              {/* Drawer Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--border-default)', backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', fontWeight: 600 }}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  data-testid="save-task"
                  style={{ padding: '8px 20px', fontWeight: 600, boxShadow: 'var(--shadow-sm)' }}
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

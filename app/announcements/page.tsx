'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import CustomSelect from '@/components/ui/CustomSelect';
import { MessageSquare, Pin, Trash2, Megaphone, X, Plus, List, AlertCircle, Calendar, Shield, Send, Clock, Layers } from 'lucide-react';
import { getAvatarColor, timeAgo } from '@/lib/utils';

interface AnnouncementData { id: string; title: string; content: string; author: string; authorName: string; category: string; isPinned: boolean; comments: CommentData[]; createdAt: string; }
interface CommentData { id: string; content: string; authorName: string; createdAt: string; }

const categories = ['all', 'general', 'urgent', 'event', 'policy'];
const categoryIcons: Record<string, React.ReactNode> = { 
  general: <List size={14} />, 
  urgent: <AlertCircle size={14} />, 
  event: <Calendar size={14} />, 
  policy: <Shield size={14} /> 
};

const categoryBadgeClasses: Record<string, string> = {
  general: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30',
  urgent: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30',
  event: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30',
  policy: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/30',
};



export default function AnnouncementsPage() {
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', isPinned: false });

  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';

  const fetchAnnouncements = useCallback(async (silent = false) => {
    if (!token) return;
    const showLoader = !silent && !hasLoadedRef.current;
    if (showLoader) setLoading(true);
    try {
      const res = await fetch(`/api/announcements?category=${categoryFilter}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.data);
        hasLoadedRef.current = true;
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [token, categoryFilter]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  // Listen to global open-add-announcement event from Header
  useEffect(() => {
    const handleOpenCreate = () => {
      setShowCreateModal(true);
    };
    window.addEventListener('open-add-announcement', handleOpenCreate);
    return () => window.removeEventListener('open-add-announcement', handleOpenCreate);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.success) {
      addToast({ type: 'success', title: 'Announcement posted' });
      setShowCreateModal(false);
      setForm({ title: '', content: '', category: 'general', isPinned: false });
      fetchAnnouncements(true); // Silent reload
    }
    else addToast({ type: 'error', title: 'Error', message: data.error });
  };

  const handleComment = async (annId: string) => {
    const text = commentTexts[annId] || '';
    if (!text.trim()) return;
    const res = await fetch(`/api/announcements/${annId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: text }) });
    const data = await res.json();
    if (data.success) {
      setCommentTexts(prev => ({ ...prev, [annId]: '' }));
      fetchAnnouncements(true); // Silent reload
      addToast({ type: 'success', title: 'Comment added' });
    }
  };

  const handleDelete = async (id: string) => {
    const originalAnnouncements = [...announcements];

    // Optimistic UI Update: remove from local list immediately
    setAnnouncements(prev => prev.filter(ann => ann.id !== id));

    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        addToast({ type: 'success', title: 'Announcement deleted' });
        fetchAnnouncements(true); // Silent sync
      } else {
        setAnnouncements(originalAnnouncements);
        addToast({ type: 'error', title: 'Error deleting announcement', message: data.error });
      }
    } catch (err) {
      setAnnouncements(originalAnnouncements);
      addToast({ type: 'error', title: 'Network Error', message: 'Failed to connect to the server.' });
    }
  };

  const togglePin = async (ann: AnnouncementData) => {
    const originalAnnouncements = [...announcements];

    // Optimistic UI Update: toggle pinned state locally immediately
    setAnnouncements(prev =>
      prev.map(a => a.id === ann.id ? { ...a, isPinned: !a.isPinned } : a)
    );

    try {
      const res = await fetch(`/api/announcements/${ann.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isPinned: !ann.isPinned })
      });
      const data = await res.json();
      if (data.success) {
        fetchAnnouncements(true); // Silent sync
      } else {
        setAnnouncements(originalAnnouncements);
        addToast({ type: 'error', title: 'Error toggling pin status' });
      }
    } catch (err) {
      setAnnouncements(originalAnnouncements);
      addToast({ type: 'error', title: 'Network Error' });
    }
  };

  return (
    <div data-testid="announcements-page" className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Tabs and Actions Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        {/* Categories Tabs */}
        <div 
          className="segmented-tabs" 
          data-testid="announcement-tabs"
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            padding: '4px',
            backgroundColor: 'rgba(241, 245, 249, 0.7)',
            borderRadius: 'var(--radius-xl)',
            width: 'fit-content',
            border: '1px solid var(--border-default)'
          }}
        >
          {categories.map(c => (
            <button 
              key={c} 
              className={`segmented-tab ${categoryFilter === c ? 'active' : ''}`} 
              onClick={() => setCategoryFilter(c)} 
              data-testid={`tab-${c}`}
              style={{
                padding: '8px 16px',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                borderRadius: 'var(--radius-lg)',
                color: categoryFilter === c ? 'var(--primary-700)' : 'var(--text-secondary)',
                backgroundColor: categoryFilter === c ? 'var(--bg-surface)' : 'transparent',
                border: 'none',
                boxShadow: categoryFilter === c ? 'var(--shadow-xs)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {c === 'all' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={14} /> All</span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {categoryIcons[c]} 
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Announcement Feed */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      ) : (
        <div 
          className="stagger-children" 
          data-testid="announcement-feed" 
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
        >
          {announcements.length ? announcements.map(ann => (
            <div 
              key={ann.id} 
              className="card animate-fadeInUp" 
              data-testid={`announcement-${ann.id}`} 
              style={{ 
                border: '1px solid var(--border-default)',
                borderLeft: ann.isPinned ? '4px solid var(--primary-500)' : '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: ann.isPinned ? 'rgba(245, 243, 255, 0.4)' : 'var(--bg-surface)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div className="card-body" style={{ padding: 'var(--space-6)' }}>
                {/* Meta details header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div 
                      className="avatar" 
                      style={{ 
                        background: getAvatarColor(ann.authorName),
                        width: 38,
                        height: 38,
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%'
                      }}
                    >
                      {ann.authorName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                        {ann.authorName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> {timeAgo(ann.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span 
                      className={`badge ${categoryBadgeClasses[ann.category] || 'badge-neutral'}`}
                      style={{ fontSize: '11px', fontWeight: 600, textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid transparent', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}
                    >
                      {categoryIcons[ann.category]} {ann.category}
                    </span>
                    {ann.isPinned && (
                      <span 
                        title="Pinned announcement"
                        style={{ display: 'flex', padding: '4px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)' }}
                      >
                        <Pin size={14} fill="currentColor" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Title and Content */}
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                  {ann.title}
                </h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: 'var(--space-4)', whiteSpace: 'pre-wrap' }}>
                  {ann.content}
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-default)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => setExpandedId(expandedId === ann.id ? null : ann.id)} 
                    data-testid={`toggle-comments-${ann.id}`}
                    style={{ fontWeight: 600, color: 'var(--primary-600)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)' }}
                  >
                    <MessageSquare size={14} /> {ann.comments?.length || 0} Comments
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {isManagerOrAdmin && (ann.author === user?.id || user?.role === 'admin') && (
                      <>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          onClick={() => togglePin(ann)} 
                          data-testid={`pin-${ann.id}`}
                          style={{ fontWeight: 600, fontSize: '11px', padding: '4px 8px', borderRadius: 'var(--radius-md)' }}
                        >
                          {ann.isPinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          onClick={() => handleDelete(ann.id)} 
                          data-testid={`delete-announcement-${ann.id}`}
                          style={{ padding: '6px', borderRadius: 'var(--radius-md)', color: '#EF4444' }}
                          title="Delete Announcement"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded Comments Section */}
                {expandedId === ann.id && (
                  <div 
                    data-testid={`comments-${ann.id}`}
                    style={{ 
                      marginTop: 'var(--space-4)', 
                      padding: 'var(--space-4) var(--space-5)', 
                      background: 'rgba(248, 250, 252, 0.6)', 
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-4)'
                    }}
                  >
                    {ann.comments && ann.comments.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {ann.comments.map(c => (
                          <div key={c.id} style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <div 
                              className="avatar" 
                              style={{ 
                                background: getAvatarColor(c.authorName),
                                width: 28,
                                height: 28,
                                fontSize: '10px',
                                fontWeight: 700,
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%'
                              }}
                            >
                              {c.authorName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>{c.authorName}</span>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{timeAgo(c.createdAt)}</span>
                              </div>
                              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
                                {c.content}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: ann.comments?.length ? '4px' : '0' }}>
                      <input 
                        className="form-input" 
                        placeholder="Write a comment..." 
                        value={commentTexts[ann.id] || ''} 
                        onChange={e => setCommentTexts(prev => ({ ...prev, [ann.id]: e.target.value }))} 
                        onKeyDown={e => e.key === 'Enter' && handleComment(ann.id)} 
                        data-testid={`comment-input-${ann.id}`} 
                        style={{ flex: 1, height: '36px', fontSize: '13px', padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}
                      />
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleComment(ann.id)} 
                        data-testid={`submit-comment-${ann.id}`}
                        style={{ height: '36px', padding: '0 14px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                      >
                        <Send size={12} /> Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="empty-state" style={{ padding: 'var(--space-12)', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--bg-surface)' }}>
              <div className="empty-state-icon" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', padding: 'var(--space-4)', borderRadius: '50%', marginBottom: 'var(--space-4)' }}><Megaphone size={40} /></div>
              <div className="empty-state-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>No announcements yet</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: '4px 0 0 0' }}>Stay tuned! New company updates will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* New Announcement Modal */}
      {showCreateModal && (
        <div className="modal-overlay animate-fadeIn app-form-dialog-overlay" onClick={() => setShowCreateModal(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)', padding: 'var(--space-6)' }}>
          <div 
            className="modal app-form-dialog animate-scaleIn" 
            onClick={e => e.stopPropagation()} 
            role="dialog" 
            aria-labelledby="ann-modal-title"
            aria-modal="true"
            style={{
              width: '100%',
              maxWidth: '620px',
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
              <h3 className="modal-title app-form-dialog-title" id="ann-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                New Announcement
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
            
            <form className="app-form-dialog-form" onSubmit={handleCreate} data-testid="announcement-form" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', margin: 0 }}>
              <div className="modal-body app-form-dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-6)', overflowY: 'auto', flex: 1 }}>
                
                {/* Title */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '6px' }}>Title</label>
                  <input 
                    className="form-input" 
                    value={form.title} 
                    onChange={e => setForm({ ...form, title: e.target.value })} 
                    required 
                    placeholder="E.g., Q3 Planning Session" 
                    data-testid="ann-title" 
                    style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', fontSize: 'var(--text-sm)', padding: '10px 12px' }}
                  />
                </div>

                {/* Category */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '6px' }}>Category</label>
                  <CustomSelect
                    value={form.category}
                    onChange={val => setForm({ ...form, category: val })}
                    testId="ann-category"
                    width="100%"
                    icon={null}
                    options={categories.filter(c => c !== 'all').map(c => ({
                      value: c,
                      label: c.charAt(0).toUpperCase() + c.slice(1)
                    }))}
                  />
                </div>

                {/* Content */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '6px' }}>Content</label>
                  <textarea 
                    className="form-input form-textarea" 
                    style={{ minHeight: 180, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', fontSize: 'var(--text-sm)', padding: '10px 12px' }} 
                    value={form.content} 
                    onChange={e => setForm({ ...form, content: e.target.value })} 
                    required 
                    placeholder="Write your announcement message in detail..." 
                    data-testid="ann-content" 
                    rows={6}
                  />
                </div>

                {/* Checkbox: Pin Announcement */}
                <div className="form-checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'var(--space-2)' }}>
                  <input 
                    type="checkbox" 
                    className="form-checkbox" 
                    checked={form.isPinned} 
                    onChange={e => setForm({ ...form, isPinned: e.target.checked })} 
                    id="pin-check" 
                    data-testid="ann-pin" 
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="pin-check" className="form-checkbox-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>
                    Pin this announcement to top of feed
                  </label>
                </div>

              </div>

              <div className="modal-footer app-form-dialog-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--border-default)', backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)} style={{ padding: '8px 16px', fontWeight: 600 }}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  data-testid="submit-announcement"
                  style={{ padding: '8px 20px', fontWeight: 600, boxShadow: 'var(--shadow-sm)' }}
                >
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Bell, Check, CheckSquare, CalendarDays, Megaphone, Calendar, PartyPopper } from 'lucide-react';
import type { Notification } from '@/lib/types';
import { timeAgo } from '@/lib/utils';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'leave_approved':
    case 'leave_rejected':
    case 'leave_pending': return <CalendarDays size={16} className="text-primary-600" />;
    case 'task_assigned':
    case 'task_updated': return <CheckSquare size={16} className="text-accent-600" />;
    case 'meeting_scheduled': return <Calendar size={16} className="text-info-600" />;
    case 'announcement_new': return <Megaphone size={16} className="text-warning-600" />;
    default: return <Bell size={16} className="text-neutral-500" />;
  }
};

export default function NotificationPanel({ isOpen, onClose, onUnreadCountChange }: NotificationPanelProps) {
  const { token } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        const unreadCount = data.data.filter((n: Notification) => !n.isRead).length;
        onUnreadCountChange(unreadCount);
      }
    } catch (err) { console.error('Failed to fetch notifications', err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (token) fetchNotifications();
    // Poll every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!token) return;
    try {
      await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: [id] })
      });
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ all: true })
      });
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) markAsRead(n.id);
    if (n.link) router.push(n.link);
    onClose();
  };

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => tab === 'all' || !n.isRead);

  return (
    <div 
      ref={panelRef} 
      className="notification-panel" 
      data-testid="notification-panel"
    >
      <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 600 }}>Notifications</h3>
        {notifications.some(n => !n.isRead) && (
          <button className="btn btn-ghost btn-sm" onClick={markAllAsRead} style={{ fontSize: 'var(--text-xs)' }}>
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)' }}>
        <button 
          className={`btn btn-ghost ${tab === 'all' ? 'active' : ''}`} 
          style={{ flex: 1, borderRadius: 0, borderBottom: tab === 'all' ? '2px solid var(--primary-500)' : '2px solid transparent' }}
          onClick={() => setTab('all')}
        >
          All
        </button>
        <button 
          className={`btn btn-ghost ${tab === 'unread' ? 'active' : ''}`} 
          style={{ flex: 1, borderRadius: 0, borderBottom: tab === 'unread' ? '2px solid var(--primary-500)' : '2px solid transparent' }}
          onClick={() => setTab('unread')}
        >
          Unread
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
        {loading ? (
          <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius-md)' }} />)}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <div className="empty-state-icon"><PartyPopper size={32} className="text-muted" /></div>
            <div className="empty-state-title">{tab === 'unread' ? "You're all caught up!" : 'No notifications'}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredNotifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => handleNotificationClick(n)}
                style={{ 
                  display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-4)', 
                  borderBottom: '1px solid var(--border-default)', cursor: 'pointer',
                  backgroundColor: n.isRead ? 'transparent' : 'var(--bg-hover)',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getIcon(n.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: n.isRead ? 400 : 500, color: 'var(--text-primary)', marginBottom: 2 }}>{n.message}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{timeAgo(n.timestamp)}</div>
                </div>
                {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary-500)', marginTop: 6, flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

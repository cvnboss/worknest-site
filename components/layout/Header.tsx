'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import NotificationPanel from './NotificationPanel';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/employees': 'Employee Directory',
  '/departments': 'Departments',
  '/leave': 'Leave Management',
  '/meetings': 'Meeting Rooms',
  '/tasks': 'Task Board',
  '/announcements': 'Announcements',
  '/settings': 'Settings',
  '/calendar': 'Calendar',
  '/audit-logs': 'Audit Logs',
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith('/employees/')) return 'Employee Profile';
  return 'WorkNest';
}

export default function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const { user } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleActionClick = () => {
    if (pathname === '/tasks') {
      window.dispatchEvent(new CustomEvent('open-add-task'));
    } else if (pathname === '/employees') {
      window.dispatchEvent(new CustomEvent('open-add-employee'));
    } else if (pathname === '/departments') {
      window.dispatchEvent(new CustomEvent('open-add-department'));
    } else if (pathname === '/leave') {
      window.dispatchEvent(new CustomEvent('open-add-leave'));
    } else if (pathname === '/announcements') {
      window.dispatchEvent(new CustomEvent('open-add-announcement'));
    }
  };

  const getActionLabel = () => {
    if (pathname === '/tasks') return 'Add Task';
    if (pathname === '/employees') return 'Add Employee';
    if (pathname === '/departments') return 'New Department';
    if (pathname === '/leave') return 'New Request';
    if (pathname === '/announcements') return 'New Announcement';
    return '';
  };

  const shouldShowAction = () => {
    if (pathname === '/tasks') return true;
    if (pathname === '/employees') return user?.role === 'admin';
    if (pathname === '/departments') return user?.role === 'admin';
    if (pathname === '/leave') return true;
    if (pathname === '/announcements') return user?.role === 'admin' || user?.role === 'manager';
    return false;
  };

  const actionLabel = getActionLabel();
  const showAction = shouldShowAction();

  const handleNotificationClick = () => {
    setIsNotifOpen(!isNotifOpen);
  };

  return (
    <header 
      className="header" 
      data-testid="header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        padding: '0 var(--space-6)',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-default)',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}
    >
      <div className="header-left">
        <h1 
          className="header-title" 
          data-testid="page-title"
          style={{
            fontSize: '20px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            margin: 0
          }}
        >
          {title}
        </h1>
      </div>
      
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {showAction && (
          <button
            onClick={handleActionClick}
            data-testid={pathname === '/tasks' ? 'add-task-btn' : pathname === '/employees' ? 'add-employee-btn' : pathname === '/departments' ? 'add-department-btn' : pathname === '/leave' ? 'new-leave-btn' : 'new-announcement-btn'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '0 16px',
              height: '36px',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <Plus size={16} /> {actionLabel}
          </button>
        )}
        {/* Search bar */}
        <div className="header-search" style={{ position: 'relative', display: 'flex', alignItems: 'center' }} data-testid="header-search">
          <span 
            className="header-search-icon" 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              color: isSearchFocused ? '#4F46E5' : 'var(--text-muted)', 
              display: 'flex', 
              pointerEvents: 'none',
              zIndex: 1,
              transition: 'color 0.15s ease'
            }}
          >
            <Search size={16} />
          </span>
          <input
            type="text"
            className="header-search-input"
            placeholder="Search..."
            data-testid="header-search-input"
            aria-label="Search"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{
              height: '36px',
              paddingLeft: '36px',
              paddingRight: '12px',
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-md)',
              border: isSearchFocused ? '1px solid #4F46E5' : '1px solid var(--border-default)',
              boxShadow: isSearchFocused ? '0 0 0 1px rgba(79, 70, 229, 0.15)' : 'none',
              backgroundColor: 'var(--bg-surface)',
              width: '240px',
              transition: 'all 0.15s ease-in-out',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>
        
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            className="btn btn-ghost" 
            style={{ 
              position: 'relative', 
              width: 36, 
              height: 36, 
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isNotifOpen ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
              color: isNotifOpen ? '#4F46E5' : 'var(--text-secondary)',
              border: isNotifOpen ? '1px solid rgba(79, 70, 229, 0.15)' : '1px solid transparent',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }} 
            data-testid="notification-btn" 
            aria-label="Notifications"
            onClick={handleNotificationClick}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
              if (!isNotifOpen) {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              if (!isNotifOpen) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <Bell size={18} style={{ transition: 'transform 0.15s ease' }} />
            {unreadCount > 0 && (
              <span 
                style={{ 
                  position: 'absolute', 
                  top: -2, 
                  right: -2, 
                  minWidth: 16, 
                  height: 16, 
                  backgroundColor: 'var(--danger)', 
                  color: 'white', 
                  borderRadius: '50%', 
                  fontSize: '9px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '0 4px', 
                  fontWeight: 'bold',
                  border: '2px solid #fff',
                  boxShadow: '0 0 6px rgba(239, 68, 68, 0.4)'
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          
          <NotificationPanel 
            isOpen={isNotifOpen} 
            onClose={() => setIsNotifOpen(false)} 
            onUnreadCountChange={setUnreadCount} 
          />
        </div>
      </div>
    </header>
  );
}

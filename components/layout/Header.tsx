'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import NotificationPanel from './NotificationPanel';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/employees': 'Employee Directory',
  '/leave': 'Leave Management',
  '/meetings': 'Meeting Rooms',
  '/tasks': 'Task Board',
  '/announcements': 'Announcements',
  '/settings': 'Settings',
  '/calendar': 'Calendar',
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith('/employees/')) return 'Employee Profile';
  return 'WorkNest';
}

export default function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
              zIndex: 1
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
              boxShadow: isSearchFocused ? '0 0 0 3px rgba(79, 70, 229, 0.1)' : 'none',
              backgroundColor: 'var(--bg-surface)',
              width: isSearchFocused ? '240px' : '200px',
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
              transition: 'all 0.15s'
            }} 
            data-testid="notification-btn" 
            aria-label="Notifications"
            onClick={handleNotificationClick}
            onMouseEnter={e => {
              if (!isNotifOpen) {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={e => {
              if (!isNotifOpen) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <Bell size={18} />
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

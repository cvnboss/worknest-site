'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getAvatarColor } from '@/lib/utils';

import { 
  LayoutDashboard, Users, CalendarDays, Calendar, CalendarCheck,
  CheckSquare, Megaphone, Settings, LogOut, Building2, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, section: 'MAIN' },
  { href: '/employees', label: 'Employees', icon: Users, section: 'MAIN' },
  { href: '/departments', label: 'Departments', icon: Building2, section: 'MAIN' },
  { href: '/leave', label: 'Leave', icon: CalendarDays, section: 'MAIN' },
  { href: '/meetings', label: 'Meetings', icon: Calendar, section: 'MAIN' },
  { href: '/calendar', label: 'Calendar', icon: CalendarCheck, section: 'MAIN' },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare, section: 'WORKSPACE' },
  { href: '/announcements', label: 'Announcements', icon: Megaphone, section: 'WORKSPACE' },
  { href: '/settings', label: 'Settings', icon: Settings, section: 'ACCOUNT' },
];

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}



export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const sections = ['MAIN', 'WORKSPACE', 'ACCOUNT'];

  return (
    <aside 
      className={`sidebar ${collapsed ? 'collapsed' : ''}`} 
      data-testid="sidebar"
      style={{
        background: 'linear-gradient(180deg, var(--bg-surface) 0%, rgba(248, 250, 252, 0.8) 100%)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 40
      }}
    >
      {/* Sidebar Header Logo */}
      <div 
        className="sidebar-header"
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--space-4)',
          borderBottom: '1px solid var(--border-default)',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(79, 70, 229, 0.25)',
              color: '#fff',
              flexShrink: 0
            }}
          >
            <Building2 size={18} />
          </div>
          {!collapsed && (
            <span 
              className="font-bold text-lg tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                background: 'linear-gradient(135deg, var(--text-primary) 0%, #4F46E5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              WorkNest
            </span>
          )}
        </div>
      </div>

      {/* Nav List */}
      <nav 
        className="sidebar-nav" 
        data-testid="sidebar-nav"
        style={{
          padding: 'var(--space-3)',
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}
      >
        {sections.map(section => (
          <React.Fragment key={section}>
            {!collapsed && (
              <div 
                className="sidebar-section-label"
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: 'var(--space-4) var(--space-3) var(--space-1) var(--space-3)'
                }}
              >
                {section}
              </div>
            )}
            
            {navItems.filter(item => item.section === section).map(item => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              const isHovered = hoveredItem === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    padding: collapsed ? '10px 0' : '10px 14px',
                    borderRadius: 'var(--radius-lg)',
                    color: isActive ? '#4F46E5' : 'var(--text-secondary)',
                    backgroundColor: isActive 
                      ? 'rgba(79, 70, 229, 0.08)' 
                      : (isHovered ? 'var(--bg-hover)' : 'transparent'),
                    border: isActive ? '1px solid rgba(79, 70, 229, 0.12)' : '1px solid transparent',
                    boxShadow: isActive ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.4), var(--shadow-sm)' : 'none',
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none',
                    fontSize: 'var(--text-sm)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    justifyContent: collapsed ? 'center' : 'flex-start'
                  }}
                >
                  {/* Left edge border marker */}
                  {isActive && !collapsed && (
                    <div 
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '20%',
                        height: '60%',
                        width: '3.5px',
                        backgroundColor: '#4F46E5',
                        borderRadius: '0 9999px 9999px 0',
                        boxShadow: '0 0 8px rgba(79, 70, 229, 0.5)'
                      }}
                    />
                  )}
                  
                  <span 
                    className="nav-icon"
                    style={{
                      marginRight: collapsed ? 0 : 'var(--space-3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? '#4F46E5' : 'var(--text-secondary)',
                      transform: isHovered ? 'scale(1.12) translateY(-0.5px)' : 'none',
                      transition: 'transform 0.18s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <item.icon size={18} />
                  </span>
                  
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </React.Fragment>
        ))}
      </nav>

      {/* Footer */}
      <div 
        className="sidebar-footer" 
        data-testid="sidebar-footer"
        style={{
          padding: 'var(--space-3)',
          borderTop: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)'
        }}
      >
        <button 
          className="nav-item w-full" 
          onClick={() => setCollapsed(!collapsed)} 
          data-testid="sidebar-toggle"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '8px 0' : '8px 12px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : '10px'
          }}
        >
          <span className="nav-icon" style={{ display: 'flex', alignItems: 'center' }}>
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </span>
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>

        {user && (
          <div 
            className="sidebar-user animate-fadeIn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: collapsed ? '8px' : '10px',
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              marginTop: '4px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s ease'
            }}
          >
            <div 
              className="avatar avatar-md" 
              style={{ 
                background: getAvatarColor(`${user.firstName} ${user.lastName}`),
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '11px',
                flexShrink: 0,
                border: '2px solid var(--bg-surface)',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
              ) : (
                getInitials(user.firstName, user.lastName)
              )}
            </div>
            {!collapsed && (
              <>
                <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
                  <div 
                    className="sidebar-user-name" 
                    data-testid="sidebar-user-name"
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {user.firstName} {user.lastName}
                  </div>
                  <div 
                    className="sidebar-user-role"
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      textTransform: 'capitalize'
                    }}
                  >
                    {user.role}
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ 
                    padding: 4, 
                    height: 'auto', 
                    flexShrink: 0,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)'
                  }}
                  onClick={logout}
                  data-testid="logout-btn"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut size={16} className="text-danger" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getAvatarColor } from '@/lib/utils';

import { 
  LayoutDashboard, Users, CalendarDays, Calendar, CalendarCheck,
  CheckSquare, Megaphone, Settings, LogOut, Building2, 
  ChevronLeft, ChevronRight, ClipboardList
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Core',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/employees', label: 'Employees', icon: Users },
      { href: '/departments', label: 'Departments', icon: Building2 },
    ],
  },
  {
    label: 'Work',
    items: [
      { href: '/leave', label: 'Leave', icon: CalendarDays },
      { href: '/meetings', label: 'Meetings', icon: Calendar },
      { href: '/calendar', label: 'Calendar', icon: CalendarCheck },
      { href: '/tasks', label: 'Tasks', icon: CheckSquare },
      { href: '/announcements', label: 'Announcements', icon: Megaphone },
    ],
  },
  {
    label: 'Admin',
    items: [
      { href: '/audit-logs', label: 'Audit Logs', icon: ClipboardList, adminOnly: true },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

function getNavTestId(label: string) {
  return `nav-${label.toLowerCase().replace(/\s+/g, '-')}`;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={`sidebar ${collapsed ? 'collapsed' : ''}`} 
      data-testid="sidebar"
    >
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark" aria-hidden="true">
            <Building2 size={18} />
          </div>
          {!collapsed && (
            <span className="sidebar-brand-name">
              WorkNest
            </span>
          )}
        </div>
      </div>

      <nav 
        className="sidebar-nav" 
        data-testid="sidebar-nav"
        aria-label="Primary navigation"
      >
        {navGroups.map(group => {
          const visibleItems = group.items.filter(item => !item.adminOnly || user?.role === 'admin');

          if (visibleItems.length === 0) {
            return null;
          }

          return (
            <div className="sidebar-nav-group" key={group.label}>
              {!collapsed && (
                <div className="sidebar-section-label">
                  {group.label}
                </div>
              )}
              
              <div className="sidebar-nav-items">
                {visibleItems.map(item => {
                  const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      data-testid={getNavTestId(item.label)}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="nav-icon" aria-hidden="true">
                        <Icon size={18} />
                      </span>
                      
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div 
        className="sidebar-footer" 
        data-testid="sidebar-footer"
      >
        <button 
          className="sidebar-collapse-btn" 
          onClick={() => setCollapsed(!collapsed)} 
          data-testid="sidebar-toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="nav-icon" aria-hidden="true">
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </span>
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>

        {user && (
          <div className="sidebar-user animate-fadeIn">
            <div 
              className="avatar avatar-md" 
              style={{ 
                background: getAvatarColor(`${user.firstName} ${user.lastName}`),
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
                <div className="sidebar-user-info">
                  <div 
                    className="sidebar-user-name" 
                    data-testid="sidebar-user-name"
                  >
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="sidebar-user-role">
                    {user.role}
                  </div>
                </div>
                <button
                  className="sidebar-logout-btn"
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

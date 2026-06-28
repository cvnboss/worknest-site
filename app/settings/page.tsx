'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { User, Lock, Bell, ShieldCheck, Check, Info, Settings as SettingsIcon } from 'lucide-react';
import { getAvatarColor } from '@/lib/utils';

const ToggleSwitch = ({ checked, onChange, testId, label }: { checked: boolean; onChange: (checked: boolean) => void; testId: string; label: string }) => {
  return (
    <label 
      style={{ 
        position: 'relative', 
        display: 'inline-flex', 
        alignItems: 'center', 
        cursor: 'pointer', 
        userSelect: 'none' 
      }} 
      aria-label={label}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        data-testid={testId}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0'
        }}
      />
      <div 
        style={{
          width: '42px',
          height: '24px',
          backgroundColor: checked ? '#4F46E5' : 'rgba(226, 232, 240, 0.8)',
          borderRadius: '9999px',
          position: 'relative',
          transition: 'background-color 0.2s',
          border: checked ? '1px solid #4F46E5' : '1px solid var(--border-default)'
        }}
      >
        <div 
          style={{
            width: '18px',
            height: '18px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            position: 'absolute',
            top: '2px',
            left: checked ? '20px' : '2px',
            transition: 'left 0.2s ease',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
      </div>
    </label>
  );
};

const getScrollParent = (element: HTMLElement) => {
  let parent = element.parentElement;
  while (parent) {
    const overflowY = window.getComputedStyle(parent).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent;
    }
    parent = parent.parentElement;
  }
  return document.scrollingElement as HTMLElement;
};

export default function SettingsPage() {
  const { user, token, updateUser, logout } = useAuth();
  const { addToast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetState = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addToast({ type: 'success', title: 'System Reset', message: 'All application state has been reset to default.' });
        setTimeout(() => {
          localStorage.clear();
          logout();
        }, 1500);
      } else {
        addToast({ type: 'error', title: 'Reset Failed', message: data.error || 'Failed to reset system data.' });
        setIsResetting(false);
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Network Error', message: 'Failed to connect to system seed API.' });
      setIsResetting(false);
    }
  };
  const [profile, setProfile] = useState({ 
    firstName: user?.firstName || '', 
    lastName: user?.lastName || '', 
    phone: user?.phone || '' 
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifications, setNotifications] = useState({ 
    emailNotifications: true, 
    leaveUpdates: true, 
    meetingReminders: true, 
    taskAssignments: true 
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [activeSection, setActiveSection] = useState('profile-section');

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const res = await fetch(`/api/users/${user.id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
      body: JSON.stringify(profile) 
    });
    const data = await res.json();
    if (data.success) {
      updateUser({ ...user, ...profile });
      addToast({ type: 'success', title: 'Profile updated successfully' });
    } else addToast({ type: 'error', title: 'Error', message: data.error });
    setSavingProfile(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { 
      addToast({ type: 'error', title: 'Passwords do not match' }); 
      return; 
    }
    if (passwords.newPassword.length < 6) { 
      addToast({ type: 'error', title: 'Password must be at least 6 characters' }); 
      return; 
    }
    if (!user) return;
    setSavingPassword(true);
    const res = await fetch(`/api/users/${user.id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
      body: JSON.stringify(passwords) 
    });
    const data = await res.json();
    if (data.success) { 
      addToast({ type: 'success', title: 'Password updated' }); 
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); 
    }
    else addToast({ type: 'error', title: 'Error', message: data.error });
    setSavingPassword(false);
  };

  if (!user) return null;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const scrollParent = getScrollParent(element);
      const parentTop = scrollParent === document.scrollingElement ? 0 : scrollParent.getBoundingClientRect().top;
      const menuCard = document.querySelector('[data-testid="settings-menu"]') as HTMLElement | null;
      const targetLineTop = menuCard?.getBoundingClientRect().top ?? parentTop;
      const sectionTop = element.getBoundingClientRect().top - parentTop + scrollParent.scrollTop;
      const targetTop = sectionTop - (targetLineTop - parentTop);
      scrollParent.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  const menuItems = [
    { id: 'profile-section', label: 'Profile Settings', icon: <User size={18} /> },
    { id: 'password-section', label: 'Security & Password', icon: <Lock size={18} /> },
    { id: 'notifications-section', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'account-section', label: 'Account Summary', icon: <ShieldCheck size={18} /> },
    { id: 'system-section', label: 'System Settings', icon: <SettingsIcon size={18} /> }
  ];

  return (
    <div data-testid="settings-page" className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Split Layout Container */}
      <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Left navigation sidebar */}
        <div 
          data-testid="settings-menu"
          style={{ 
            width: '100%', 
            maxWidth: '240px', 
            position: 'sticky', 
            top: 0, 
            alignSelf: 'flex-start',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-3)',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          {menuItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  backgroundColor: isActive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                  color: isActive ? '#4F46E5' : 'var(--text-secondary)'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span style={{ display: 'flex', transition: 'transform 0.2s' }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right content forms */}
        <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: '360px' }}>
          
          {/* Profile Section */}
          <div 
            id="profile-section" 
            className="card animate-fadeInUp" 
            data-testid="profile-section"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{
                padding: 'var(--space-5) var(--space-5) 0 var(--space-5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <h3 className="card-title flex items-center gap-2" style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                <User size={18} style={{ color: '#4F46E5' }} /> Profile Information
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                Update your identity details and contact methods.
              </p>
            </div>
            
            <form onSubmit={handleProfileSave} className="card-body" data-testid="profile-form" style={{ padding: 'var(--space-5)' }}>
              
              {/* Profile Header Card */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-4)', 
                  marginBottom: 'var(--space-5)', 
                  padding: 'var(--space-4)', 
                  background: 'rgba(79, 70, 229, 0.03)', 
                  borderRadius: 'var(--radius-xl)', 
                  border: '1px solid rgba(79, 70, 229, 0.08)' 
                }}
              >
                <div 
                  className="avatar avatar-xl" 
                  style={{ 
                    background: user.avatar ? 'var(--bg-hover)' : getAvatarColor(`${user.firstName} ${user.lastName}`),
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '20px',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                  ) : (
                    `${user.firstName[0]}${user.lastName[0]}`
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {user.firstName} {user.lastName}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '2px 0 4px 0' }}>
                    {user.email}
                  </p>
                  <span 
                    className="badge"
                    style={{
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: 'rgba(79, 70, 229, 0.08)',
                      color: '#4F46E5',
                      borderRadius: 'var(--radius-md)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Form Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>First Name</label>
                    <input 
                      className="form-input" 
                      value={profile.firstName} 
                      onChange={e => setProfile({ ...profile, firstName: e.target.value })} 
                      data-testid="settings-firstname" 
                      style={{ padding: '10px 14px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', outline: 'none' }}
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>Last Name</label>
                    <input 
                      className="form-input" 
                      value={profile.lastName} 
                      onChange={e => setProfile({ ...profile, lastName: e.target.value })} 
                      data-testid="settings-lastname" 
                      style={{ padding: '10px 14px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', outline: 'none' }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>Email Address</label>
                    <input 
                      className="form-input" 
                      value={user.email} 
                      disabled 
                      data-testid="settings-email" 
                      style={{ padding: '10px 14px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', outline: 'none', backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>Phone Number</label>
                    <input 
                      className="form-input" 
                      value={profile.phone} 
                      onChange={e => setProfile({ ...profile, phone: e.target.value })} 
                      placeholder="+1-555-0000" 
                      data-testid="settings-phone" 
                      style={{ padding: '10px 14px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', outline: 'none' }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>Department</label>
                    <input 
                      className="form-input" 
                      value={user.department} 
                      disabled 
                      style={{ padding: '10px 14px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', outline: 'none', backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>Position</label>
                    <input 
                      className="form-input" 
                      value={user.position} 
                      disabled 
                      style={{ padding: '10px 14px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', outline: 'none', backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-5)', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="submit" 
                  className={`btn btn-primary ${savingProfile ? 'btn-loading' : ''}`} 
                  disabled={savingProfile} 
                  data-testid="save-profile-btn"
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Password Section */}
          <div 
            id="password-section" 
            className="card animate-fadeInUp" 
            data-testid="password-section"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div 
              style={{
                padding: 'var(--space-5) var(--space-5) 0 var(--space-5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <h3 className="card-title flex items-center gap-2" style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                <Lock size={18} style={{ color: '#4F46E5' }} /> Change Password
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                Update your account password periodically to remain secure.
              </p>
            </div>
            
            <form onSubmit={handlePasswordChange} className="card-body" data-testid="password-form" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>Current Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={passwords.currentPassword} 
                    onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} 
                    required 
                    data-testid="current-password" 
                    style={{ padding: '10px 14px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', outline: 'none' }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>New Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={passwords.newPassword} 
                      onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} 
                      required 
                      placeholder="Min 6 characters" 
                      data-testid="new-password" 
                      style={{ padding: '10px 14px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', outline: 'none' }}
                    />
                  </div>
                  
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>Confirm New Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={passwords.confirmPassword} 
                      onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} 
                      required 
                      data-testid="confirm-new-password" 
                      style={{ padding: '10px 14px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-5)', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="submit" 
                  className={`btn btn-primary ${savingPassword ? 'btn-loading' : ''}`} 
                  disabled={savingPassword} 
                  data-testid="update-password-btn"
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Notifications Section */}
          <div 
            id="notifications-section" 
            className="card animate-fadeInUp" 
            data-testid="notifications-section"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div 
              style={{
                padding: 'var(--space-5) var(--space-5) 0 var(--space-5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <h3 className="card-title flex items-center gap-2" style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                <Bell size={18} style={{ color: '#4F46E5' }} /> Notification Preferences
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                Configure how and when you want to receive alerts and digests.
              </p>
            </div>
            
            <div className="card-body" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column' }}>
              {Object.entries(notifications).map(([key, value]) => (
                <div 
                  key={key} 
                  className="settings-row" 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: 'var(--space-4) 0', 
                    borderBottom: '1px solid var(--border-default)' 
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      Receive real-time notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()} updates.
                    </div>
                  </div>
                  
                  <ToggleSwitch
                    checked={value}
                    onChange={checked => setNotifications({ ...notifications, [key]: checked })}
                    testId={`toggle-${key}`}
                    label={key}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Account Info Section */}
          <div 
            id="account-section" 
            className="card animate-fadeInUp" 
            data-testid="account-section"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div 
              style={{
                padding: 'var(--space-5) var(--space-5) 0 var(--space-5)'
              }}
            >
              <h3 className="card-title flex items-center gap-2" style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                <ShieldCheck size={18} style={{ color: '#4F46E5' }} /> Account Info
              </h3>
            </div>
            
            <div className="card-body" style={{ padding: 'var(--space-5)' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 0', 
                  borderBottom: '1px solid var(--border-default)' 
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Access Privilege Level</div>
                <span 
                  className="badge"
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: 'rgba(79, 70, 229, 0.08)',
                    color: '#4F46E5',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  {user.role}
                </span>
              </div>
              
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 0', 
                  borderBottom: '1px solid var(--border-default)' 
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Member Since</div>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {user.joinDate}
                </span>
              </div>
              
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 0 0 0' 
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Account ID</div>
                <span 
                  style={{ 
                    fontSize: '11px', 
                    color: 'var(--text-muted)', 
                    fontFamily: 'var(--font-mono)', 
                    backgroundColor: 'var(--bg-hover)', 
                    padding: '4px 10px', 
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)' 
                  }}
                >
                  {user.id}
                </span>
              </div>
            </div>
          </div>

          {/* System Settings Section */}
          <div 
            id="system-section" 
            className="card animate-fadeInUp" 
            data-testid="system-section"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{
                padding: 'var(--space-5) var(--space-5) 0 var(--space-5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <h3 className="card-title flex items-center gap-2" style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                <SettingsIcon size={18} style={{ color: '#4F46E5' }} /> System Settings
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                Manage workspace defaults and reset application environment data.
              </p>
            </div>
            
            <div className="card-body" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div 
                style={{
                  display: 'flex',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-4)',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.04) 0%, rgba(249, 115, 22, 0.04) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  borderRadius: 'var(--radius-xl)',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ color: '#EF4444', display: 'flex', marginTop: '2px' }}>
                  <Info size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: '#DC2626' }}>
                    Danger Zone: Reset Application State
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Resets the in-memory database to its initial seeded state, deletes all user updates, clears active session storage, and logs you out immediately. This action is irreversible.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                <button
                  onClick={handleResetState}
                  disabled={isResetting}
                  data-testid="reset-state-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 600,
                    fontSize: 'var(--text-sm)',
                    cursor: isResetting ? 'not-allowed' : 'pointer',
                    background: 'linear-gradient(135deg, #EF4444 0%, #E11D48 100%)',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                    transition: 'all 0.2s ease',
                    opacity: isResetting ? 0.7 : 1
                  }}
                  onMouseEnter={e => {
                    if (!isResetting) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.35)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isResetting) {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.25)';
                    }
                  }}
                  onMouseDown={e => {
                    if (!isResetting) {
                      e.currentTarget.style.transform = 'scale(0.98)';
                    }
                  }}
                  onMouseUp={e => {
                    if (!isResetting) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                >
                  {isResetting ? 'Resetting System...' : 'Reset Application State'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

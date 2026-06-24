'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import CustomSelect from '@/components/ui/CustomSelect';
import { Search, ArrowUpDown, Pencil, Trash2, Users, AlertTriangle, ChevronLeft, ChevronRight, X, Plus, LayoutGrid, List, Mail, Phone, Calendar, UserCheck, ShieldAlert } from 'lucide-react';

interface EmployeeData { id: string; firstName: string; lastName: string; email: string; department: string; position: string; status: string; phone: string; role: string; joinDate: string; }

const departments = ['all', 'Engineering', 'Design', 'Marketing', 'HR', 'Finance', 'Management'];

function getAvatarColor(name: string) { 
  let h = 0; 
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h); 
  return `hsl(${Math.abs(h % 360)}, 65%, 55%)`; 
}

export default function EmployeesPage() {
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('firstName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    department: 'Engineering', 
    position: '', 
    phone: '', 
    role: 'employee', 
    status: 'active' 
  });

  const isAdmin = user?.role === 'admin';

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchDebounced(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const fetchEmployees = useCallback(async (silent = false) => {
    if (!token) return;
    const showLoader = !silent && !hasLoadedRef.current;
    if (showLoader) setLoading(true);
    const params = new URLSearchParams({ 
      search: searchDebounced, 
      department: deptFilter, 
      status: statusFilter, 
      sortBy, 
      sortOrder, 
      page: String(page), 
      limit: '8' 
    });
    try {
      const res = await fetch(`/api/employees?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data);
        setTotalPages(data.totalPages);
        setTotal(data.total);
        hasLoadedRef.current = true;
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [token, searchDebounced, deptFilter, statusFilter, sortBy, sortOrder, page]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const openCreateModal = () => { 
    setEditingEmployee(null); 
    setFormData({ 
      firstName: '', 
      lastName: '', 
      email: '', 
      department: 'Engineering', 
      position: '', 
      phone: '', 
      role: 'employee', 
      status: 'active' 
    }); 
    setShowModal(true); 
  };

  const openEditModal = (emp: EmployeeData) => { 
    setEditingEmployee(emp); 
    setFormData({ 
      firstName: emp.firstName, 
      lastName: emp.lastName, 
      email: emp.email, 
      department: emp.department, 
      position: emp.position, 
      phone: emp.phone, 
      role: emp.role, 
      status: emp.status 
    }); 
    setShowModal(true); 
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingEmployee ? 'PUT' : 'POST';
    const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees';
    const res = await fetch(url, { 
      method, 
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
      body: JSON.stringify(formData) 
    });
    const data = await res.json();
    if (data.success) {
      addToast({ type: 'success', title: editingEmployee ? 'Employee updated' : 'Employee created' });
      setShowModal(false);
      fetchEmployees(true); // Silent reload
    }
    else addToast({ type: 'error', title: 'Error', message: data.error });
  };

  const handleDelete = async (id: string) => {
    const originalEmployees = [...employees];
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    setShowDeleteConfirm(null);

    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        addToast({ type: 'success', title: 'Employee deleted' });
        fetchEmployees(true); // Silent sync
      } else {
        setEmployees(originalEmployees);
        addToast({ type: 'error', title: 'Error deleting employee', message: data.error });
      }
    } catch (err) {
      setEmployees(originalEmployees);
      addToast({ type: 'error', title: 'Network Error', message: 'Failed to connect to the server.' });
    }
  };

  return (
    <div data-testid="employees-page" className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 'var(--space-4)',
          borderBottom: '1px solid var(--border-default)',
          paddingBottom: 'var(--space-4)'
        }}
      >
        <div>
          <h2 className="page-title" style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Employee Directory
          </h2>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            {total} employee{total !== 1 ? 's' : ''} active in the workspace
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Grid/Table Toggle */}
          <div 
            style={{ 
              display: 'flex', 
              gap: '2px', 
              padding: '3px', 
              backgroundColor: 'rgba(241, 245, 249, 0.7)', 
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)'
            }}
          >
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                padding: '6px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'table' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'table' ? 'var(--primary-700)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'table' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s'
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                padding: '6px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'grid' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--primary-700)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s'
              }}
              title="Grid Cards View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {isAdmin && (
            <button 
              className="btn btn-primary" 
              onClick={openCreateModal} 
              data-testid="add-employee-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: '10px 18px',
                fontWeight: 600,
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Plus size={18} /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div 
        className="filter-bar animate-fadeIn" 
        data-testid="employee-filters"
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          alignItems: 'center',
          flexWrap: 'wrap',
          background: 'var(--bg-surface)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div className="search-bar" style={{ flex: 1, minWidth: '240px', margin: 0, position: 'relative' }}>
          <span className="search-bar-icon" style={{ display: 'flex', pointerEvents: 'none' }}><Search size={18} /></span>
          <input 
            className="search-bar-input" 
            placeholder="Search employees..." 
            value={searchInput} 
            onChange={e => { setSearchInput(e.target.value); setPage(1); }} 
            data-testid="employee-search"
            style={{ height: '40px', paddingLeft: '38px', fontSize: 'var(--text-sm)' }}
          />
          {searchInput && (
            <button 
              className="search-bar-clear" 
              onClick={() => setSearchInput('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px'
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <CustomSelect 
            value={deptFilter} 
            onChange={val => { setDeptFilter(val); setPage(1); }} 
            testId="employee-dept-filter"
            options={departments.map(d => ({ value: d, label: d === 'all' ? 'All Departments' : d }))}
            minWidth="160px"
          />
          
          <CustomSelect 
            value={statusFilter} 
            onChange={val => { setStatusFilter(val); setPage(1); }} 
            testId="employee-status-filter"
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
            minWidth="140px"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div 
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-12)',
            textAlign: 'center',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <div style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
            <Users size={48} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>No employees found</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <>
          {/* Table View Mode */}
          {viewMode === 'table' ? (
            <div 
              className="data-table-wrapper animate-fadeInUp"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden'
              }}
            >
              <table className="data-table" data-testid="employee-table" role="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
                    <th 
                      className={sortBy === 'firstName' ? `sorted ${sortOrder}` : ''} 
                      onClick={() => handleSort('firstName')} 
                      style={{ cursor: 'pointer', padding: '14px 20px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', userSelect: 'none' }}
                    >
                      <span className="flex items-center gap-1.5">
                        Name <ArrowUpDown size={13} style={{ opacity: sortBy === 'firstName' ? 1 : 0.4 }} />
                      </span>
                    </th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Email</th>
                    <th 
                      className={sortBy === 'department' ? `sorted ${sortOrder}` : ''} 
                      onClick={() => handleSort('department')} 
                      style={{ cursor: 'pointer', padding: '14px 20px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', userSelect: 'none' }}
                    >
                      <span className="flex items-center gap-1.5">
                        Department <ArrowUpDown size={13} style={{ opacity: sortBy === 'department' ? 1 : 0.4 }} />
                      </span>
                    </th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Position</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Status</th>
                    {isAdmin && <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr 
                      key={emp.id} 
                      data-testid={`employee-row-${emp.id}`}
                      style={{ borderBottom: '1px solid var(--border-default)', transition: 'background-color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '12px 20px' }}>
                        <div className="flex items-center gap-3">
                          <div 
                            className="avatar avatar-sm" 
                            style={{ 
                              background: getAvatarColor(`${emp.firstName} ${emp.lastName}`),
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '12px'
                            }}
                          >
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                          <Link 
                            href={`/employees/${emp.id}`} 
                            className="font-semibold" 
                            style={{ color: '#4F46E5', textDecoration: 'none', fontSize: 'var(--text-sm)' }} 
                            data-testid={`profile-link-${emp.id}`}
                          >
                            {emp.firstName} {emp.lastName}
                          </Link>
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                        {emp.email}
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <span 
                          className="badge"
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: 'rgba(79, 70, 229, 0.08)',
                            color: '#4F46E5',
                            borderRadius: 'var(--radius-md)'
                          }}
                        >
                          {emp.department}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                        {emp.position}
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <span 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: emp.status === 'active' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            color: emp.status === 'active' ? 'var(--success)' : 'var(--danger)'
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: emp.status === 'active' ? 'var(--success)' : 'var(--danger)' }} />
                          {emp.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn btn-ghost btn-sm" 
                              onClick={() => openEditModal(emp)} 
                              data-testid={`edit-employee-${emp.id}`}
                              style={{ padding: '6px', borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
                            >
                              <Pencil size={15} />
                            </button>
                            <button 
                              className="btn btn-ghost btn-sm" 
                              onClick={() => setShowDeleteConfirm(emp.id)} 
                              data-testid={`delete-employee-${emp.id}`}
                              style={{ padding: '6px', borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--danger)' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View Mode */
            <div 
              className="stagger-children" 
              data-testid="employee-table" // Preserve same testing container tag
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'var(--space-5)'
              }}
            >
              {employees.map(emp => {
                const avatarColor = getAvatarColor(`${emp.firstName} ${emp.lastName}`);
                return (
                  <div
                    key={emp.id}
                    data-testid={`employee-row-${emp.id}`} // Preserve testing row tag
                    className="card relative flex flex-col"
                    style={{
                      borderRadius: 'var(--radius-xl)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      boxShadow: 'var(--shadow-sm)',
                      overflow: 'hidden',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      paddingBottom: 'var(--space-4)'
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
                    {/* Top cover banner */}
                    <div 
                      style={{ 
                        height: '60px', 
                        background: `linear-gradient(135deg, ${avatarColor} 0%, rgba(255,255,255,0) 100%)`, 
                        opacity: 0.15 
                      }} 
                    />
                    
                    {/* Employee Core Profile */}
                    <div style={{ padding: '0 var(--space-4)', marginTop: '-24px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <div 
                        style={{ 
                          width: '52px', 
                          height: '52px', 
                          borderRadius: '50%', 
                          background: avatarColor, 
                          color: '#fff', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '18px', 
                          fontWeight: 700,
                          border: '3px solid var(--bg-surface)',
                          boxShadow: 'var(--shadow-xs)'
                        }}
                      >
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>

                      <div style={{ marginTop: '4px' }}>
                        <Link 
                          href={`/employees/${emp.id}`} 
                          className="font-bold" 
                          style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: 'var(--text-base)', display: 'block', transition: 'color 0.2s' }}
                          data-testid={`profile-link-${emp.id}`}
                          onMouseEnter={e => e.currentTarget.style.color = '#4F46E5'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                        >
                          {emp.firstName} {emp.lastName}
                        </Link>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {emp.position}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                        <span 
                          style={{
                            padding: '3px 8px',
                            fontSize: '10px',
                            fontWeight: 600,
                            backgroundColor: 'rgba(79, 70, 229, 0.08)',
                            color: '#4F46E5',
                            borderRadius: 'var(--radius-md)'
                          }}
                        >
                          {emp.department}
                        </span>
                        
                        <span 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: emp.status === 'active' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            color: emp.status === 'active' ? 'var(--success)' : 'var(--danger)'
                          }}
                        >
                          <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: emp.status === 'active' ? 'var(--success)' : 'var(--danger)' }} />
                          {emp.status}
                        </span>
                      </div>

                      {/* Contact Info lines */}
                      <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <a 
                          href={`mailto:${emp.email}`} 
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textDecoration: 'none' }}
                          title={emp.email}
                        >
                          <Mail size={12} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.email}</span>
                        </a>
                        
                        {emp.phone && (
                          <a 
                            href={`tel:${emp.phone}`} 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textDecoration: 'none' }}
                          >
                            <Phone size={12} style={{ color: 'var(--text-muted)' }} />
                            <span>{emp.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <div 
                        style={{ 
                          display: 'flex', 
                          gap: '6px', 
                          borderTop: '1px solid var(--border-default)', 
                          paddingTop: 'var(--space-3)', 
                          margin: 'var(--space-3) var(--space-4) 0 var(--space-4)',
                          justifyContent: 'flex-end' 
                        }}
                      >
                        <button 
                          className="btn btn-ghost btn-sm" 
                          onClick={() => openEditModal(emp)} 
                          data-testid={`edit-employee-${emp.id}`}
                          style={{ padding: '6px', borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          onClick={() => setShowDeleteConfirm(emp.id)} 
                          data-testid={`delete-employee-${emp.id}`}
                          style={{ padding: '6px', borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div 
              className="pagination" 
              data-testid="employee-pagination"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--border-default)',
                marginTop: 'var(--space-2)'
              }}
            >
              <span className="pagination-info" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Page {page} of {totalPages}
              </span>
              <div className="pagination-controls" style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className="pagination-btn" 
                  disabled={page <= 1} 
                  onClick={() => setPage(p => p - 1)} 
                  data-testid="prev-page"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface)',
                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                    opacity: page <= 1 ? 0.4 : 1,
                    color: 'var(--text-secondary)'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button 
                    key={i} 
                    className={`pagination-btn ${page === i + 1 ? 'active' : ''}`} 
                    onClick={() => setPage(i + 1)} 
                    data-testid={`page-${i + 1}`}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-default)',
                      cursor: 'pointer',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600,
                      backgroundColor: page === i + 1 ? '#4F46E5' : 'var(--bg-surface)',
                      color: page === i + 1 ? '#fff' : 'var(--text-secondary)',
                      borderColor: page === i + 1 ? '#4F46E5' : 'var(--border-default)'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  className="pagination-btn" 
                  disabled={page >= totalPages} 
                  onClick={() => setPage(p => p + 1)} 
                  data-testid="next-page"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface)',
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                    opacity: page >= totalPages ? 0.4 : 1,
                    color: 'var(--text-secondary)'
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Slide-out Create/Edit Drawer */}
      {showModal && (
        <div 
          className="drawer-overlay animate-fadeIn" 
          onClick={() => setShowModal(false)} 
          data-testid="employee-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <div 
            className="drawer animate-slideInRight" 
            onClick={e => e.stopPropagation()} 
            role="dialog" 
            aria-labelledby="employee-modal-title"
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--bg-surface)',
              height: '100%',
              boxShadow: 'var(--shadow-overlay)',
              display: 'flex',
              flexDirection: 'column',
              padding: 'var(--space-6)',
              overflowY: 'auto'
            }}
          >
            {/* Header */}
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid var(--border-default)', 
                paddingBottom: 'var(--space-4)',
                marginBottom: 'var(--space-5)'
              }}
            >
              <div>
                <h3 className="drawer-title" id="employee-modal-title" style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
                  {editingEmployee ? 'Edit Employee Details' : 'Register New Employee'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  {editingEmployee ? 'Modify member information and privileges.' : 'Fill in the information to invite a new colleague.'}
                </p>
              </div>
              
              <button 
                className="drawer-close" 
                onClick={() => setShowModal(false)} 
                data-testid="close-modal"
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '6px',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} data-testid="employee-form" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', flex: 1 }}>
                
                {/* Personal Info Section */}
                <div>
                  <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: '#4F46E5', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>
                    Personal Details
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>First Name</label>
                        <input 
                          className="form-input" 
                          value={formData.firstName} 
                          onChange={e => setFormData({ ...formData, firstName: e.target.value })} 
                          required 
                          data-testid="emp-firstname" 
                          style={{ padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', outline: 'none' }}
                        />
                      </div>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>Last Name</label>
                        <input 
                          className="form-input" 
                          value={formData.lastName} 
                          onChange={e => setFormData({ ...formData, lastName: e.target.value })} 
                          required 
                          data-testid="emp-lastname" 
                          style={{ padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', outline: 'none' }}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>Email Address</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={formData.email} 
                        onChange={e => setFormData({ ...formData, email: e.target.value })} 
                        required 
                        data-testid="emp-email" 
                        style={{ padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', outline: 'none' }}
                      />
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>Phone Number</label>
                      <input 
                        className="form-input" 
                        value={formData.phone} 
                        onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                        data-testid="emp-phone" 
                        placeholder="+84 90 123 4567"
                        style={{ padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: 'var(--border-default)' }} />

                {/* Job Position Section */}
                <div>
                  <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: '#4F46E5', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>
                    Employment & Role
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>Department</label>
                        <CustomSelect
                          value={formData.department}
                          onChange={val => setFormData({ ...formData, department: val })}
                          testId="emp-department"
                          width="100%"
                          icon={null}
                          options={departments.filter(d => d !== 'all').map(d => ({ value: d, label: d }))}
                        />
                      </div>
                      
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>Position</label>
                        <input 
                          className="form-input" 
                          value={formData.position} 
                          onChange={e => setFormData({ ...formData, position: e.target.value })} 
                          required
                          placeholder="e.g. Lead Designer"
                          data-testid="emp-position" 
                          style={{ padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>Access Role</label>
                        <CustomSelect
                          value={formData.role}
                          onChange={val => setFormData({ ...formData, role: val })}
                          testId="emp-role"
                          width="100%"
                          icon={null}
                          options={[
                            { value: 'employee', label: 'Employee' },
                            { value: 'manager', label: 'Manager' },
                            { value: 'admin', label: 'Admin' }
                          ]}
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>Status</label>
                        <CustomSelect
                          value={formData.status}
                          onChange={val => setFormData({ ...formData, status: val })}
                          testId="emp-status"
                          width="100%"
                          icon={null}
                          options={[
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' }
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div 
                style={{ 
                  display: 'flex', 
                  gap: 'var(--space-3)', 
                  borderTop: '1px solid var(--border-default)', 
                  paddingTop: 'var(--space-4)', 
                  marginTop: 'var(--space-6)' 
                }}
              >
                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Cancel
                </button>
                
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  data-testid="save-employee"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: '#4F46E5',
                    color: '#fff',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {editingEmployee ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="modal-overlay animate-fadeIn" 
          onClick={() => setShowDeleteConfirm(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)'
          }}
        >
          <div 
            className="modal modal-sm animate-scaleIn" 
            onClick={e => e.stopPropagation()} 
            role="dialog" 
            aria-labelledby="delete-confirm-title"
            style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-overlay)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-5)'
            }}
          >
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                  color: 'var(--danger)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <AlertTriangle size={24} />
              </div>
              
              <div>
                <h3 id="delete-confirm-title" style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Delete Employee?
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Are you sure you want to remove this employee? This action is permanent and cannot be undone.
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowDeleteConfirm(null)} 
                data-testid="cancel-delete"
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-lg)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)'
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => handleDelete(showDeleteConfirm)} 
                data-testid="confirm-delete"
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-lg)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: 'var(--danger)',
                  color: '#fff'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

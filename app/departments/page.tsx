'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import CustomSelect from '@/components/ui/CustomSelect';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { getAvatarColor } from '@/lib/utils';
import {
  AlertTriangle,
  Building2,
  Check,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  UserCog,
  Users,
  X
} from 'lucide-react';

type DepartmentStatus = 'active' | 'inactive';
type ApiSource = 'api' | 'employees-fallback';

interface EmployeeData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  status: string;
  role: string;
}

interface DepartmentView {
  id: string;
  name: string;
  description: string;
  managerId: string;
  managerName: string;
  status: DepartmentStatus;
  employeeCount: number;
  activeEmployeeCount: number;
  openTaskCount: number;
  pendingLeaveCount: number;
  source: ApiSource;
}

interface DepartmentFormState {
  name: string;
  description: string;
  managerId: string;
  status: DepartmentStatus;
}

const EMPTY_FORM: DepartmentFormState = {
  name: '',
  description: '',
  managerId: '',
  status: 'active'
};

const FALLBACK_DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'HR', 'Finance', 'Management'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function asStatus(value: unknown): DepartmentStatus {
  return value === 'inactive' ? 'inactive' : 'active';
}

function employeeName(employee: EmployeeData): string {
  return `${employee.firstName} ${employee.lastName}`.trim();
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) return fallback;
  return typeof payload.error === 'string' ? payload.error : fallback;
}

function parseEmployees(payload: unknown): EmployeeData[] {
  if (!isRecord(payload) || !Array.isArray(payload.data)) return [];

  return payload.data.reduce<EmployeeData[]>((items, item) => {
    if (!isRecord(item)) return items;
    const id = asString(item.id);
    const firstName = asString(item.firstName);
    const lastName = asString(item.lastName);
    const email = asString(item.email);
    const department = asString(item.department);
    if (!id || !email) return items;

    items.push({
      id,
      firstName,
      lastName,
      email,
      department,
      position: asString(item.position),
      status: asString(item.status) || 'active',
      role: asString(item.role) || 'employee'
    });
    return items;
  }, []);
}

function parseDepartments(payload: unknown, employees: EmployeeData[]): DepartmentView[] {
  if (!isRecord(payload) || !Array.isArray(payload.data)) return [];

  return payload.data.reduce<DepartmentView[]>((items, item) => {
    if (!isRecord(item)) return items;
    const name = asString(item.name).trim();
    if (!name) return items;

    const managerId = asString(item.managerId);
    const matchingManager = employees.find(employee => employee.id === managerId);
    const members = employees.filter(employee => employee.department === name);

    items.push({
      id: asString(item.id) || `department-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      description: asString(item.description),
      managerId,
      managerName: asString(item.managerName) || (matchingManager ? employeeName(matchingManager) : ''),
      status: asStatus(item.status),
      employeeCount: asNumber(item.employeeCount) || members.length,
      activeEmployeeCount: asNumber(item.activeEmployeeCount) || members.filter(employee => employee.status === 'active').length,
      openTaskCount: asNumber(item.openTaskCount),
      pendingLeaveCount: asNumber(item.pendingLeaveCount),
      source: 'api'
    });
    return items;
  }, []);
}

function buildFallbackDepartments(employees: EmployeeData[]): DepartmentView[] {
  const names = [...FALLBACK_DEPARTMENTS];
  employees.forEach(employee => {
    if (employee.department && !names.includes(employee.department)) names.push(employee.department);
  });

  return names.map(name => {
    const members = employees.filter(employee => employee.department === name);
    const manager = members.find(employee => employee.role === 'manager' || employee.role === 'admin');

    return {
      id: `fallback-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      description: 'Department details will be editable after the Department API is available.',
      managerId: manager?.id || '',
      managerName: manager ? employeeName(manager) : '',
      status: 'active',
      employeeCount: members.length,
      activeEmployeeCount: members.filter(employee => employee.status === 'active').length,
      openTaskCount: 0,
      pendingLeaveCount: 0,
      source: 'employees-fallback'
    };
  });
}

export default function DepartmentsPage() {
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const [departments, setDepartments] = useState<DepartmentView[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [departmentApiAvailable, setDepartmentApiAvailable] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DepartmentStatus>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentView | null>(null);
  const [formData, setFormData] = useState<DepartmentFormState>(EMPTY_FORM);
  const [confirmDepartment, setConfirmDepartment] = useState<DepartmentView | null>(null);
  const [memberDepartment, setMemberDepartment] = useState<DepartmentView | null>(null);
  const [memberDraftIds, setMemberDraftIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  const managerOptions = useMemo(() => (
    employees.filter(employee => (
      employee.status === 'active' && (employee.role === 'manager' || employee.role === 'admin')
    ))
  ), [employees]);

  const loadEmployees = useCallback(async (): Promise<EmployeeData[]> => {
    if (!token) return [];
    const res = await fetch('/api/employees?status=all&page=1&limit=200', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return [];
    const payload: unknown = await res.json();
    return parseEmployees(payload);
  }, [token]);

  const loadDepartments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const employeeList = await loadEmployees();
      setEmployees(employeeList);

      const res = await fetch('/api/departments?status=all&includeStats=true', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const payload: unknown = await res.json();
        const parsedDepartments = parseDepartments(payload, employeeList);
        if (parsedDepartments.length > 0) {
          setDepartments(parsedDepartments);
          setDepartmentApiAvailable(true);
          return;
        }
      }

      setDepartments(buildFallbackDepartments(employeeList));
      setDepartmentApiAvailable(false);
    } catch {
      setDepartments(buildFallbackDepartments([]));
      setDepartmentApiAvailable(false);
      setError('Unable to load live department data. Showing safe fallback departments.');
    } finally {
      setLoading(false);
    }
  }, [loadEmployees, token]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const openCreateDepartment = useCallback(() => {
    if (!departmentApiAvailable) {
      addToast({
        type: 'warning',
        title: 'Department API unavailable',
        message: 'Create and edit actions require the backend Department API.'
      });
      return;
    }

    setEditingDepartment(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  }, [addToast, departmentApiAvailable]);

  useEffect(() => {
    const handleOpenCreate = () => {
      openCreateDepartment();
    };
    window.addEventListener('open-add-department', handleOpenCreate);
    return () => window.removeEventListener('open-add-department', handleOpenCreate);
  }, [openCreateDepartment]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setShowForm(false);
      setConfirmDepartment(null);
      setMemberDepartment(null);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const filteredDepartments = useMemo(() => {
    const search = searchInput.trim().toLowerCase();
    return departments.filter(department => {
      const matchesSearch = !search ||
        department.name.toLowerCase().includes(search) ||
        department.managerName.toLowerCase().includes(search) ||
        department.description.toLowerCase().includes(search);
      const matchesStatus = statusFilter === 'all' || department.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [departments, searchInput, statusFilter]);

  const stats = useMemo(() => {
    const activeDepartments = departments.filter(department => department.status === 'active').length;
    const assignedEmployees = departments.reduce((sum, department) => sum + department.activeEmployeeCount, 0);
    const missingManagers = departments.filter(department => department.status === 'active' && !department.managerName).length;

    return {
      total: departments.length,
      active: activeDepartments,
      assignedEmployees,
      missingManagers
    };
  }, [departments]);

  const openEditDepartment = (department: DepartmentView) => {
    if (!departmentApiAvailable || department.source !== 'api') {
      addToast({
        type: 'warning',
        title: 'Read-only fallback',
        message: 'Editing requires the backend Department API.'
      });
      return;
    }

    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
      managerId: department.managerId,
      status: department.status
    });
    setShowForm(true);
  };

  const saveDepartment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !departmentApiAvailable) return;

    const name = formData.name.trim();
    if (!name) {
      addToast({ type: 'error', title: 'Department name is required' });
      return;
    }

    setSaving(true);
    const url = editingDepartment ? `/api/departments/${editingDepartment.id}` : '/api/departments';
    const method = editingDepartment ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description: formData.description.trim(),
          managerId: formData.managerId || undefined,
          status: formData.status
        })
      });
      const payload: unknown = await res.json();

      if (!res.ok || !isRecord(payload) || payload.success !== true) {
        addToast({ type: 'error', title: 'Unable to save department', message: getErrorMessage(payload, 'Please try again.') });
        return;
      }

      addToast({ type: 'success', title: editingDepartment ? 'Department updated' : 'Department created' });
      setShowForm(false);
      await loadDepartments();
    } catch {
      addToast({ type: 'error', title: 'Network error', message: 'Unable to reach the Department API.' });
    } finally {
      setSaving(false);
    }
  };

  const deactivateDepartment = async () => {
    if (!token || !confirmDepartment || !departmentApiAvailable) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/departments/${confirmDepartment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'inactive' })
      });
      const payload: unknown = await res.json();

      if (!res.ok || !isRecord(payload) || payload.success !== true) {
        addToast({ type: 'error', title: 'Unable to deactivate department', message: getErrorMessage(payload, 'Please try again.') });
        return;
      }

      addToast({ type: 'success', title: 'Department deactivated' });
      setConfirmDepartment(null);
      await loadDepartments();
    } catch {
      addToast({ type: 'error', title: 'Network error', message: 'Unable to reach the Department API.' });
    } finally {
      setSaving(false);
    }
  };

  const openMembers = async (department: DepartmentView) => {
    if (!departmentApiAvailable || department.source !== 'api') {
      addToast({
        type: 'warning',
        title: 'Members API unavailable',
        message: 'Member assignment requires the backend Department members API.'
      });
      return;
    }

    setMemberDepartment(department);
    setMemberSearch('');
    setMemberLoading(true);

    try {
      const res = await fetch(`/api/departments/${department.id}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const payload: unknown = await res.json();
        const members = parseEmployees(isRecord(payload) && Array.isArray(payload.data)
          ? payload
          : { data: isRecord(payload) ? payload.members : [] });
        setMemberDraftIds(members.map(member => member.id));
      } else {
        setMemberDraftIds(employees.filter(employee => employee.department === department.name).map(employee => employee.id));
      }
    } catch {
      setMemberDraftIds(employees.filter(employee => employee.department === department.name).map(employee => employee.id));
    } finally {
      setMemberLoading(false);
    }
  };

  const saveMembers = async () => {
    if (!token || !memberDepartment || !departmentApiAvailable) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/departments/${memberDepartment.id}/members`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userIds: memberDraftIds })
      });
      const payload: unknown = await res.json();

      if (!res.ok || !isRecord(payload) || payload.success !== true) {
        addToast({ type: 'error', title: 'Unable to save members', message: getErrorMessage(payload, 'Please try again.') });
        return;
      }

      addToast({ type: 'success', title: 'Department members updated' });
      setMemberDepartment(null);
      await loadDepartments();
    } catch {
      addToast({ type: 'error', title: 'Network error', message: 'Unable to reach the Department members API.' });
    } finally {
      setSaving(false);
    }
  };

  const visibleMemberEmployees = employees.filter(employee => {
    const search = memberSearch.trim().toLowerCase();
    if (!search) return true;
    return employeeName(employee).toLowerCase().includes(search) ||
      employee.email.toLowerCase().includes(search) ||
      employee.department.toLowerCase().includes(search);
  });

  return (
    <div className="departments-page animate-fadeIn" data-testid="departments-page">
      <div className="departments-toolbar" data-testid="department-filters">
        <div className="search-bar departments-search">
          <span className="search-bar-icon"><Search size={18} /></span>
          <input
            className="search-bar-input"
            value={searchInput}
            onChange={event => setSearchInput(event.target.value)}
            placeholder="Search departments..."
            aria-label="Search departments"
            data-testid="department-search"
          />
          {searchInput && (
            <button
              type="button"
              className="department-icon-btn"
              onClick={() => setSearchInput('')}
              aria-label="Clear department search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="departments-toolbar-actions">
          <CustomSelect
            value={statusFilter}
            onChange={value => setStatusFilter(value === 'inactive' || value === 'active' ? value : 'all')}
            testId="department-status-filter"
            minWidth="150px"
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadDepartments}
            data-testid="refresh-departments"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          {isAdmin && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={openCreateDepartment}
              disabled={!departmentApiAvailable}
              data-testid="create-department-inline-btn"
              title={departmentApiAvailable ? 'Create department' : 'Requires Department API'}
            >
              <Building2 size={16} /> New Department
            </button>
          )}
        </div>
      </div>

      {!loading && !departmentApiAvailable && (
        <div className="department-inline-alert" role="status">
          <AlertTriangle size={16} />
          Department API is not available yet. This page is showing read-only department data derived from Employees.
        </div>
      )}

      {!loading && error && (
        <div className="department-inline-alert department-inline-alert-danger" role="alert">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div className="department-stats-grid" data-testid="department-stats">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton" style={{ height: 96, borderRadius: 'var(--radius-lg)' }} />
          ))
        ) : (
          <>
            <div className="department-stat-card">
              <span className="department-stat-label">Total Departments</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="department-stat-card">
              <span className="department-stat-label">Active Departments</span>
              <strong>{stats.active}</strong>
            </div>
            <div className="department-stat-card">
              <span className="department-stat-label">Employees Assigned</span>
              <strong>{stats.assignedEmployees}</strong>
            </div>
            <div className="department-stat-card">
              <span className="department-stat-label">Without Manager</span>
              <strong>{stats.missingManagers}</strong>
            </div>
          </>
        )}
      </div>

      <div className="departments-content">
        {loading ? (
          <div className="department-loading-list" data-testid="departments-loading">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="empty-state department-empty-state" data-testid="departments-empty">
            <Building2 className="empty-state-icon" size={44} strokeWidth={1.5} />
            <div className="empty-state-title">No departments found</div>
            <p>Adjust search or status filters to broaden the list.</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearchInput('');
                setStatusFilter('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="data-table-wrapper departments-table-wrapper">
              <table className="data-table departments-table" data-testid="department-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Manager</th>
                    <th>Employees</th>
                    <th>Open Tasks</th>
                    <th>Pending Leaves</th>
                    <th>Status</th>
                    {isAdmin && <th className="department-actions-header">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.map(department => (
                    <tr key={department.id} data-testid={`department-row-${department.id}`}>
                      <td>
                        <div className="department-name-cell">
                          <div className="department-avatar">
                            <Building2 size={16} />
                          </div>
                          <div>
                            <div className="department-name">{department.name}</div>
                            <div className="department-description">{department.description || 'No description provided'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {department.managerName ? (
                          <div className="department-manager-cell">
                            <span
                              className="avatar avatar-sm"
                              style={{ background: getAvatarColor(department.managerName) }}
                            >
                              {getInitials(department.managerName)}
                            </span>
                            <span>{department.managerName}</span>
                          </div>
                        ) : (
                          <span className="department-muted">Unassigned</span>
                        )}
                      </td>
                      <td>
                        <strong>{department.activeEmployeeCount}</strong>
                        <span className="department-muted"> / {department.employeeCount}</span>
                      </td>
                      <td>{department.source === 'api' ? department.openTaskCount : '-'}</td>
                      <td>{department.source === 'api' ? department.pendingLeaveCount : '-'}</td>
                      <td>
                        <span className={`badge department-status-badge ${department.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                          {department.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td>
                          <div className="department-row-actions">
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => openEditDepartment(department)}
                              disabled={!departmentApiAvailable || department.source !== 'api'}
                              aria-label={`Edit ${department.name}`}
                              data-testid={`edit-department-${department.id}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => openMembers(department)}
                              disabled={!departmentApiAvailable || department.source !== 'api'}
                              aria-label={`Manage members for ${department.name}`}
                              data-testid={`manage-members-${department.id}`}
                            >
                              <UserCog size={15} />
                            </button>
                            {department.status === 'active' && (
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm department-danger-action"
                                onClick={() => setConfirmDepartment(department)}
                                disabled={!departmentApiAvailable || department.source !== 'api'}
                                aria-label={`Deactivate ${department.name}`}
                                data-testid={`deactivate-department-${department.id}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="departments-card-list" aria-label="Department cards">
              {filteredDepartments.map(department => (
                <article className="department-card" key={department.id} data-testid={`department-card-${department.id}`}>
                  <div className="department-card-header">
                    <div className="department-name-cell">
                      <div className="department-avatar"><Building2 size={16} /></div>
                      <div>
                        <div className="department-name">{department.name}</div>
                        <div className="department-description">{department.description || 'No description provided'}</div>
                      </div>
                    </div>
                    <span className={`badge department-status-badge ${department.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                      {department.status}
                    </span>
                  </div>
                  <div className="department-card-grid">
                    <div>
                      <span>Manager</span>
                      <strong>{department.managerName || 'Unassigned'}</strong>
                    </div>
                    <div>
                      <span>Employees</span>
                      <strong>{department.activeEmployeeCount} / {department.employeeCount}</strong>
                    </div>
                    <div>
                      <span>Open Tasks</span>
                      <strong>{department.source === 'api' ? department.openTaskCount : '-'}</strong>
                    </div>
                    <div>
                      <span>Pending Leaves</span>
                      <strong>{department.source === 'api' ? department.pendingLeaveCount : '-'}</strong>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="department-card-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => openEditDepartment(department)}
                        disabled={!departmentApiAvailable || department.source !== 'api'}
                      >
                        <Pencil size={15} /> Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => openMembers(department)}
                        disabled={!departmentApiAvailable || department.source !== 'api'}
                      >
                        <UserCog size={15} /> Members
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {showForm && (
        <div className="drawer-overlay animate-fadeIn" onClick={() => setShowForm(false)} data-testid="department-drawer-overlay">
          <div className="drawer department-drawer animate-slideInRight" onClick={event => event.stopPropagation()} role="dialog" aria-labelledby="department-form-title" aria-modal="true">
            <div className="drawer-header">
              <div>
                <h3 id="department-form-title" className="drawer-title">
                  {editingDepartment ? 'Edit Department' : 'New Department'}
                </h3>
                <p className="department-drawer-subtitle">
                  {editingDepartment ? 'Update department details without changing existing employee records directly.' : 'Create a department for employee grouping and reporting.'}
                </p>
              </div>
              <button type="button" className="drawer-close" onClick={() => setShowForm(false)} aria-label="Close department form" data-testid="close-department-form">
                <X size={20} />
              </button>
            </div>

            <form className="drawer-body department-form" onSubmit={saveDepartment} data-testid="department-form">
              <div className="form-group">
                <label className="form-label required" htmlFor="department-name">Department Name</label>
                <input
                  id="department-name"
                  className="form-input"
                  value={formData.name}
                  onChange={event => setFormData(prev => ({ ...prev, name: event.target.value }))}
                  maxLength={80}
                  required
                  data-testid="department-name"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="department-description">Description</label>
                <textarea
                  id="department-description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={event => setFormData(prev => ({ ...prev, description: event.target.value }))}
                  maxLength={500}
                  data-testid="department-description"
                />
              </div>

              <div className="department-form-row">
                <div className="form-group">
                  <label className="form-label">Manager</label>
                  <CustomSelect
                    value={formData.managerId || 'none'}
                    onChange={value => setFormData(prev => ({ ...prev, managerId: value === 'none' ? '' : value }))}
                    testId="department-manager"
                    width="100%"
                    icon={null}
                    options={[
                      { value: 'none', label: 'No Manager' },
                      ...managerOptions.map(employee => ({ value: employee.id, label: employeeName(employee) }))
                    ]}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <CustomSelect
                    value={formData.status}
                    onChange={value => setFormData(prev => ({ ...prev, status: value === 'inactive' ? 'inactive' : 'active' }))}
                    testId="department-status"
                    width="100%"
                    icon={null}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' }
                    ]}
                  />
                </div>
              </div>

              {editingDepartment && editingDepartment.employeeCount > 0 && editingDepartment.name !== formData.name.trim() && (
                <div className="department-inline-alert" role="status">
                  <AlertTriangle size={16} />
                  Employees assigned to this department will move to the new department name.
                </div>
              )}

              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} disabled={saving} data-testid="save-department">
                  {saving ? 'Saving' : editingDepartment ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDepartment && (
        <div className="modal-overlay animate-fadeIn" onClick={() => setConfirmDepartment(null)}>
          <div className="modal department-confirm-modal animate-scaleIn" onClick={event => event.stopPropagation()} role="dialog" aria-labelledby="deactivate-title" aria-modal="true">
            <div className="modal-body department-confirm-body">
              <div className="department-confirm-icon"><AlertTriangle size={24} /></div>
              <h3 id="deactivate-title">Deactivate Department?</h3>
              <p>
                {confirmDepartment.name} has {confirmDepartment.employeeCount} assigned employee{confirmDepartment.employeeCount === 1 ? '' : 's'}.
                Historical employee data will remain visible.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setConfirmDepartment(null)} data-testid="cancel-deactivate">
                Cancel
              </button>
              <button type="button" className={`btn btn-danger ${saving ? 'btn-loading' : ''}`} onClick={deactivateDepartment} disabled={saving} data-testid="confirm-deactivate">
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {memberDepartment && (
        <div className="drawer-overlay animate-fadeIn" onClick={() => setMemberDepartment(null)} data-testid="member-drawer-overlay">
          <div className="drawer department-drawer animate-slideInRight" onClick={event => event.stopPropagation()} role="dialog" aria-labelledby="members-title" aria-modal="true">
            <div className="drawer-header">
              <div>
                <h3 id="members-title" className="drawer-title">Manage Members</h3>
                <p className="department-drawer-subtitle">{memberDepartment.name}</p>
              </div>
              <button type="button" className="drawer-close" onClick={() => setMemberDepartment(null)} aria-label="Close member manager">
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body department-members-body">
              <div className="search-bar departments-search">
                <span className="search-bar-icon"><Search size={18} /></span>
                <input
                  className="search-bar-input"
                  value={memberSearch}
                  onChange={event => setMemberSearch(event.target.value)}
                  placeholder="Search employees..."
                  aria-label="Search employees for department assignment"
                  data-testid="member-search"
                />
              </div>

              {memberLoading ? (
                <div className="department-loading-list">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="skeleton department-member-skeleton" />
                  ))}
                </div>
              ) : (
                <div className="department-member-list">
                  {visibleMemberEmployees.map(employee => {
                    const checked = memberDraftIds.includes(employee.id);
                    const name = employeeName(employee);
                    return (
                      <label className="department-member-row" key={employee.id}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={event => {
                            setMemberDraftIds(prev => event.target.checked
                              ? [...prev, employee.id]
                              : prev.filter(id => id !== employee.id));
                          }}
                        />
                        <span className="avatar avatar-sm" style={{ background: getAvatarColor(name) }}>
                          {getInitials(name)}
                        </span>
                        <span className="department-member-info">
                          <strong>{name}</strong>
                          <span>{employee.department || 'Unassigned'} - {employee.position || employee.email}</span>
                        </span>
                        {checked && <Check size={16} className="department-member-check" />}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="drawer-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setMemberDepartment(null)}>
                Cancel
              </button>
              <button type="button" className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} onClick={saveMembers} disabled={saving || memberLoading} data-testid="save-members">
                Save Members
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

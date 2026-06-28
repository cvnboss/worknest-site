'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import CustomSelect from '@/components/ui/CustomSelect';
import { useAuth } from '@/lib/auth-context';
import { ClipboardList, Eye, RefreshCw, Search, ShieldCheck, UserCog, X } from 'lucide-react';
import type { AuditAction, AuditEntityType, AuditLog } from '@/lib/types';

interface EmployeeOption {
  id: string;
  name: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ACTION_OPTIONS: Array<{ value: 'all' | AuditAction; label: string }> = [
  { value: 'all', label: 'All Actions' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'deactivate', label: 'Deactivate' },
  { value: 'approve', label: 'Approve' },
  { value: 'reject', label: 'Reject' },
  { value: 'assign', label: 'Assign' },
  { value: 'reset', label: 'Reset' }
];

const ENTITY_OPTIONS: Array<{ value: 'all' | AuditEntityType; label: string }> = [
  { value: 'all', label: 'All Entities' },
  { value: 'department', label: 'Department' },
  { value: 'department_members', label: 'Department Members' },
  { value: 'employee', label: 'Employee' },
  { value: 'leave', label: 'Leave' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'task', label: 'Task' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'notification', label: 'Notification' },
  { value: 'system', label: 'System' }
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function formatLabel(value: string): string {
  return value
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function parseEmployees(payload: unknown): EmployeeOption[] {
  if (!isRecord(payload) || !Array.isArray(payload.data)) return [];

  return payload.data.reduce<EmployeeOption[]>((items, item) => {
    if (!isRecord(item)) return items;
    const id = asString(item.id);
    const firstName = asString(item.firstName);
    const lastName = asString(item.lastName);
    if (!id) return items;
    items.push({ id, name: `${firstName} ${lastName}`.trim() || asString(item.email) || id });
    return items;
  }, []);
}

function parseAuditLogs(payload: unknown): { logs: AuditLog[]; pagination: PaginationState } {
  const fallback = { logs: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  if (!isRecord(payload) || !Array.isArray(payload.data) || !isRecord(payload.pagination)) return fallback;

  return {
    logs: payload.data as AuditLog[],
    pagination: {
      page: typeof payload.pagination.page === 'number' ? payload.pagination.page : 1,
      limit: typeof payload.pagination.limit === 'number' ? payload.pagination.limit : 20,
      total: typeof payload.pagination.total === 'number' ? payload.pagination.total : 0,
      totalPages: typeof payload.pagination.totalPages === 'number' ? payload.pagination.totalPages : 1
    }
  };
}

export default function AuditLogsPage() {
  const { token, user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [action, setAction] = useState('all');
  const [entityType, setEntityType] = useState('all');
  const [actorId, setActorId] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const isAdmin = user?.role === 'admin';

  const loadEmployees = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      const res = await fetch('/api/employees?status=all&page=1&limit=200', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const payload: unknown = await res.json();
      setEmployees(parseEmployees(payload));
    } catch {
      setEmployees([]);
    }
  }, [isAdmin, token]);

  const loadAuditLogs = useCallback(async () => {
    if (!token || !isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    const params = new URLSearchParams({
      page: String(page),
      limit: '20'
    });
    if (query.trim()) params.set('q', query.trim());
    if (action !== 'all') params.set('action', action);
    if (entityType !== 'all') params.set('entityType', entityType);
    if (actorId !== 'all') params.set('actorId', actorId);

    try {
      const res = await fetch(`/api/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload: unknown = await res.json();
      if (!res.ok || !isRecord(payload) || payload.success !== true) {
        setError(asString(isRecord(payload) ? payload.error : '') || 'Unable to load audit logs.');
        setLogs([]);
        return;
      }

      const parsed = parseAuditLogs(payload);
      setLogs(parsed.logs);
      setPagination(parsed.pagination);
    } catch {
      setLogs([]);
      setError('Unable to reach the Audit Logs API.');
    } finally {
      setLoading(false);
    }
  }, [action, actorId, entityType, isAdmin, page, query, token]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: pagination.total,
      today: logs.filter(log => log.createdAt.startsWith(today)).length,
      adminActions: logs.filter(log => log.actorRole === 'admin').length,
      systemResets: logs.filter(log => log.action === 'reset' || log.entityType === 'system').length
    };
  }, [logs, pagination.total]);

  const actorOptions = useMemo(() => [
    { value: 'all', label: 'All Actors' },
    { value: 'system', label: 'System' },
    ...employees.map(employee => ({ value: employee.id, label: employee.name }))
  ], [employees]);

  if (!isAdmin && !loading) {
    return (
      <div className="empty-state audit-empty-state" data-testid="audit-logs-forbidden">
        <ShieldCheck className="empty-state-icon" size={44} strokeWidth={1.5} />
        <div className="empty-state-title">Admin access required</div>
        <p>Audit logs are available to administrators only.</p>
      </div>
    );
  }

  return (
    <div className="audit-page animate-fadeIn" data-testid="audit-logs-page">
      <div className="departments-toolbar audit-toolbar" data-testid="audit-log-filters">
        <div className="search-bar departments-search">
          <span className="search-bar-icon"><Search size={18} /></span>
          <input
            className="search-bar-input"
            value={query}
            onChange={event => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search audit logs..."
            aria-label="Search audit logs"
            data-testid="audit-log-search"
          />
          {query && (
            <button type="button" className="department-icon-btn" onClick={() => setQuery('')} aria-label="Clear audit log search">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="departments-toolbar-actions">
          <CustomSelect value={action} onChange={value => { setAction(value); setPage(1); }} testId="audit-action-filter" minWidth="150px" options={ACTION_OPTIONS} />
          <CustomSelect value={entityType} onChange={value => { setEntityType(value); setPage(1); }} testId="audit-entity-filter" minWidth="180px" options={ENTITY_OPTIONS} />
          <CustomSelect value={actorId} onChange={value => { setActorId(value); setPage(1); }} testId="audit-actor-filter" minWidth="170px" options={actorOptions} />
          <button type="button" className="btn btn-secondary" onClick={loadAuditLogs} data-testid="refresh-audit-logs">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {!loading && error && (
        <div className="department-inline-alert department-inline-alert-danger" role="alert" data-testid="audit-log-error">
          {error}
        </div>
      )}

      <div className="department-stats-grid" data-testid="audit-log-stats">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton" style={{ height: 96, borderRadius: 'var(--radius-lg)' }} />
          ))
        ) : (
          <>
            <div className="department-stat-card">
              <div className="department-stat-copy">
                <span className="department-stat-label">Total Logs</span>
                <strong>{stats.total}</strong>
              </div>
              <span className="department-stat-icon"><ClipboardList size={20} /></span>
            </div>
            <div className="department-stat-card">
              <div className="department-stat-copy">
                <span className="department-stat-label">Logs Today</span>
                <strong>{stats.today}</strong>
              </div>
              <span className="department-stat-icon department-stat-icon-info"><RefreshCw size={20} /></span>
            </div>
            <div className="department-stat-card">
              <div className="department-stat-copy">
                <span className="department-stat-label">Admin Actions</span>
                <strong>{stats.adminActions}</strong>
              </div>
              <span className="department-stat-icon department-stat-icon-success"><UserCog size={20} /></span>
            </div>
            <div className="department-stat-card">
              <div className="department-stat-copy">
                <span className="department-stat-label">System Resets</span>
                <strong>{stats.systemResets}</strong>
              </div>
              <span className="department-stat-icon department-stat-icon-warning"><ShieldCheck size={20} /></span>
            </div>
          </>
        )}
      </div>

      <div className="departments-content">
        {loading ? (
          <div className="department-loading-list" data-testid="audit-logs-loading">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state audit-empty-state" data-testid="audit-logs-empty">
            <ClipboardList className="empty-state-icon" size={44} strokeWidth={1.5} />
            <div className="empty-state-title">No audit logs found</div>
            <p>Try adjusting search, action, entity, or actor filters.</p>
          </div>
        ) : (
          <>
            <div className="data-table-wrapper audit-table-wrapper">
              <table className="data-table audit-table" data-testid="audit-log-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Summary</th>
                    <th className="audit-actions-header">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} data-testid={`audit-log-row-${log.id}`}>
                      <td>{formatTime(log.createdAt)}</td>
                      <td>
                        <div className="audit-actor-cell">
                          <strong>{log.actorName}</strong>
                          <span>{formatLabel(log.actorRole)}</span>
                        </div>
                      </td>
                      <td><span className={`badge audit-action-badge audit-action-${log.action}`}>{formatLabel(log.action)}</span></td>
                      <td>
                        <div className="audit-entity-cell">
                          <strong>{formatLabel(log.entityType)}</strong>
                          <span>{log.entityLabel || log.entityId || '-'}</span>
                        </div>
                      </td>
                      <td>{log.summary}</td>
                      <td>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedLog(log)} aria-label={`View details for ${log.summary}`} data-testid={`audit-details-${log.id}`}>
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="audit-card-list" aria-label="Audit log cards">
              {logs.map(log => (
                <article className="audit-card" key={log.id} data-testid={`audit-log-card-${log.id}`}>
                  <div className="audit-card-header">
                    <div>
                      <strong>{log.summary}</strong>
                      <span>{formatTime(log.createdAt)}</span>
                    </div>
                    <span className={`badge audit-action-badge audit-action-${log.action}`}>{formatLabel(log.action)}</span>
                  </div>
                  <div className="audit-card-grid">
                    <div><span>Actor</span><strong>{log.actorName}</strong></div>
                    <div><span>Entity</span><strong>{formatLabel(log.entityType)}</strong></div>
                    <div><span>Target</span><strong>{log.entityLabel || log.entityId || '-'}</strong></div>
                  </div>
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedLog(log)}>
                    <Eye size={15} /> Details
                  </button>
                </article>
              ))}
            </div>

            <div className="audit-pagination" data-testid="audit-pagination">
              <span>Page {pagination.page} of {pagination.totalPages}</span>
              <div>
                <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(current => Math.max(1, current - 1))} data-testid="audit-prev-page">
                  Previous
                </button>
                <button type="button" className="btn btn-secondary" disabled={page >= pagination.totalPages} onClick={() => setPage(current => current + 1)} data-testid="audit-next-page">
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedLog && (
        <div className="drawer-overlay animate-fadeIn" onClick={() => setSelectedLog(null)} data-testid="audit-detail-drawer-overlay">
          <div className="drawer audit-drawer animate-slideInRight" onClick={event => event.stopPropagation()} role="dialog" aria-labelledby="audit-detail-title" aria-modal="true">
            <div className="drawer-header">
              <div>
                <h3 id="audit-detail-title" className="drawer-title">Audit Details</h3>
                <p className="department-drawer-subtitle">{formatTime(selectedLog.createdAt)}</p>
              </div>
              <button type="button" className="drawer-close" onClick={() => setSelectedLog(null)} aria-label="Close audit details" data-testid="close-audit-details">
                <X size={20} />
              </button>
            </div>
            <div className="drawer-body audit-detail-body">
              <div className="audit-detail-row"><span>Actor</span><strong>{selectedLog.actorName}</strong></div>
              <div className="audit-detail-row"><span>Role</span><strong>{formatLabel(selectedLog.actorRole)}</strong></div>
              <div className="audit-detail-row"><span>Action</span><strong>{formatLabel(selectedLog.action)}</strong></div>
              <div className="audit-detail-row"><span>Entity</span><strong>{formatLabel(selectedLog.entityType)}</strong></div>
              <div className="audit-detail-row"><span>Target</span><strong>{selectedLog.entityLabel || selectedLog.entityId || '-'}</strong></div>
              <div className="audit-detail-summary">
                <span>Summary</span>
                <p>{selectedLog.summary}</p>
              </div>
              <div className="audit-metadata">
                <h4>Metadata</h4>
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 ? (
                  Object.entries(selectedLog.metadata).map(([key, value]) => (
                    <div className="audit-detail-row" key={key}>
                      <span>{formatLabel(key)}</span>
                      <strong>{value === null ? '-' : String(value)}</strong>
                    </div>
                  ))
                ) : (
                  <p>No metadata recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

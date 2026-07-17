import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, createTask, updateTask, deleteTask } from '../features/tasks/tasksSlice';
import { fetchContacts } from '../features/contacts/contactsSlice';
import { fetchDeals } from '../features/deals/dealsSlice';
import { fetchLeads } from '../features/leads/leadsSlice';
import { useToast } from '../components/Toast';

const TASK_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'WAITING', 'DEFERRED', 'COMPLETED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const TRACKING_SCOPES = [
  { value: 'ALL', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'TODAY', label: 'Today' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'DONE', label: 'Done' },
];

const STATUS_COLORS = {
  NOT_STARTED: 'gray',
  IN_PROGRESS: 'blue',
  WAITING: 'amber',
  DEFERRED: 'purple',
  COMPLETED: 'green',
};

const PRIORITY_COLORS = {
  LOW: 'green',
  MEDIUM: 'amber',
  HIGH: 'red',
};

const formatLabel = (value) => value.replaceAll('_', ' ');
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-');

const getDayBounds = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const weekEnd = new Date(start);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return { start, end, weekEnd };
};

const isCompleted = (task) => task.status === 'COMPLETED' || task.completed;

const isDueToday = (task, bounds) => {
  if (!task.dueAt) return false;
  const due = new Date(task.dueAt);
  return due >= bounds.start && due < bounds.end;
};

const isOverdue = (task, bounds) => {
  if (!task.dueAt || isCompleted(task)) return false;
  return new Date(task.dueAt) < bounds.start;
};

const isDueThisWeek = (task, bounds) => {
  if (!task.dueAt) return false;
  const due = new Date(task.dueAt);
  return due >= bounds.start && due < bounds.weekEnd;
};

const makeMap = (items) => new Map(items.map((item) => [item._id, item]));

const resolveRef = (value, lookup) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  return lookup.get(value) || null;
};

export default function TasksPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, status: loadStatus } = useSelector((s) => s.tasks);
  const contacts = useSelector((s) => s.contacts.items);
  const deals = useSelector((s) => s.deals.items);
  const leadsObj = useSelector((s) => s.leads.byStage);
  const leads = useMemo(() => Object.values(leadsObj).flat(), [leadsObj]);

  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [filters, setFilters] = useState({
    search: '',
    scope: 'ALL',
    status: 'ALL',
    priority: 'ALL',
    due: 'ALL',
    relation: 'ALL',
  });
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    dueAt: '',
    contactId: '',
    leadId: '',
    dealId: '',
  });

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchContacts({ limit: 100 }));
    dispatch(fetchDeals());
    dispatch(fetchLeads());
  }, [dispatch]);

  const bounds = useMemo(() => getDayBounds(), []);
  const contactMap = useMemo(() => makeMap(contacts), [contacts]);
  const dealMap = useMemo(() => makeMap(deals), [deals]);
  const leadMap = useMemo(() => makeMap(leads), [leads]);

  const getRelationInfo = (task) => {
    const contact = resolveRef(task.contactId, contactMap);
    if (contact) return { type: 'Contact', label: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Contact' };

    const lead = resolveRef(task.leadId, leadMap);
    if (lead) {
      const leadName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || lead.title || 'Lead';
      return { type: 'Lead', label: leadName };
    }

    const deal = resolveRef(task.dealId, dealMap);
    if (deal) return { type: 'Deal', label: deal.dealName || deal.title || 'Deal' };

    return { type: 'None', label: '-' };
  };

  const matchesDueFilter = (task) => {
    if (filters.due === 'ALL') return true;
    if (filters.due === 'NONE') return !task.dueAt;
    if (filters.due === 'TODAY') return isDueToday(task, bounds);
    if (filters.due === 'OVERDUE') return isOverdue(task, bounds);
    if (filters.due === 'WEEK') return isDueThisWeek(task, bounds);
    return true;
  };

  const matchesScope = (task) => {
    if (filters.scope === 'OPEN') return !isCompleted(task);
    if (filters.scope === 'TODAY') return isDueToday(task, bounds);
    if (filters.scope === 'OVERDUE') return isOverdue(task, bounds);
    if (filters.scope === 'DONE') return isCompleted(task);
    return true;
  };

  const filteredItems = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return items.filter((task) => {
      const relation = getRelationInfo(task);
      const matchesSearch = !searchTerm || [
        task.title,
        task.description,
        task.priority,
        task.status,
        relation.type,
        relation.label,
      ].filter(Boolean).join(' ').toLowerCase().includes(searchTerm);

      const relationType = relation.type.toUpperCase();

      return (
        matchesSearch &&
        matchesScope(task) &&
        matchesDueFilter(task) &&
        (filters.status === 'ALL' || task.status === filters.status) &&
        (filters.priority === 'ALL' || task.priority === filters.priority) &&
        (filters.relation === 'ALL' || relationType === filters.relation)
      );
    });
  }, [items, filters, contactMap, dealMap, leadMap, bounds]);

  const groupedTasks = useMemo(() => {
    return TASK_STATUSES.reduce((acc, taskStatus) => {
      acc[taskStatus] = filteredItems.filter((task) => (task.status || 'NOT_STARTED') === taskStatus);
      return acc;
    }, {});
  }, [filteredItems]);

  const openCount = filteredItems.filter((task) => !isCompleted(task)).length;
  const overdueCount = filteredItems.filter((task) => isOverdue(task, bounds)).length;
  const todayCount = filteredItems.filter((task) => isDueToday(task, bounds)).length;
  const highCount = filteredItems.filter((task) => task.priority === 'HIGH' && !isCompleted(task)).length;

  const resetFilters = () => {
    setFilters({ search: '', scope: 'ALL', status: 'ALL', priority: 'ALL', due: 'ALL', relation: 'ALL' });
  };

  const handleScopeChange = (scope) => {
    setFilters((current) => ({
      ...current,
      scope,
      status: scope === 'DONE' ? 'COMPLETED' : 'ALL',
      due: scope === 'TODAY' ? 'TODAY' : scope === 'OVERDUE' ? 'OVERDUE' : 'ALL',
    }));
  };

  const cleanTaskPayload = (payload) => ({
    ...payload,
    dueAt: payload.dueAt || undefined,
    contactId: payload.contactId || undefined,
    leadId: payload.leadId || undefined,
    dealId: payload.dealId || undefined,
    completed: payload.status === 'COMPLETED',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createTask(cleanTaskPayload(form)));
    if (!res.error) {
      toast.success('Task created');
      setShowModal(false);
      setForm({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'NOT_STARTED',
        dueAt: '',
        contactId: '',
        leadId: '',
        dealId: '',
      });
    } else {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    const res = await dispatch(updateTask({ id: task._id, status: newStatus, completed: newStatus === 'COMPLETED' }));
    if (res.error) toast.error('Failed to update task');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    const res = await dispatch(deleteTask(id));
    if (!res.error) toast.success('Task deleted');
    else toast.error('Failed to delete task');
  };

  const getDueClass = (task) => {
    if (isCompleted(task)) return 'done';
    if (isOverdue(task, bounds)) return 'overdue';
    if (isDueToday(task, bounds)) return 'today';
    return '';
  };

  const renderStatusSelect = (task) => (
    <select className="form-input inline-select" value={task.status || 'NOT_STARTED'} onChange={(e) => handleStatusChange(task, e.target.value)}>
      {TASK_STATUSES.map((taskStatus) => <option key={taskStatus} value={taskStatus}>{formatLabel(taskStatus)}</option>)}
    </select>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Track follow-ups, ownership, due dates, and completion in one place.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Task
        </button>
      </div>

      <div className="glass-card tracking-toolbar">
        <div className="tracking-toolbar-row wrap">
          <div className="tracking-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              className="form-input"
              placeholder="Search tasks by title, notes, priority, or related record..."
              value={filters.search}
              onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
            />
          </div>

          <div className="segmented-control" aria-label="Task view">
            <button className={`segmented-button ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
              List
            </button>
            <button className={`segmented-button ${viewMode === 'board' ? 'active' : ''}`} onClick={() => setViewMode('board')} type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="18" rx="1" /><rect x="14" y="3" width="7" height="18" rx="1" /></svg>
              Board
            </button>
          </div>
        </div>

        <div className="tracking-toolbar-row wrap">
          <div className="segmented-control" aria-label="Tracking preset">
            {TRACKING_SCOPES.map((scope) => (
              <button key={scope.value} className={`segmented-button ${filters.scope === scope.value ? 'active' : ''}`} onClick={() => handleScopeChange(scope.value)} type="button">
                {scope.label}
              </button>
            ))}
          </div>

          <div className="tracking-filter-grid">
            <div className="tracking-control">
              <label>Status</label>
              <select className="form-input" value={filters.status} onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))}>
                <option value="ALL">All statuses</option>
                {TASK_STATUSES.map((taskStatus) => <option key={taskStatus} value={taskStatus}>{formatLabel(taskStatus)}</option>)}
              </select>
            </div>
            <div className="tracking-control">
              <label>Priority</label>
              <select className="form-input" value={filters.priority} onChange={(e) => setFilters((current) => ({ ...current, priority: e.target.value }))}>
                <option value="ALL">All priorities</option>
                {PRIORITIES.map((priority) => <option key={priority} value={priority}>{formatLabel(priority)}</option>)}
              </select>
            </div>
            <div className="tracking-control">
              <label>Due</label>
              <select className="form-input" value={filters.due} onChange={(e) => setFilters((current) => ({ ...current, due: e.target.value }))}>
                <option value="ALL">Any due date</option>
                <option value="TODAY">Due today</option>
                <option value="OVERDUE">Overdue</option>
                <option value="WEEK">This week</option>
                <option value="NONE">No due date</option>
              </select>
            </div>
            <div className="tracking-control">
              <label>Related To</label>
              <select className="form-input" value={filters.relation} onChange={(e) => setFilters((current) => ({ ...current, relation: e.target.value }))}>
                <option value="ALL">All records</option>
                <option value="CONTACT">Contacts</option>
                <option value="LEAD">Leads</option>
                <option value="DEAL">Deals</option>
                <option value="NONE">None</option>
              </select>
            </div>
          </div>

          <button className="btn-secondary" type="button" onClick={resetFilters}>Reset</button>
        </div>
      </div>

      <div className="tracking-metrics">
        <div className="tracking-metric"><span>Matching tasks</span><strong>{filteredItems.length}</strong><small>{items.length} loaded</small></div>
        <div className="tracking-metric"><span>Open</span><strong>{openCount}</strong><small>Not completed</small></div>
        <div className="tracking-metric"><span>Due today</span><strong>{todayCount}</strong><small>Filtered tasks</small></div>
        <div className="tracking-metric"><span>Overdue</span><strong>{overdueCount}</strong><small>{highCount} high priority open</small></div>
      </div>

      {loadStatus === 'loading' && items.length === 0 ? (
        <div className="page-loading"><div className="spinner"></div></div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
            </div>
            <h3 className="empty-state-title">No tasks found</h3>
            <p className="empty-state-desc">Try adjusting the tracking filters or create a new task.</p>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="glass-card record-list">
          <table className="data-table tracking-table">
            <thead>
              <tr>
                <th style={{ width: 54 }}>Done</th>
                <th>Task</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due</th>
                <th>Related To</th>
                <th style={{ width: 80, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((task) => {
                const relation = getRelationInfo(task);
                return (
                  <tr key={task._id}>
                    <td>
                      <button
                        aria-label={isCompleted(task) ? 'Mark task incomplete' : 'Mark task complete'}
                        className={`checkbox-custom ${isCompleted(task) ? 'checked' : ''}`}
                        onClick={() => handleStatusChange(task, isCompleted(task) ? 'NOT_STARTED' : 'COMPLETED')}
                        type="button"
                      />
                    </td>
                    <td>
                      <div style={{ opacity: isCompleted(task) ? 0.62 : 1 }}>
                        <div className="record-title" style={{ textDecoration: isCompleted(task) ? 'line-through' : 'none' }}>{task.title}</div>
                        {task.description && <div className="record-subtitle">{task.description}</div>}
                      </div>
                    </td>
                    <td>{renderStatusSelect(task)}</td>
                    <td><span className={`badge badge-${PRIORITY_COLORS[task.priority] || 'gray'}`}>{formatLabel(task.priority || 'MEDIUM')}</span></td>
                    <td><span className={`due-text ${getDueClass(task)}`}>{formatDate(task.dueAt)}</span></td>
                    <td>
                      {relation.type === 'None' ? '-' : (
                        <div>
                          <span className="badge badge-gray">{relation.type}</span>
                          <div className="record-subtitle">{relation.label}</div>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-icon" onClick={() => handleDelete(task._id)} style={{ color: 'var(--accent-red)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="kanban-board" style={{ gridTemplateColumns: `repeat(${TASK_STATUSES.length}, minmax(280px, 1fr))` }}>
          {TASK_STATUSES.map((taskStatus) => (
            <div key={taskStatus} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <span className={`badge badge-${STATUS_COLORS[taskStatus]}`} style={{ marginRight: 8 }}>{formatLabel(taskStatus)}</span>
                </div>
                <div className="kanban-column-count">{groupedTasks[taskStatus]?.length || 0}</div>
              </div>
              <div className="kanban-column-body">
                {(groupedTasks[taskStatus] || []).map((task) => {
                  const relation = getRelationInfo(task);
                  return (
                    <div key={task._id} className="kanban-card">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <button
                          aria-label={isCompleted(task) ? 'Mark task incomplete' : 'Mark task complete'}
                          className={`checkbox-custom ${isCompleted(task) ? 'checked' : ''}`}
                          onClick={() => handleStatusChange(task, isCompleted(task) ? 'NOT_STARTED' : 'COMPLETED')}
                          type="button"
                          style={{ marginTop: 2 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="record-title" style={{ textDecoration: isCompleted(task) ? 'line-through' : 'none' }}>{task.title}</div>
                          {task.description && <div className="record-subtitle">{task.description}</div>}
                        </div>
                        <button className="btn-icon" onClick={() => handleDelete(task._id)} style={{ color: 'var(--accent-red)', height: 30, width: 30 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </div>

                      <div className="record-meta" style={{ margin: '12px 0' }}>
                        <span className={`badge badge-${PRIORITY_COLORS[task.priority] || 'gray'}`}>{formatLabel(task.priority || 'MEDIUM')}</span>
                        {task.dueAt && <span className={`due-text ${getDueClass(task)}`}>Due {formatDate(task.dueAt)}</span>}
                        {relation.type !== 'None' && <span className="badge badge-gray">{relation.type}</span>}
                      </div>

                      {renderStatusSelect(task)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 700 }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--accent-blue-glow)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-rounded">add_task</span>
                </div>
                <div>
                  <h2 className="modal-title" style={{ margin: 0 }}>Create New Task</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Schedule a follow-up or to-do.</p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                
                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>task</span>
                  Task Details
                </h3>
                <div className="form-group">
                  <label className="form-label">Task Title *</label>
                  <div className="form-input-with-icon">
                    <span className="material-symbols-rounded">title</span>
                    <input className="form-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Follow up with client" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea placeholder="Enter detailed description..." className="form-input" rows="3" style={{ paddingLeft: 12 }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>

                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>schedule</span>
                  Status & Timing
                </h3>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">flag</span>
                      <select className="form-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                        {PRIORITIES.map((priority) => <option key={priority} value={priority}>{formatLabel(priority)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">data_usage</span>
                      <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        {TASK_STATUSES.map((taskStatus) => <option key={taskStatus} value={taskStatus}>{formatLabel(taskStatus)}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <div className="form-input-with-icon">
                    <span className="material-symbols-rounded">event</span>
                    <input type="date" className="form-input" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} />
                  </div>
                </div>

                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>link</span>
                  Associations
                </h3>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Related Contact</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">person</span>
                      <select className="form-input" value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value, leadId: e.target.value ? '' : form.leadId, dealId: e.target.value ? '' : form.dealId })}>
                        <option value="">None</option>
                        {contacts.map((contact) => <option key={contact._id} value={contact._id}>{contact.firstName} {contact.lastName}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Related Deal</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">handshake</span>
                      <select className="form-input" value={form.dealId} onChange={(e) => setForm({ ...form, dealId: e.target.value, contactId: e.target.value ? '' : form.contactId, leadId: e.target.value ? '' : form.leadId })}>
                        <option value="">None</option>
                        {deals.map((deal) => <option key={deal._id} value={deal._id}>{deal.dealName}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Related Lead</label>
                  <div className="form-input-with-icon">
                    <span className="material-symbols-rounded">record_voice_over</span>
                    <select className="form-input" value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value, contactId: e.target.value ? '' : form.contactId, dealId: e.target.value ? '' : form.dealId })}>
                      <option value="">None</option>
                      {leads.map((lead) => <option key={lead._id} value={lead._id}>{lead.firstName} {lead.lastName}</option>)}
                    </select>
                  </div>
                </div>
                
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-default)', paddingTop: 16, marginTop: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <span className="material-symbols-rounded" style={{ fontSize: 18, marginRight: 6, verticalAlign: 'text-bottom' }}>check_circle</span>
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

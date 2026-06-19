import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, createTask, updateTask, deleteTask } from '../features/tasks/tasksSlice';
import { fetchContacts } from '../features/contacts/contactsSlice';
import { fetchDeals } from '../features/deals/dealsSlice';
import { fetchLeads } from '../features/leads/leadsSlice';
import { useToast } from '../components/Toast';

export default function TasksPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, status } = useSelector((s) => s.tasks);
  const contacts = useSelector((s) => s.contacts.items);
  const deals = useSelector((s) => s.deals.items);
  // Leads byStage is an object, we need to flatten it for the dropdown
  const leadsObj = useSelector((s) => s.leads.byStage);
  const leads = Object.values(leadsObj).flat();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'NOT_STARTED', dueAt: '', contactId: '', leadId: '', dealId: '' });
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchContacts({ limit: 100 }));
    dispatch(fetchDeals());
    dispatch(fetchLeads());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createTask(form));
    if (!res.error) {
      toast.success('Task created');
      setShowModal(false);
      setForm({ title: '', description: '', priority: 'MEDIUM', status: 'NOT_STARTED', dueAt: '', contactId: '', leadId: '', dealId: '' });
    } else {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    dispatch(updateTask({ id: task._id, status: newStatus }));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    dispatch(deleteTask(id));
  };

  const filteredItems = items.filter(t => {
    if (filter === 'PENDING') return t.status !== 'COMPLETED';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Manage your to-do list</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Task
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {['ALL', 'PENDING', 'COMPLETED'].map(f => (
          <button 
            key={f}
            className={`btn-ghost ${filter === f ? 'active' : ''}`}
            style={{ fontWeight: filter === f ? 600 : 400, color: filter === f ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '8px 0' }}>
        {status === 'loading' && items.length === 0 ? (
          <div className="page-loading"><div className="spinner"></div></div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-state-icon">✅</div>
            <h3 className="empty-state-title">No tasks found</h3>
            <p className="empty-state-desc">You are all caught up.</p>
          </div>
        ) : (
          <div>
            {filteredItems.map(t => (
              <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: '1px solid var(--border-default)', transition: 'background 0.2s' }}>
                <div 
                  className={`checkbox-custom ${t.status === 'COMPLETED' ? 'checked' : ''}`} 
                  onClick={() => handleStatusChange(t, t.status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED')}
                  style={{ cursor: 'pointer' }}
                />
                <div style={{ flex: 1, opacity: t.status === 'COMPLETED' ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', textDecoration: t.status === 'COMPLETED' ? 'line-through' : 'none', marginBottom: 4 }}>
                    {t.title}
                  </div>
                  {t.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{t.description}</div>}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {t.priority === 'HIGH' && <span className="badge badge-red">High</span>}
                    {t.priority === 'MEDIUM' && <span className="badge badge-amber">Medium</span>}
                    {t.priority === 'LOW' && <span className="badge badge-green">Low</span>}
                    <span className="badge badge-gray">{t.status.replace('_', ' ')}</span>
                    {t.dueAt && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Due: {new Date(t.dueAt).toLocaleDateString()}</span>}
                    {t.contactId && <span style={{ fontSize: 11, color: 'var(--accent-blue)' }}>👤 {t.contactId.firstName} {t.contactId.lastName}</span>}
                    {t.dealId && <span style={{ fontSize: 11, color: 'var(--accent-purple)' }}>💼 {t.dealId.dealName}</span>}
                  </div>
                </div>
                <button className="btn-icon" onClick={() => handleDelete(t._id)} style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Task</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Task Title *</label>
                  <input className="form-input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Follow up with client" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="WAITING">Waiting</option>
                      <option value="DEFERRED">Deferred</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-input" value={form.dueAt} onChange={e => setForm({...form, dueAt: e.target.value})} />
                </div>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Related Contact</label>
                    <select className="form-input" value={form.contactId} onChange={e => setForm({...form, contactId: e.target.value})}>
                      <option value="">None</option>
                      {contacts.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Related Deal</label>
                    <select className="form-input" value={form.dealId} onChange={e => setForm({...form, dealId: e.target.value})}>
                      <option value="">None</option>
                      {deals.map(d => <option key={d._id} value={d._id}>{d.dealName}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Related Lead</label>
                  <select className="form-input" value={form.leadId} onChange={e => setForm({...form, leadId: e.target.value})}>
                    <option value="">None</option>
                    {leads.map(l => <option key={l._id} value={l._id}>{l.firstName} {l.lastName}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

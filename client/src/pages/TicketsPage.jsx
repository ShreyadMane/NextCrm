import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTickets, createTicket, updateTicket, deleteTicket } from '../features/tickets/ticketsSlice';
import { fetchContacts } from '../features/contacts/contactsSlice';
import { fetchDeals } from '../features/deals/dealsSlice';
import { useToast } from '../components/Toast';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED'];
const STATUS_COLORS = { OPEN: 'blue', IN_PROGRESS: 'amber', WAITING: 'purple', RESOLVED: 'green', CLOSED: 'gray' };
const PRIORITY_COLORS = { LOW: 'green', MEDIUM: 'amber', HIGH: 'red', URGENT: 'purple' };

export default function TicketsPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, status } = useSelector((s) => s.tickets);
  const contacts = useSelector(s => s.contacts.items);
  const deals = useSelector(s => s.deals.items);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', category: 'GENERAL', status: 'OPEN', contactId: '', dealId: '' });

  useEffect(() => { 
    dispatch(fetchTickets());
    dispatch(fetchContacts({ limit: 100 }));
    dispatch(fetchDeals());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createTicket(form));
    if (!res.error) { toast.success('Ticket created'); setShowModal(false); setForm({ title: '', description: '', priority: 'MEDIUM', category: 'GENERAL', status: 'OPEN', contactId: '', dealId: '' }); }
    else toast.error('Failed to create ticket');
  };

  const handleStatusChange = async (id, newStatus) => {
    const res = await dispatch(updateTicket({ id, status: newStatus }));
    if (!res.error) toast.success(`Ticket moved to ${newStatus.replace('_', ' ')}`);
  };

  const handleDeleteTicket = async (id) => {
    if (!confirm('Delete this ticket?')) return;
    dispatch(deleteTicket(id));
  };

  const grouped = STATUSES.reduce((acc, s) => { acc[s] = items.filter(t => t.status === s); return acc; }, {});

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Support Tickets</h1><p className="page-subtitle">Handle customer issues and service requests</p></div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Ticket
        </button>
      </div>

      {status === 'loading' && items.length === 0 ? (
        <div className="page-loading"><div className="spinner"></div></div>
      ) : (
        <div className="kanban-board" style={{ gridTemplateColumns: `repeat(${STATUSES.length}, minmax(280px, 1fr))` }}>
          {STATUSES.map(s => (
            <div key={s} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-title"><span className={`badge badge-${STATUS_COLORS[s]}`} style={{ marginRight: 8 }}>{s.replace('_', ' ')}</span></div>
                <div className="kanban-column-count">{grouped[s].length}</div>
              </div>
              <div className="kanban-column-body">
                {grouped[s].map(ticket => (
                  <div key={ticket._id} className="kanban-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', flex: 1 }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12, marginRight: 4 }}>#{ticket.ticketNumber}</span>
                        {ticket.title}
                      </div>
                      <button className="btn-icon" onClick={() => handleDeleteTicket(ticket._id)} style={{ flexShrink: 0, opacity: 0.5 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                    {ticket.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{ticket.description.substring(0, 100)}</div>}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, display: 'flex', gap: 6 }}>
                      <span className="badge badge-gray" style={{ fontSize: 10 }}>{ticket.category?.replace('_', ' ')}</span>
                      {ticket.contactId && <span>👤 {ticket.contactId.firstName} {ticket.contactId.lastName}</span>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge badge-${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</span>
                      <select className="form-input" style={{ padding: '2px 6px', fontSize: 11, height: 'auto', width: 'auto' }} value={ticket.status} onChange={(e) => handleStatusChange(ticket._id, e.target.value)}>
                        {STATUSES.map(st => <option key={st} value={st}>{st.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
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
                  <span className="material-symbols-rounded">support_agent</span>
                </div>
                <div>
                  <h2 className="modal-title" style={{ margin: 0 }}>Create New Ticket</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Open a support request or track an issue.</p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setShowModal(false)} title="Close">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                
                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>confirmation_number</span>
                  Issue Details
                </h3>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <div className="form-input-with-icon">
                    <span className="material-symbols-rounded">title</span>
                    <input className="form-input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Brief issue summary" />
                  </div>
                </div>

                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>category</span>
                  Classification
                </h3>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">label</span>
                      <select className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                        <option value="GENERAL">General</option>
                        <option value="TECHNICAL">Technical</option>
                        <option value="BILLING">Billing</option>
                        <option value="FEATURE_REQUEST">Feature Request</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">priority_high</span>
                      <select className="form-input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
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
                      <select className="form-input" value={form.contactId} onChange={e => setForm({...form, contactId: e.target.value})}>
                        <option value="">None</option>
                        {contacts.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Related Deal</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">handshake</span>
                      <select className="form-input" value={form.dealId} onChange={e => setForm({...form, dealId: e.target.value})}>
                        <option value="">None</option>
                        {deals.map(d => <option key={d._id} value={d._id}>{d.dealName}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows="3" style={{ paddingLeft: 12 }} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the issue in detail..." />
                </div>
                
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-default)', paddingTop: 16, marginTop: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <span className="material-symbols-rounded" style={{ fontSize: 18, marginRight: 6, verticalAlign: 'text-bottom' }}>check_circle</span>
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

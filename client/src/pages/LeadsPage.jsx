import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads, createLead, updateLead } from '../features/leads/leadsSlice';
import { useToast } from '../components/Toast';

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];

export default function LeadsPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { byStage, status } = useSelector((s) => s.leads);
  
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', companyName: '', email: '', phone: '',
    leadSource: 'WEBSITE', industry: 'OTHER', rating: 'WARM', expectedRevenue: 0,
    status: 'NEW', notes: ''
  });

  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createLead({ ...form, expectedRevenue: Number(form.expectedRevenue) }));
    if (!res.error) {
      toast.success('Lead created');
      setShowModal(false);
      setForm({
        firstName: '', lastName: '', companyName: '', email: '', phone: '',
        leadSource: 'WEBSITE', industry: 'OTHER', rating: 'WARM', expectedRevenue: 0,
        status: 'NEW', notes: ''
      });
    } else {
      toast.error('Failed to create lead');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const res = await dispatch(updateLead({ id, status: newStatus }));
    if (!res.error) toast.success(`Lead moved to ${newStatus}`);
  };

  const getGroup = (status) => byStage[status] || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">Track and qualify your prospects</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Lead
        </button>
      </div>

      {status === 'loading' && Object.keys(byStage).length === 0 ? (
        <div className="page-loading"><div className="spinner"></div></div>
      ) : (
        <div className="kanban-board">
          {STATUSES.map((colStatus) => (
            <div key={colStatus} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-title" style={{ color: 'var(--text-secondary)' }}>{colStatus}</div>
                <div className="kanban-column-count">{getGroup(colStatus).length}</div>
              </div>
              <div className="kanban-column-body">
                {getGroup(colStatus).map((lead) => (
                  <div key={lead._id} className="kanban-card">
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {lead.firstName} {lead.lastName} {lead.title && !lead.firstName ? lead.title : ''}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      {lead.companyName || lead.email || 'No company'}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className={`badge badge-${lead.rating === 'HOT' ? 'red' : lead.rating === 'WARM' ? 'amber' : 'blue'}`}>
                        {lead.rating || 'WARM'}
                      </span>
                      {lead.expectedRevenue > 0 && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-green)' }}>
                          ${lead.expectedRevenue.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
                      <select 
                        className="form-input" 
                        style={{ padding: '4px 8px', fontSize: 12, height: 'auto' }}
                        value={lead.status || 'NEW'}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
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
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Lead</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input placeholder="Enter First Name" className="form-input" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input placeholder="Enter Last Name" className="form-input" required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input placeholder="Enter Company Name" className="form-input" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} />
                </div>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input placeholder="Enter Email" type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input placeholder="Enter Phone" type="tel" className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                </div>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Source</label>
                    <select className="form-input" value={form.leadSource} onChange={e => setForm({...form, leadSource: e.target.value})}>
                      <option value="WEBSITE">Website</option>
                      <option value="REFERRAL">Referral</option>
                      <option value="COLD_CALL">Cold Call</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expected Revenue</label>
                    <input placeholder="Enter Expected Revenue" type="number" className="form-input" value={form.expectedRevenue} onChange={e => setForm({...form, expectedRevenue: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea placeholder="Enter Notes" className="form-input" rows="3" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

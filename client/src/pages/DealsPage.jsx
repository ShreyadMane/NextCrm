import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeals, createDeal, closeDeal } from '../features/deals/dealsSlice';
import { fetchCompanies } from '../features/companies/companiesSlice';
import { fetchContacts } from '../features/contacts/contactsSlice';
import { useToast } from '../components/Toast';

const STAGES = ['NEW', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST'];

export default function DealsPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, status } = useSelector((s) => s.deals);
  const companies = useSelector((s) => s.companies.items);
  const contacts = useSelector((s) => s.contacts.items);
  
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ dealName: '', accountId: '', contactId: '', value: 0, probability: 50, expectedCloseDate: '', source: 'WEBSITE', notes: '' });

  useEffect(() => {
    dispatch(fetchDeals());
    dispatch(fetchCompanies());
    dispatch(fetchContacts());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createDeal({ ...form, value: Number(form.value), probability: Number(form.probability) }));
    if (!res.error) {
      toast.success('Deal created');
      setShowModal(false);
      setForm({ dealName: '', accountId: '', contactId: '', value: 0, probability: 50, expectedCloseDate: '', source: 'WEBSITE', notes: '' });
    } else {
      toast.error('Failed to create deal');
    }
  };

  const handleClose = async (id, outcome) => {
    const res = await dispatch(closeDeal({ id, outcome }));
    if (!res.error) toast.success(`Deal marked as ${outcome}`);
  };

  const grouped = STAGES.reduce((acc, stage) => {
    // Treat legacy OPEN as NEW
    acc[stage] = items.filter((d) => d.stage === stage || (stage === 'NEW' && d.stage === 'OPEN'));
    return acc;
  }, {});

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Deals</h1>
          <p className="page-subtitle">Track your revenue pipeline</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Deal
        </button>
      </div>

      {status === 'loading' && items.length === 0 ? (
        <div className="page-loading"><div className="spinner"></div></div>
      ) : (
        <div className="kanban-board" style={{ gridTemplateColumns: `repeat(${STAGES.length}, minmax(280px, 1fr))` }}>
          {STAGES.map((stage) => (
            <div key={stage} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-title" style={{ color: stage === 'WON' ? 'var(--accent-green)' : stage === 'LOST' ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                  {stage.replace('_', ' ')}
                </div>
                <div className="kanban-column-count">{grouped[stage].length}</div>
              </div>
              <div className="kanban-column-body">
                {grouped[stage].map((deal) => (
                  <div key={deal._id} className="kanban-card">
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{deal.dealName || deal.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{deal.accountId?.name || deal.contactId?.firstName || 'No account'}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-blue)' }}>{formatCurrency(deal.value)}</span>
                      <span className="badge badge-amber">{deal.probability || 50}%</span>
                    </div>
                    
                    {!['WON', 'LOST'].includes(stage) && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-default)' }}>
                        <button className="btn-secondary" style={{ flex: 1, padding: '4px 8px', color: 'var(--accent-green)', borderColor: 'rgba(16, 185, 129, 0.2)' }} onClick={() => handleClose(deal._id, 'WON')}>Won</button>
                        <button className="btn-secondary" style={{ flex: 1, padding: '4px 8px', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleClose(deal._id, 'LOST')}>Lost</button>
                      </div>
                    )}
                    {(stage === 'WON' || stage === 'LOST') && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Closed: {new Date(deal.closedAt).toLocaleDateString()}</div>}
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
              <h2 className="modal-title">Create New Deal</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Deal Name *</label>
                  <input className="form-input" required value={form.dealName} onChange={e => setForm({...form, dealName: e.target.value})} placeholder="e.g. Acme Corp Enterprise License" />
                </div>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Account (Company)</label>
                    <select className="form-input" value={form.accountId} onChange={e => setForm({...form, accountId: e.target.value})}>
                      <option value="">Select Account...</option>
                      {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact</label>
                    <select className="form-input" value={form.contactId} onChange={e => setForm({...form, contactId: e.target.value})}>
                      <option value="">Select Contact...</option>
                      {contacts.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Value ($) *</label>
                    <input placeholder="Enter Value" type="number" min="0" step="100" className="form-input" required value={form.value} onChange={e => setForm({...form, value: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Probability (%)</label>
                    <input placeholder="Enter Probability" type="number" min="0" max="100" className="form-input" value={form.probability} onChange={e => setForm({...form, probability: e.target.value})} />
                  </div>
                </div>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Expected Close Date</label>
                    <input type="date" className="form-input" value={form.expectedCloseDate} onChange={e => setForm({...form, expectedCloseDate: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Source</label>
                    <select className="form-input" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                      <option value="WEBSITE">Website</option>
                      <option value="REFERRAL">Referral</option>
                      <option value="COLD_CALL">Cold Call</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea placeholder="Enter Notes" className="form-input" rows="2" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

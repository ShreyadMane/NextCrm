import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuotations, createQuotation, updateQuotation } from '../features/quotations/quotationsSlice';
import { fetchContacts } from '../features/contacts/contactsSlice';
import { fetchCompanies } from '../features/companies/companiesSlice';
import { fetchDeals } from '../features/deals/dealsSlice';
import { useToast } from '../components/Toast';

const STATUS_COLORS = { DRAFT: 'gray', SENT: 'blue', ACCEPTED: 'green', REJECTED: 'red', EXPIRED: 'amber' };

export default function QuotationsPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, status } = useSelector((s) => s.quotations);
  const contacts = useSelector((s) => s.contacts.items);
  const companies = useSelector((s) => s.companies.items);
  const deals = useSelector((s) => s.deals.items);
  
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ items: [{ description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }], notes: '', contactId: '', companyId: '', dealId: '' });

  useEffect(() => { 
    dispatch(fetchQuotations()); 
    dispatch(fetchContacts({ limit: 100 }));
    dispatch(fetchCompanies());
    dispatch(fetchDeals());
  }, [dispatch]);

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }] });
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx, field, val) => {
    const newItems = [...form.items];
    newItems[idx] = { ...newItems[idx], [field]: field === 'description' ? val : Number(val) };
    setForm({ ...form, items: newItems });
  };

  const calculateTotals = () => {
    let subTotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    form.items.forEach(i => {
      const lineTotal = i.quantity * i.unitPrice;
      subTotal += lineTotal;
      totalDiscount += i.discount || 0;
      totalTax += i.tax || 0;
    });

    const grandTotal = subTotal - totalDiscount + totalTax;
    return { subTotal, totalDiscount, totalTax, grandTotal };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      subTotal: totals.subTotal,
      totalDiscount: totals.totalDiscount,
      totalTax: totals.totalTax,
      total: totals.grandTotal,
      items: form.items.map(i => ({ ...i, total: (i.quantity * i.unitPrice) - (i.discount || 0) + (i.tax || 0) }))
    };
    const res = await dispatch(createQuotation(payload));
    if (!res.error) { 
      toast.success('Quotation created'); 
      setShowModal(false); 
      setForm({ items: [{ description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }], notes: '', contactId: '', companyId: '', dealId: '' }); 
    }
    else toast.error('Failed to create quotation');
  };

  const handleStatusChange = async (id, newStatus) => {
    const res = await dispatch(updateQuotation({ id, status: newStatus }));
    if (!res.error) toast.success(`Quotation marked as ${newStatus}`);
  };

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Quotations</h1><p className="page-subtitle">Create and manage sales quotes</p></div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Quotation
        </button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {status === 'loading' && items.length === 0 ? (
          <div className="page-loading"><div className="spinner"></div></div>
        ) : items.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📋</div><h3 className="empty-state-title">No Quotations</h3><p className="empty-state-desc">Create your first quotation.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Number</th><th>Client</th><th>Items</th><th>Subtotal</th><th>Discount</th><th>Tax</th><th>Total</th><th>Status</th><th>Date</th><th style={{ width: 120 }}>Action</th></tr></thead>
            <tbody>
              {items.map(q => (
                <tr key={q._id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{q.quotationNumber}</td>
                  <td style={{ fontSize: 13 }}>{q.contactId ? `${q.contactId.firstName} ${q.contactId.lastName}` : q.companyId?.name || '-'}</td>
                  <td>{q.items?.length || 0} items</td>
                  <td>{fmt(q.subTotal)}</td>
                  <td style={{ color: 'var(--accent-red)' }}>{fmt(q.totalDiscount)}</td>
                  <td>{fmt(q.totalTax)}</td>
                  <td style={{ fontWeight: 600 }}>{fmt(q.total || q.grandTotal)}</td>
                  <td><span className={`badge badge-${STATUS_COLORS[q.status]}`}>{q.status}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select className="form-input" style={{ padding: '2px 6px', fontSize: 11, height: 'auto' }} value={q.status} onChange={(e) => handleStatusChange(q._id, e.target.value)}>
                      {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay"><div className="modal-content" style={{ maxWidth: 800 }}>
          <div className="modal-header"><h2 className="modal-title">Create Quotation</h2><button className="btn-icon" onClick={() => setShowModal(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
          <form onSubmit={handleSubmit}><div className="modal-body">
            <div className="grid-2col" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Client (Contact)</label>
                <select className="form-input" value={form.contactId} onChange={e => setForm({...form, contactId: e.target.value})}>
                  <option value="">Select Contact...</option>
                  {contacts.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Account (Company)</label>
                <select className="form-input" value={form.companyId} onChange={e => setForm({...form, companyId: e.target.value})}>
                  <option value="">Select Company...</option>
                  {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Related Deal</label>
                <select className="form-input" value={form.dealId} onChange={e => setForm({...form, dealId: e.target.value})}>
                  <option value="">None</option>
                  {deals.map(d => <option key={d._id} value={d._id}>{d.dealName}</option>)}
                </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label className="form-label" style={{ margin: 0 }}>Line Items</label>
                <button type="button" className="btn-ghost" onClick={addItem} style={{ fontSize: 12 }}>+ Add Item</button>
              </div>
              {form.items.map((item, idx) => (
                <div key={idx} className="line-item-grid">
                  <input className="form-input" placeholder="Description" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} required title="Description" />
                  <input type="number" className="form-input" placeholder="Qty" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} title="Quantity" />
                  <input type="number" className="form-input" placeholder="Price" min="0" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} title="Unit Price" />
                  <input type="number" className="form-input" placeholder="Discount" min="0" step="0.01" value={item.discount} onChange={e => updateItem(idx, 'discount', e.target.value)} title="Discount Amount" />
                  <input type="number" className="form-input" placeholder="Tax" min="0" step="0.01" value={item.tax} onChange={e => updateItem(idx, 'tax', e.target.value)} title="Tax Amount" />
                  {form.items.length > 1 && (
                    <button type="button" className="btn-icon" onClick={() => removeItem(idx)} style={{ color: 'var(--accent-red)' }} title="Remove item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="grid-2col">
              <div className="form-group"><label className="form-label">Notes</label><textarea className="form-input" rows="3" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 6, fontSize: 13, background: 'var(--bg-elevated)', padding: 16, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Subtotal:</span><span>{fmt(totals.subTotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Total Discount:</span><span style={{ color: 'var(--accent-red)' }}>-{fmt(totals.totalDiscount)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Total Tax:</span><span>{fmt(totals.totalTax)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-default)' }}><span>Grand Total:</span><span style={{ color: 'var(--accent-green)' }}>{fmt(totals.grandTotal)}</span></div>
              </div>
            </div>
          </div><div className="modal-footer"><button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn-primary">Create Quotation</button></div></form>
        </div></div>
      )}
    </div>
  );
}

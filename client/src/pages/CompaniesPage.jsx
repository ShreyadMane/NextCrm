import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCompanies, createCompany, deleteCompany } from '../features/companies/companiesSlice';
import { useToast } from '../components/Toast';

export default function CompaniesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { items, status, meta } = useSelector((s) => s.companies);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', industry: 'OTHER', website: '', phone: '', email: '', employeeCount: 0, annualRevenue: 0, billingAddress: '', shippingAddress: '', gstVatNumber: '', description: '' });

  useEffect(() => { dispatch(fetchCompanies({ page, limit: 15, search })); }, [dispatch, page, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createCompany({ ...form, employeeCount: Number(form.employeeCount), annualRevenue: Number(form.annualRevenue) }));
    if (!res.error) { 
      toast.success('Company created'); 
      setShowModal(false); 
      setForm({ name: '', industry: 'OTHER', website: '', phone: '', email: '', employeeCount: 0, annualRevenue: 0, billingAddress: '', shippingAddress: '', gstVatNumber: '', description: '' }); 
      dispatch(fetchCompanies({ page, limit: 15, search })); 
    } else toast.error('Failed to create company');
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this company? Associated contacts will be unlinked.')) return;
    const res = await dispatch(deleteCompany(id));
    if (!res.error) toast.success('Company deleted');
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Companies</h1><p className="page-subtitle">Manage organizations and accounts</p></div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Company
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: 20, padding: 16 }}>
        <input className="form-input" placeholder="Search companies..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 400 }} />
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {status === 'loading' && items.length === 0 ? (
          <div className="page-loading"><div className="spinner"></div></div>
        ) : items.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🏢</div><h3 className="empty-state-title">No Companies Found</h3><p className="empty-state-desc">Add your first company account.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Company</th><th>Industry</th><th>Employees</th><th>Revenue</th><th>Phone</th><th style={{ width: 80, textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {items.map(c => (
                <tr key={c._id} onClick={() => navigate(`/companies/${c._id}`)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--accent-purple)' }}>
                        {c.name[0]}
                      </div>
                      <div><div>{c.name}</div>{c.website && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.website}</div>}</div>
                    </div>
                  </td>
                  <td>{c.industry || '-'}</td>
                  <td><span className="badge badge-gray">{c.employeeCount || c.size || 0}</span></td>
                  <td>{formatCurrency(c.annualRevenue)}</td>
                  <td>{c.phone || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-icon" onClick={(e) => handleDelete(e, c._id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 700 }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--accent-blue-glow)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-rounded">domain_add</span>
                </div>
                <div>
                  <h2 className="modal-title" style={{ margin: 0 }}>Add New Company</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Register a new company account in your CRM.</p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                
                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>domain</span>
                  Core Details
                </h3>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <div className="form-input-with-icon">
                    <span className="material-symbols-rounded">apartment</span>
                    <input placeholder="Enter Company Name" className="form-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                </div>
                
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">category</span>
                      <select className="form-input" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})}>
                        <option value="TECHNOLOGY">Technology</option>
                        <option value="HEALTHCARE">Healthcare</option>
                        <option value="FINANCE">Finance</option>
                        <option value="EDUCATION">Education</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">GST/VAT Number</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">receipt_long</span>
                      <input placeholder="Enter GST/VAT Number" className="form-input" value={form.gstVatNumber} onChange={e => setForm({...form, gstVatNumber: e.target.value})} />
                    </div>
                  </div>
                </div>

                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>monitoring</span>
                  Size & Financials
                </h3>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Employee Count</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">groups</span>
                      <input placeholder="Enter Employee Count" type="number" className="form-input" value={form.employeeCount} onChange={e => setForm({...form, employeeCount: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Annual Revenue ($)</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">attach_money</span>
                      <input placeholder="Enter Annual Revenue" type="number" className="form-input" value={form.annualRevenue} onChange={e => setForm({...form, annualRevenue: e.target.value})} />
                    </div>
                  </div>
                </div>

                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>contact_phone</span>
                  Contact Info
                </h3>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">language</span>
                      <input placeholder="Enter Website" className="form-input" value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">call</span>
                      <input placeholder="Enter Phone" className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="form-input-with-icon">
                    <span className="material-symbols-rounded">mail</span>
                    <input placeholder="Enter Email" type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                </div>

                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>location_on</span>
                  Locations & Notes
                </h3>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Billing Address</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">home_work</span>
                      <input placeholder="Enter Billing Address" className="form-input" value={form.billingAddress} onChange={e => setForm({...form, billingAddress: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Shipping Address</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">local_shipping</span>
                      <input placeholder="Enter Shipping Address" className="form-input" value={form.shippingAddress} onChange={e => setForm({...form, shippingAddress: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea placeholder="Enter Description" className="form-input" rows="2" style={{ paddingLeft: 12, minHeight: 60 }} value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-default)', paddingTop: 16, marginTop: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <span className="material-symbols-rounded" style={{ fontSize: 18, marginRight: 6, verticalAlign: 'text-bottom' }}>check_circle</span>
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCompany, updateCompany, clearCurrentCompany } from '../features/companies/companiesSlice';
import { useToast } from '../components/Toast';

export default function CompanyDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const company = useSelector((s) => s.companies.current);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    dispatch(getCompany(id)).then(res => {
      if (res.error) {
        toast.error('Failed to load company');
        navigate('/companies');
      } else {
        setForm(res.payload);
      }
    });
    return () => dispatch(clearCurrentCompany());
  }, [id, dispatch, navigate, toast]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await dispatch(updateCompany({ id, ...form, employeeCount: Number(form.employeeCount), annualRevenue: Number(form.annualRevenue) }));
    if (!res.error) {
      toast.success('Company updated');
      setEditing(false);
    } else {
      toast.error('Failed to update company');
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  if (!company) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <button className="btn-ghost" onClick={() => navigate('/companies')} style={{ marginBottom: 12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Companies
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 12, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: 'var(--accent-purple)' }}>{company.name[0]}</div>
            <div>
              <h1 className="page-title">{company.name}</h1>
              <p className="page-subtitle">{company.industry || 'No industry'} • {company.employeeCount || company.size || 0} employees</p>
            </div>
          </div>
          {!editing && <button className="btn-secondary" onClick={() => setEditing(true)}>Edit Company</button>}
        </div>
      </div>

      <div className="grid-2col" style={{ alignItems: 'start' }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Company Details</h2>
          
          {editing ? (
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input className="form-input" required value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="grid-2col">
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <select className="form-input" value={form.industry || 'OTHER'} onChange={e => setForm({...form, industry: e.target.value})}>
                    <option value="TECHNOLOGY">Technology</option>
                    <option value="HEALTHCARE">Healthcare</option>
                    <option value="FINANCE">Finance</option>
                    <option value="EDUCATION">Education</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">GST/VAT Number</label>
                  <input className="form-input" value={form.gstVatNumber || ''} onChange={e => setForm({...form, gstVatNumber: e.target.value})} />
                </div>
              </div>
              <div className="grid-2col">
                <div className="form-group">
                  <label className="form-label">Employee Count</label>
                  <input type="number" className="form-input" value={form.employeeCount || 0} onChange={e => setForm({...form, employeeCount: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Annual Revenue ($)</label>
                  <input type="number" className="form-input" value={form.annualRevenue || 0} onChange={e => setForm({...form, annualRevenue: e.target.value})} />
                </div>
              </div>
              <div className="grid-2col">
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input className="form-input" value={form.website || ''} onChange={e => setForm({...form, website: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="grid-2col">
                <div className="form-group">
                  <label className="form-label">Billing Address</label>
                  <input className="form-input" value={form.billingAddress || form.address || ''} onChange={e => setForm({...form, billingAddress: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Shipping Address</label>
                  <input className="form-input" value={form.shippingAddress || ''} onChange={e => setForm({...form, shippingAddress: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="3" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn-ghost" onClick={() => { setEditing(false); setForm(company); }}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="grid-2col">
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Website</div>
                  <div style={{ fontSize: 14, color: 'var(--accent-blue)' }}>{company.website ? <a href={company.website} target="_blank" rel="noreferrer" style={{color: 'inherit'}}>{company.website}</a> : '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>GST/VAT Number</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{company.gstVatNumber || '-'}</div>
                </div>
              </div>
              <div className="grid-2col">
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Email</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{company.email || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Phone</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{company.phone || '-'}</div>
                </div>
              </div>
              <div className="grid-2col">
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Annual Revenue</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-green)' }}>{formatCurrency(company.annualRevenue)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Employee Count</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{company.employeeCount || company.size || 0}</div>
                </div>
              </div>
              <div className="grid-2col">
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Billing Address</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{company.billingAddress || company.address || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Shipping Address</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{company.shippingAddress || '-'}</div>
                </div>
              </div>
              {company.description && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Description</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{company.description}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Associated Contacts</h2>
          {company.contacts?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {company.contacts.map(c => (
                <div key={c._id} className="kanban-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/contacts/${c._id}`)}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.firstName} {c.lastName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.jobTitle || c.email || ''}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '20px 10px' }}><div className="empty-state-icon" style={{ fontSize: 24 }}>👥</div><p className="empty-state-desc" style={{ fontSize: 12 }}>No contacts linked to this company</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

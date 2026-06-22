import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchContacts, createContact, deleteContact } from '../features/contacts/contactsSlice';
import { useToast } from '../components/Toast';

export default function ContactsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { items, status, meta } = useSelector((s) => s.contacts);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', mobile: '', companyName: '', jobTitle: '', department: '', address: '', socialProfiles: '', notes: '' });

  useEffect(() => {
    dispatch(fetchContacts({ page, limit: 10, search }));
  }, [dispatch, page, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createContact(form));
    if (!res.error) {
      toast.success('Contact created successfully');
      setShowModal(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', mobile: '', companyName: '', jobTitle: '', department: '', address: '', socialProfiles: '', notes: '' });
      dispatch(fetchContacts({ page, limit: 10, search }));
    } else {
      toast.error('Failed to create contact');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this contact?')) return;
    const res = await dispatch(deleteContact(id));
    if (!res.error) {
      toast.success('Contact deleted');
      dispatch(fetchContacts({ page, limit: 10, search }));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle">Manage your customer relationships.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Contact
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: 20, padding: 16 }}>
        <input 
          className="form-input" 
          placeholder="Search contacts by name, email, or company..." 
          value={search} 
          onChange={handleSearch}
          style={{ maxWidth: 400 }}
        />
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {status === 'loading' && items.length === 0 ? (
          <div className="page-loading"><div className="spinner"></div></div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3 className="empty-state-title">No Contacts Found</h3>
            <p className="empty-state-desc">Get started by creating your first contact.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th style={{ width: 80, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id} onClick={() => navigate(`/contacts/${c._id}`)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)' }}>
                        {c.firstName[0]}{c.lastName[0]}
                      </div>
                      <div>
                        <div>{c.firstName} {c.lastName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.jobTitle}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.companyName || '-'}</td>
                  <td>{c.email || '-'}</td>
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

        {meta?.total > 10 && (
          <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, meta.total)} of {meta.total} results
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <button className="btn-secondary" disabled={page * 10 >= meta.total} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Create New Contact</h2>
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
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input placeholder="Enter Email" type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div className="grid-2col" style={{ gap: 8 }}>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input placeholder="Enter Phone" type="tel" className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile</label>
                      <input placeholder="Enter Mobile" type="tel" className="form-input" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input placeholder="Enter Company" className="form-input" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} />
                  </div>
                  <div className="grid-2col" style={{ gap: 8 }}>
                    <div className="form-group">
                      <label className="form-label">Job Title</label>
                      <input placeholder="Enter Job Title" className="form-input" value={form.jobTitle} onChange={e => setForm({...form, jobTitle: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <input placeholder="Enter Department" className="form-input" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input placeholder="Enter Address" className="form-input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Social Profiles</label>
                    <input className="form-input" placeholder="e.g. LinkedIn URL" value={form.socialProfiles} onChange={e => setForm({...form, socialProfiles: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea placeholder="Enter Notes" className="form-input" rows="2" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

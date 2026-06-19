import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getContact, updateContact, clearCurrentContact } from '../features/contacts/contactsSlice';
import { fetchActivities, createActivity } from '../features/activities/activitySlice';
import { useToast } from '../components/Toast';
import FileAttachments from '../components/FileAttachments';

export default function ContactDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const contact = useSelector((s) => s.contacts.current);
  const { items: activities, status: actStatus } = useSelector((s) => s.activities);
  
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [actForm, setActForm] = useState({ type: 'NOTE', notes: '' });

  useEffect(() => {
    dispatch(getContact(id)).then(res => {
      if (res.error) {
        toast.error('Failed to load contact');
        navigate('/contacts');
      } else {
        setForm(res.payload);
      }
    });
    dispatch(fetchActivities({ contactId: id }));
    return () => dispatch(clearCurrentContact());
  }, [id, dispatch, navigate, toast]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await dispatch(updateContact({ id, ...form }));
    if (!res.error) {
      toast.success('Contact updated');
      setEditing(false);
    } else {
      toast.error('Failed to update contact');
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!actForm.notes.trim()) return;
    const res = await dispatch(createActivity({ ...actForm, contactId: id }));
    if (!res.error) {
      toast.success('Activity logged');
      setActForm({ type: 'NOTE', notes: '' });
    }
  };

  if (!contact) return <div className="page-loading"><div className="spinner"></div></div>;

  const initials = `${contact.firstName[0]}${contact.lastName[0]}`;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <button className="btn-ghost" onClick={() => navigate('/contacts')} style={{ marginBottom: 12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Contacts
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'var(--accent-blue)' }}>
              {initials}
            </div>
            <div>
              <h1 className="page-title">{contact.firstName} {contact.lastName}</h1>
              <p className="page-subtitle">{contact.jobTitle} {contact.companyName ? `at ${contact.companyName}` : ''}</p>
            </div>
          </div>
          {!editing && <button className="btn-secondary" onClick={() => setEditing(true)}>Edit Contact</button>}
        </div>
      </div>

      <div className="grid-2col" style={{ alignItems: 'start' }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Contact Details</h2>
          
          {editing ? (
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="grid-2col">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" value={form.firstName || ''} onChange={e => setForm({...form, firstName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" value={form.lastName || ''} onChange={e => setForm({...form, lastName: e.target.value})} required />
                </div>
              </div>
              <div className="grid-2col">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="grid-2col" style={{ gap: 8 }}>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" type="tel" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile</label>
                    <input className="form-input" type="tel" value={form.mobile || ''} onChange={e => setForm({...form, mobile: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="grid-2col">
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input className="form-input" value={form.companyName || ''} onChange={e => setForm({...form, companyName: e.target.value})} />
                </div>
                <div className="grid-2col" style={{ gap: 8 }}>
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input className="form-input" value={form.jobTitle || ''} onChange={e => setForm({...form, jobTitle: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input className="form-input" value={form.department || ''} onChange={e => setForm({...form, department: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
              <div className="grid-2col">
                <div className="form-group">
                  <label className="form-label">Social Profiles</label>
                  <input className="form-input" placeholder="e.g. LinkedIn URL" value={form.socialProfiles || ''} onChange={e => setForm({...form, socialProfiles: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" rows="2" value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})}></textarea>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn-ghost" onClick={() => { setEditing(false); setForm(contact); }}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="grid-2col">
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Email</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{contact.email || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Phone</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{contact.phone || '-'}</div>
                </div>
              </div>
              <div className="grid-2col">
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Mobile</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{contact.mobile || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Company</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{contact.companyName || '-'}</div>
                </div>
              </div>
              <div className="grid-2col">
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Job Title</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{contact.jobTitle || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Department</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{contact.department || '-'}</div>
                </div>
              </div>
              <div className="grid-2col">
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Address</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{contact.address || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Social Profiles</div>
                  <div style={{ fontSize: 14, color: 'var(--accent-blue)', wordBreak: 'break-all' }}>{contact.socialProfiles || '-'}</div>
                </div>
              </div>
              {contact.notes && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Notes</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{contact.notes}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Activity Timeline */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Activity Timeline</h2>
            
            <form onSubmit={handleCreateActivity} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                {['NOTE', 'CALL', 'EMAIL', 'MEETING'].map(t => (
                  <button 
                    key={t} type="button" 
                    className={`btn-ghost ${actForm.type === t ? 'active' : ''}`}
                    style={{ fontSize: 11, padding: '4px 8px', borderRadius: 12, background: actForm.type === t ? 'var(--bg-hover)' : 'transparent' }}
                    onClick={() => setActForm({ ...actForm, type: t })}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <textarea 
                className="form-input" 
                rows="3" 
                placeholder={`Log a ${actForm.type.toLowerCase()}...`}
                value={actForm.notes}
                onChange={e => setActForm({ ...actForm, notes: e.target.value })}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: 13 }}>Log Activity</button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {actStatus === 'loading' && activities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20 }}><div className="spinner"></div></div>
              ) : activities.length === 0 ? (
                <div className="empty-state" style={{ padding: '20px 10px' }}>
                  <div className="empty-state-icon" style={{ fontSize: 24, marginBottom: 8 }}>📝</div>
                  <p className="empty-state-desc" style={{ fontSize: 12 }}>No recent activity</p>
                </div>
              ) : (
                activities.map(act => (
                  <div key={act._id} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>
                      {act.type === 'CALL' ? '📞' : act.type === 'EMAIL' ? '✉️' : act.type === 'MEETING' ? '🤝' : '📝'}
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-elevated)', padding: 12, borderRadius: '0 8px 8px 8px', border: '1px solid var(--border-default)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{act.type} logged by {act.userId?.firstName}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(act.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{act.notes}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Attachments */}
          <FileAttachments entityType="contact" entityId={id} />
        </div>
      </div>
    </div>
  );
}

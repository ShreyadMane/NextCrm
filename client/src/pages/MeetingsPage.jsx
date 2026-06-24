import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeetings, createMeeting, deleteMeeting } from '../features/meetings/meetingsSlice';
import { fetchContacts } from '../features/contacts/contactsSlice';
import { fetchDeals } from '../features/deals/dealsSlice';
import { useToast } from '../components/Toast';

export default function MeetingsPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, status } = useSelector(s => s.meetings);
  const contacts = useSelector(s => s.contacts.items);
  const deals = useSelector(s => s.deals.items);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', startDate: '', endDate: '', status: 'SCHEDULED', location: '', meetingLink: '', relatedContact: '', relatedDeal: '', notes: '' });

  useEffect(() => {
    dispatch(fetchMeetings());
    dispatch(fetchContacts({ limit: 100 }));
    dispatch(fetchDeals());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createMeeting(form));
    if (!res.error) {
      toast.success('Meeting scheduled');
      setShowModal(false);
      setForm({ title: '', startDate: '', endDate: '', status: 'SCHEDULED', location: '', meetingLink: '', relatedContact: '', relatedDeal: '', notes: '' });
    } else toast.error('Failed to schedule meeting');
  };

  const handleDelete = async (id) => {
    if (!confirm('Cancel and delete this meeting?')) return;
    const res = await dispatch(deleteMeeting(id));
    if (!res.error) toast.success('Meeting deleted');
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Meetings</h1><p className="page-subtitle">Schedule and track your appointments</p></div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>Schedule Meeting</button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {status === 'loading' && items.length === 0 ? <div className="page-loading"><div className="spinner"></div></div> : items.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🗓️</div><h3 className="empty-state-title">No Meetings</h3><p className="empty-state-desc">You have no upcoming meetings.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Title</th><th>Date & Time</th><th>Contact / Deal</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {items.map(m => (
                <tr key={m._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{m.title}</div>
                    {m.meetingLink && <a href={m.meetingLink} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--accent-blue)' }}>Join Link</a>}
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{new Date(m.startDate).toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.location || 'No location'}</div>
                  </td>
                  <td>
                    {m.relatedContact ? <div style={{ fontSize: 13 }}>Contact: {m.relatedContact.firstName} {m.relatedContact.lastName}</div> : null}
                    {m.relatedDeal ? <div style={{ fontSize: 13 }}>Deal: {m.relatedDeal.dealName}</div> : null}
                  </td>
                  <td><span className={`badge badge-${m.status === 'SCHEDULED' ? 'blue' : m.status === 'COMPLETED' ? 'green' : 'red'}`}>{m.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-icon" onClick={() => handleDelete(m._id)} title="Delete meeting">
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
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2 className="modal-title">Schedule Meeting</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)} title="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Title *</label><input placeholder="Enter Title" className="form-input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                <div className="grid-2col">
                  <div className="form-group"><label className="form-label">Start Time *</label><input type="datetime-local" className="form-input" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">End Time</label><input type="datetime-local" className="form-input" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
                </div>
                <div className="grid-2col">
                  <div className="form-group"><label className="form-label">Location</label><input placeholder="Enter Location" className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Meeting Link</label><input placeholder="Enter Meeting Link" type="url" className="form-input" value={form.meetingLink} onChange={e => setForm({...form, meetingLink: e.target.value})} /></div>
                </div>
                <div className="grid-2col">
                  <div className="form-group"><label className="form-label">Related Contact</label>
                    <select className="form-input" value={form.relatedContact} onChange={e => setForm({...form, relatedContact: e.target.value})}>
                      <option value="">None</option>
                      {contacts.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Related Deal</label>
                    <select className="form-input" value={form.relatedDeal} onChange={e => setForm({...form, relatedDeal: e.target.value})}>
                      <option value="">None</option>
                      {deals.map(d => <option key={d._id} value={d._id}>{d.dealName}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Notes</label><textarea placeholder="Enter Notes" className="form-input" rows="2" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}></textarea></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn-primary">Schedule</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

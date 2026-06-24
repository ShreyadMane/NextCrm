import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCallLogs, createCallLog, deleteCallLog } from '../features/callLogs/callLogsSlice';
import { fetchContacts } from '../features/contacts/contactsSlice';
import { useToast } from '../components/Toast';

export default function CallLogsPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, status } = useSelector(s => s.callLogs);
  const contacts = useSelector(s => s.contacts.items);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ contactId: '', direction: 'OUTBOUND', durationMinutes: 0, callDate: '', notes: '', outcome: 'CONNECTED' });

  useEffect(() => {
    dispatch(fetchCallLogs());
    dispatch(fetchContacts({ limit: 100 }));
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createCallLog({...form, durationMinutes: Number(form.durationMinutes)}));
    if (!res.error) {
      toast.success('Call logged');
      setShowModal(false);
      setForm({ contactId: '', direction: 'OUTBOUND', durationMinutes: 0, callDate: '', notes: '', outcome: 'CONNECTED' });
    } else toast.error('Failed to log call');
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Call Logs</h1><p className="page-subtitle">Track your phone communications</p></div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>Log Call</button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {status === 'loading' && items.length === 0 ? <div className="page-loading"><div className="spinner"></div></div> : items.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📞</div><h3 className="empty-state-title">No Calls Logged</h3></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Date</th><th>Contact</th><th>Direction</th><th>Duration</th><th>Outcome</th><th>Notes</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {items.map(c => (
                <tr key={c._id}>
                  <td>{new Date(c.callDate).toLocaleString()}</td>
                  <td>{c.contactId ? `${c.contactId.firstName} ${c.contactId.lastName}` : '-'}</td>
                  <td><span className={`badge badge-${c.direction === 'INBOUND' ? 'purple' : 'blue'}`}>{c.direction}</span></td>
                  <td>{c.durationMinutes} min</td>
                  <td><span className={`badge badge-${c.outcome === 'CONNECTED' ? 'green' : c.outcome === 'LEFT_VOICEMAIL' ? 'amber' : 'red'}`}>{c.outcome}</span></td>
                  <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.notes}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-icon" onClick={() => dispatch(deleteCallLog(c._id))} title="Delete call log">
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
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Log a Call</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)} title="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Contact *</label>
                  <select className="form-input" required value={form.contactId} onChange={e => setForm({...form, contactId: e.target.value})}>
                    <option value="">Select Contact...</option>
                    {contacts.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
                  </select>
                </div>
                <div className="grid-2col">
                  <div className="form-group"><label className="form-label">Call Date *</label><input type="datetime-local" className="form-input" required value={form.callDate} onChange={e => setForm({...form, callDate: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Duration (min)</label><input type="number" placeholder="e.g. 15" className="form-input" value={form.durationMinutes} onChange={e => setForm({...form, durationMinutes: e.target.value})} /></div>
                </div>
                <div className="grid-2col">
                  <div className="form-group"><label className="form-label">Direction</label>
                    <select className="form-input" value={form.direction} onChange={e => setForm({...form, direction: e.target.value})}>
                      <option value="INBOUND">Inbound</option><option value="OUTBOUND">Outbound</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Outcome</label>
                    <select className="form-input" value={form.outcome} onChange={e => setForm({...form, outcome: e.target.value})}>
                      <option value="CONNECTED">Connected</option><option value="NO_ANSWER">No Answer</option><option value="LEFT_VOICEMAIL">Left Voicemail</option><option value="BUSY">Busy</option>
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-input" placeholder="Enter Notes" rows="3" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}></textarea></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn-primary">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, createUser, updateUser, deleteUser } from '../features/users/usersSlice';
import { useToast } from '../components/Toast';

const ROLES = ['ADMIN', 'MANAGER', 'SALES', 'VIEWER'];
const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

export default function UserManagementPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, status } = useSelector((s) => s.users);
  const currentUser = useSelector((s) => s.auth.user);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    firstName: '', lastName: '', email: '', password: '', role: 'SALES',
    employeeId: '', phone: '', department: '', designation: '', status: 'ACTIVE' 
  });

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createUser(form));
    if (!res.error) { 
      toast.success('User created'); 
      setShowModal(false); 
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'SALES', employeeId: '', phone: '', department: '', designation: '', status: 'ACTIVE' }); 
    }
    else toast.error(res.error?.message || 'Failed to create user');
  };

  const handleUpdateField = async (id, field, value) => {
    const res = await dispatch(updateUser({ id, [field]: value }));
    if (!res.error) toast.success(`${field} updated`);
  };

  const handleDelete = async (id) => {
    if (id === currentUser?._id) { toast.error('Cannot delete yourself'); return; }
    if (!confirm('Delete this user? This cannot be undone.')) return;
    const res = await dispatch(deleteUser(id));
    if (!res.error) toast.success('User deleted');
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">User Management</h1><p className="page-subtitle">Manage users, roles, and permissions</p></div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Invite User
        </button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {status === 'loading' && items.length === 0 ? (
          <div className="page-loading"><div className="spinner"></div></div>
        ) : items.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">👤</div><h3 className="empty-state-title">No Users</h3></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>User Info</th><th>Contact / Dept</th><th>Role</th><th>Status</th><th style={{ width: 80, textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {items.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{u.firstName} {u.lastName} {u._id === currentUser?._id && <span style={{ fontSize: 10, color: 'var(--accent-green)', marginLeft: 4 }}>(You)</span>}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {u.employeeId || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.email}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.department ? `${u.department} ${u.designation ? `- ${u.designation}` : ''}` : '-'}</div>
                  </td>
                  <td>
                    <select className="form-input" style={{ padding: '2px 8px', fontSize: 12, height: 'auto', width: 'auto' }} value={u.role} onChange={(e) => handleUpdateField(u._id, 'role', e.target.value)}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="form-input" style={{ padding: '2px 8px', fontSize: 12, height: 'auto', width: 'auto' }} value={u.status} onChange={(e) => handleUpdateField(u._id, 'status', e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {u._id !== currentUser?._id && (
                      <button className="btn-icon" onClick={() => handleDelete(u._id)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    )}
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
                  <span className="material-symbols-rounded">person_add</span>
                </div>
                <div>
                  <h2 className="modal-title" style={{ margin: 0 }}>Invite New User</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Add a new team member to the CRM.</p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setShowModal(false)} title="Close">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                
                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>badge</span>
                  Personal Info
                </h3>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">person</span>
                      <input className="form-input" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="e.g. Jane" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">person</span>
                      <input className="form-input" required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="e.g. Doe" />
                    </div>
                  </div>
                </div>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">id_card</span>
                      <input className="form-input" value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} placeholder="e.g. EMP-1001" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">call</span>
                      <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="e.g. +1 555-0123" />
                    </div>
                  </div>
                </div>

                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>lock</span>
                  Account Security
                </h3>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">mail</span>
                      <input type="email" className="form-input" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jane.doe@company.com" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">key</span>
                      <input type="password" className="form-input" required minLength="6" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Minimum 6 characters" />
                    </div>
                  </div>
                </div>

                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>work</span>
                  Company Role
                </h3>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">corporate_fare</span>
                      <input className="form-input" value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="e.g. Sales" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">engineering</span>
                      <input className="form-input" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} placeholder="e.g. Account Executive" />
                    </div>
                  </div>
                </div>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">admin_panel_settings</span>
                      <select className="form-input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">toggle_on</span>
                      <select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-default)', paddingTop: 16, marginTop: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <span className="material-symbols-rounded" style={{ fontSize: 18, marginRight: 6, verticalAlign: 'text-bottom' }}>check_circle</span>
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

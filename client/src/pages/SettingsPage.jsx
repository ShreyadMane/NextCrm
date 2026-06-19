import { useSelector } from 'react-redux';

export default function SettingsPage() {
  const user = useSelector(s => s.auth.user);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid-2col" style={{ alignItems: 'start' }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Profile Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="grid-2col">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-input" disabled value={user?.firstName || ''} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" disabled value={user?.lastName || ''} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" disabled value={user?.email || ''} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input className="form-input" disabled value={user?.role || ''} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              Profile editing requires administrator privileges.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Preferences</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-default)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Dark Mode</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>System default</div>
              </div>
              <div className="checkbox-custom checked"></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Email Notifications</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Receive daily summaries</div>
              </div>
              <div className="checkbox-custom checked"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import { fetchNotifications, markNotificationRead } from '../features/notifications/notificationsSlice';
import api from '../app/axios';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const notifications = useSelector((s) => s.notifications.items);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch notification history on mount
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(data.data);
        setShowSearch(true);
      } catch {
        setSearchResults(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchNavigate = (type, id) => {
    setShowSearch(false);
    setSearchQuery('');
    if (type === 'contact') navigate(`/contacts/${id}`);
    else if (type === 'lead') navigate('/leads');
    else if (type === 'deal') navigate('/deals');
  };

  return (
    <div className="topbar">
      {/* Search */}
      <div className="topbar-search" ref={searchRef}>
        <span className="search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search contacts, leads, deals…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults && setShowSearch(true)}
        />
        {showSearch && searchResults && (
          <div className="search-results">
            {searchResults.contacts?.length > 0 && (
              <>
                <div style={{ padding: '8px 16px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contacts</div>
                {searchResults.contacts.map((c) => (
                  <div key={c._id} className="search-result-item" onClick={() => handleSearchNavigate('contact', c._id)}>
                    <span className="badge badge-blue">C</span>
                    <span>{c.firstName} {c.lastName}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 'auto' }}>{c.email}</span>
                  </div>
                ))}
              </>
            )}
            {searchResults.leads?.length > 0 && (
              <>
                <div style={{ padding: '8px 16px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Leads</div>
                {searchResults.leads.map((l) => (
                  <div key={l._id} className="search-result-item" onClick={() => handleSearchNavigate('lead', l._id)}>
                    <span className="badge badge-green">L</span>
                    <span>{l.title}</span>
                    <span className="badge badge-gray" style={{ marginLeft: 'auto' }}>{l.stage}</span>
                  </div>
                ))}
              </>
            )}
            {searchResults.deals?.length > 0 && (
              <>
                <div style={{ padding: '8px 16px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Deals</div>
                {searchResults.deals.map((d) => (
                  <div key={d._id} className="search-result-item" onClick={() => handleSearchNavigate('deal', d._id)}>
                    <span className="badge badge-purple">D</span>
                    <span>{d.title}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 'auto' }}>${d.value?.toLocaleString()}</span>
                  </div>
                ))}
              </>
            )}
            {(!searchResults.contacts?.length && !searchResults.leads?.length && !searchResults.deals?.length) && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No results found</div>
            )}
          </div>
        )}
      </div>

      <div className="topbar-actions">
        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button className="btn-icon" onClick={() => setShowNotifs(!showNotifs)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className="badge" />}
          </button>
          {showNotifs && (
            <div className="notification-dropdown">
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-default)', fontWeight: 700, fontSize: 14 }}>
                Notifications
                {unreadCount > 0 && <span className="badge badge-blue" style={{ marginLeft: 8 }}>{unreadCount}</span>}
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notifications yet</div>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <div
                    key={n._id || n.message}
                    className={`notification-item ${!n.read ? 'unread' : ''}`}
                    onClick={() => n._id && dispatch(markNotificationRead(n._id))}
                  >
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button className="btn-ghost" onClick={() => setShowUserMenu(!showUserMenu)} style={{ gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 12, color: 'white'
            }}>
              {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U'}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{user?.firstName || 'User'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </button>
          {showUserMenu && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
              minWidth: 180, zIndex: 50, overflow: 'hidden'
            }}>
              <div
                style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', transition: 'background 0.15s' }}
                onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                onMouseEnter={(e) => e.target.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                Settings
              </div>
              <div style={{ borderTop: '1px solid var(--border-default)' }} />
              <div
                style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 13, color: 'var(--accent-red)', transition: 'background 0.15s' }}
                onClick={() => dispatch(logout())}
                onMouseEnter={(e) => e.target.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

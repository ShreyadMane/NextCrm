import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import api from '../app/axios';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [funnel, setFunnel] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/analytics/funnel'),
      api.get('/tasks?status=NOT_STARTED,IN_PROGRESS') // Pending tasks
    ]).then(([resStats, resFunnel, resTasks]) => {
      setStats(resStats.data.data);
      // Map funnel data
      const order = { 'NEW': 1, 'CONTACTED': 2, 'QUALIFIED': 3, 'PROPOSAL_SENT': 4, 'NEGOTIATION': 5 };
      const sortedFunnel = resFunnel.data.data.sort((a, b) => (order[a._id] || 99) - (order[b._id] || 99));
      setFunnel(sortedFunnel.map(f => ({ name: f._id, count: f.count })));
      
      const pending = resTasks.data.data.filter(t => t.status !== 'COMPLETED');
      setTasks(pending.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
      </div>
    );
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
  const winRatePct = stats ? Math.round(stats.winRate * 100) : 0;

  // Mock revenue data for AreaChart over 6 months
  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 5000 },
    { name: 'Mar', revenue: 4500 },
    { name: 'Apr', revenue: 7000 },
    { name: 'May', revenue: 6500 },
    { name: 'Jun', revenue: Math.max(stats?.revenue || 8000, 8000) }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Here is what is happening with your pipeline today.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/meetings" className="btn-secondary">Schedule Meeting</Link>
          <Link to="/deals" className="btn-primary">New Deal</Link>
        </div>
      </div>

      <div className="grid-stats" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatCard label="Total Contacts" value={stats?.contactCount || 0} icon="users" color="blue" link="/contacts" />
        <StatCard label="Open Leads" value={stats?.openLeads || 0} icon="target" color="amber" link="/leads" />
        <StatCard label="Open Deals" value={stats?.openDeals || 0} icon="briefcase" color="purple" link="/deals" />
        <StatCard label="Revenue Won" value={formatCurrency(stats?.revenue || 0)} icon="dollar" color="green" link="/deals" />
        
        <StatCard label="Win Rate" value={`${winRatePct}%`} icon="trending-up" color="cyan" link="/deals" />
        <StatCard label="Pending Tasks" value={stats?.pendingTasks || 0} icon="check-square" color="blue" link="/tasks" />
        <StatCard label="Overdue Tasks" value={stats?.overdueTasks || 0} icon="alert-circle" color="red" link="/tasks" />
        <StatCard label="Open Tickets" value={stats?.openTickets || 0} icon="life-buoy" color="amber" link="/tickets" />
      </div>

      <div className="grid-2col" style={{ marginBottom: '24px' }}>
        {/* Revenue Area Chart */}
        <div className="glass-card" style={{ padding: '24px', height: 350, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Revenue Overview</h2>
          <div style={{ flex: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--accent-blue)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Funnel Bar Chart */}
        <div className="glass-card" style={{ padding: '24px', height: 350, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Lead Funnel</h2>
          {funnel.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px', flex: 1 }}>
              <div className="empty-state-icon" style={{ fontSize: '32px' }}>📊</div>
              <h3 className="empty-state-title" style={{ fontSize: '14px' }}>No Leads Data</h3>
            </div>
          ) : (
            <div style={{ flex: 1, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'var(--bg-hover)' }}
                    contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8 }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                    {funnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Tasks Widget */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Upcoming Tasks</h2>
          <Link to="/tasks" style={{ fontSize: '13px', color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>View All</Link>
        </div>
        {tasks.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <div className="empty-state-icon" style={{ fontSize: '32px' }}>✅</div>
            <h3 className="empty-state-title" style={{ fontSize: '14px' }}>All caught up</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tasks.map(t => (
              <div key={t._id} style={{ padding: '12px 16px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={`checkbox-custom`}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{t.title}</div>
                  {t.dueAt && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Due: {new Date(t.dueAt).toLocaleDateString()}</div>}
                </div>
                {t.priority === 'HIGH' && <span className="badge badge-red">High</span>}
                {t.priority === 'MEDIUM' && <span className="badge badge-amber">Med</span>}
                {t.priority === 'LOW' && <span className="badge badge-green">Low</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, link }) {
  const renderIcon = () => {
    switch (icon) {
      case 'users': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
      case 'target': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
      case 'dollar': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
      case 'trending-up': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
      case 'briefcase': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>;
      case 'check-square': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>;
      case 'alert-circle': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
      case 'life-buoy': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>;
      default: return null;
    }
  };

  const content = (
    <div className="stat-card" style={{ cursor: link ? 'pointer' : 'default', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>
      <div className="stat-card-header">
        <div className="stat-card-label">{label}</div>
        <div className={`stat-card-icon ${color}`}>{renderIcon()}</div>
      </div>
      <div className="stat-card-value">{value}</div>
    </div>
  );

  return link ? <Link to={link} style={{ textDecoration: 'none', color: 'inherit' }}>{content}</Link> : content;
}

import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, RadialBarChart, RadialBar,
  Legend
} from 'recharts';
import api from '../app/axios';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#ef4444', '#10b981', '#ec4899'];
const GRADIENT_PAIRS = [
  ['#6366f1', '#818cf8'], // indigo
  ['#f59e0b', '#fbbf24'], // amber
  ['#8b5cf6', '#a78bfa'], // purple
  ['#059669', '#34d399'], // emerald
  ['#0ea5e9', '#38bdf8'], // sky
  ['#3b82f6', '#60a5fa'], // blue
  ['#ef4444', '#f87171'], // red
  ['#d946ef', '#e879f9'], // fuchsia
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [funnel, setFunnel] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/analytics/funnel'),
      api.get('/tasks?status=NOT_STARTED,IN_PROGRESS')
    ]).then(([resStats, resFunnel, resTasks]) => {
      setStats(resStats.data.data);
      const order = { 'NEW': 1, 'CONTACTED': 2, 'QUALIFIED': 3, 'PROPOSAL_SENT': 4, 'NEGOTIATION': 5 };
      const sortedFunnel = resFunnel.data.data.sort((a, b) => (order[a._id] || 99) - (order[b._id] || 99));
      setFunnel(sortedFunnel.map(f => ({ name: f._id.replace(/_/g, ' '), count: f.count })));
      const pending = resTasks.data.data.filter(t => t.status !== 'COMPLETED');
      setTasks(pending.slice(0, 5));
    }).finally(() => {
      setLoading(false);
      setTimeout(() => setAnimateCards(true), 50);
    });
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

  const revenueData = [
    { name: 'Jan', revenue: 4000, lastYear: 3200 },
    { name: 'Feb', revenue: 5000, lastYear: 3800 },
    { name: 'Mar', revenue: 4500, lastYear: 4100 },
    { name: 'Apr', revenue: 7000, lastYear: 5200 },
    { name: 'May', revenue: 6500, lastYear: 4900 },
    { name: 'Jun', revenue: Math.max(stats?.revenue || 8000, 8000), lastYear: 5600 }
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const radialData = [
    { name: 'Win Rate', value: winRatePct, fill: 'url(#radialGrad)' }
  ];

  const statCards = [
    { label: 'Total Contacts', value: stats?.contactCount || 0, icon: 'users', gradient: 0, link: '/contacts', trend: '+12%' },
    { label: 'Open Leads', value: stats?.openLeads || 0, icon: 'target', gradient: 1, link: '/leads', trend: '+8%' },
    { label: 'Open Deals', value: stats?.openDeals || 0, icon: 'briefcase', gradient: 2, link: '/deals', trend: '+5%' },
    { label: 'Revenue Won', value: formatCurrency(stats?.revenue || 0), icon: 'dollar', gradient: 3, link: '/deals', trend: '+23%' },
  ];

  const statCards2 = [
    { label: 'Win Rate', value: `${winRatePct}%`, icon: 'trending-up', gradient: 4, link: '/deals', trend: '+3%' },
    { label: 'Pending Tasks', value: stats?.pendingTasks || 0, icon: 'check-square', gradient: 5, link: '/tasks', trend: null },
    { label: 'Overdue Tasks', value: stats?.overdueTasks || 0, icon: 'alert-circle', gradient: 6, link: '/tasks', trend: null },
    { label: 'Open Tickets', value: stats?.openTickets || 0, icon: 'life-buoy', gradient: 7, link: '/tickets', trend: '-4%' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="dash-tooltip">
          <p className="dash-tooltip-label">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="dash-tooltip-value" style={{ color: p.color }}>
              {p.name}: {p.name.toLowerCase().includes('revenue') || p.name.toLowerCase().includes('year')
                ? `$${p.value.toLocaleString()}`
                : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dash-container">
      {/* Stats Row 1 */}
      <div className="dash-stats-grid">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} index={i} animate={animateCards} />
        ))}
      </div>

      {/* Stats Row 2 */}
      <div className="dash-stats-grid">
        {statCards2.map((card, i) => (
          <StatCard key={card.label} {...card} index={i + 4} animate={animateCards} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="dash-charts-row">
        {/* Revenue Area Chart */}
        <div className="dash-chart-card dash-chart-card--wide">
          <div className="dash-chart-header">
            <div>
              <h2 className="dash-chart-title">Revenue Overview</h2>
              <p className="dash-chart-subtitle">Monthly revenue comparison</p>
            </div>
            <div className="dash-chart-legend">
              <span className="dash-legend-dot" style={{ background: '#6366f1' }}></span>
              <span className="dash-legend-text">This Year</span>
              <span className="dash-legend-dot" style={{ background: '#94a3b8' }}></span>
              <span className="dash-legend-text">Last Year</span>
            </div>
          </div>
          <div className="dash-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="colorRevOld" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.15}/>
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="lastYear" name="Last Year" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorRevOld)" />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevNew)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win Rate Radial */}
        <div className="dash-chart-card">
          <div className="dash-chart-header">
            <div>
              <h2 className="dash-chart-title">Win Rate</h2>
              <p className="dash-chart-subtitle">Deal conversion</p>
            </div>
          </div>
          <div className="dash-chart-body dash-radial-wrap">
            <div className="dash-radial-center">
              <span className="dash-radial-pct">{winRatePct}%</span>
              <span className="dash-radial-label">conversion</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="72%" outerRadius="95%" startAngle={90} endAngle={-270} data={radialData} barSize={14}>
                <defs>
                  <linearGradient id="radialGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                <RadialBar background={{ fill: 'var(--bg-hover)' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dash-bottom-row">
        {/* Lead Funnel */}
        <div className="dash-chart-card">
          <div className="dash-chart-header">
            <div>
              <h2 className="dash-chart-title">Lead Funnel</h2>
              <p className="dash-chart-subtitle">Pipeline stages</p>
            </div>
          </div>
          {funnel.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">📊</div>
              <p className="dash-empty-text">No leads data yet</p>
            </div>
          ) : (
            <div className="dash-chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    {funnel.map((_, i) => (
                      <linearGradient key={`barGrad-${i}`} id={`barGrad-${i}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.85}/>
                        <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={1}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-hover)', radius: 6 }} />
                  <Bar dataKey="count" name="Leads" radius={[0, 8, 8, 0]} barSize={20}>
                    {funnel.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#barGrad-${index})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="dash-chart-card dash-tasks-card">
          <div className="dash-chart-header">
            <div>
              <h2 className="dash-chart-title">Upcoming Tasks</h2>
              <p className="dash-chart-subtitle">{tasks.length} pending</p>
            </div>
            <Link to="/tasks" className="dash-view-all">
              View All
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_forward_ios</span>
            </Link>
          </div>
          {tasks.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">✅</div>
              <p className="dash-empty-text">All caught up! No pending tasks.</p>
            </div>
          ) : (
            <div className="dash-tasks-list">
              {tasks.map((t, i) => (
                <div key={t._id} className="dash-task-item" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="dash-task-dot-wrap">
                    <div className={`dash-task-dot ${t.priority === 'HIGH' ? 'high' : t.priority === 'MEDIUM' ? 'med' : 'low'}`}></div>
                    {i < tasks.length - 1 && <div className="dash-task-line"></div>}
                  </div>
                  <div className="dash-task-content">
                    <div className="dash-task-title">{t.title}</div>
                    <div className="dash-task-meta">
                      {t.dueAt && (
                        <span className="dash-task-due">
                          <span className="material-symbols-rounded" style={{ fontSize: 14, marginTop: -1 }}>schedule</span>
                          {new Date(t.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {t.priority && (
                        <span className={`dash-task-badge ${t.priority.toLowerCase()}`}>
                          {t.priority === 'HIGH' ? '🔴' : t.priority === 'MEDIUM' ? '🟡' : '🟢'} {t.priority.charAt(0) + t.priority.slice(1).toLowerCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ── Stat Card Component ── */
function StatCard({ label, value, icon, gradient, link, trend, index, animate }) {
  const [gFrom, gTo] = GRADIENT_PAIRS[gradient % GRADIENT_PAIRS.length];

  const renderIcon = () => {
    switch (icon) {
      case 'users': return <span className="material-symbols-rounded">group</span>;
      case 'target': return <span className="material-symbols-rounded">my_location</span>;
      case 'dollar': return <span className="material-symbols-rounded">attach_money</span>;
      case 'trending-up': return <span className="material-symbols-rounded">trending_up</span>;
      case 'briefcase': return <span className="material-symbols-rounded">work</span>;
      case 'check-square': return <span className="material-symbols-rounded">check_box</span>;
      case 'alert-circle': return <span className="material-symbols-rounded">error</span>;
      case 'life-buoy': return <span className="material-symbols-rounded">support</span>;
      default: return null;
    }
  };

  const content = (
    <div
      className={`dash-stat-card ${animate ? 'animate-in' : ''}`}
      style={{ '--card-delay': `${index * 60}ms`, '--grad-from': gFrom, '--grad-to': gTo }}
    >
      <div className="dash-stat-card-glow"></div>
      <div className="dash-stat-icon">{renderIcon()}</div>
      <div className="dash-stat-info">
        <span className="dash-stat-label">{label}</span>
        <span className="dash-stat-value">{value}</span>
        {trend && (
          <span className={`dash-stat-trend ${trend.startsWith('+') ? 'up' : 'down'}`}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
              {trend.startsWith('+') ? 'trending_up' : 'trending_down'}
            </span>
            {trend}
          </span>
        )}
      </div>
    </div>
  );

  return link ? <Link to={link} style={{ textDecoration: 'none', color: 'inherit' }}>{content}</Link> : content;
}

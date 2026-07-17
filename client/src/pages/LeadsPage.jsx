import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads, createLead, updateLead } from '../features/leads/leadsSlice';
import { useToast } from '../components/Toast';

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];
const RATINGS = ['HOT', 'WARM', 'COLD'];
const SOURCES = [
  'WEBSITE',
  'REFERRAL',
  'COLD_CALL',
  'SOCIAL_MEDIA',
  'ADVERTISEMENT',
  'TRADE_SHOW',
  'EMAIL_CAMPAIGN',
  'OTHER',
];

const STATUS_COLORS = {
  NEW: 'blue',
  CONTACTED: 'cyan',
  QUALIFIED: 'purple',
  CONVERTED: 'green',
  LOST: 'red',
};

const RATING_COLORS = {
  HOT: 'red',
  WARM: 'amber',
  COLD: 'blue',
};

const formatLabel = (value) => value.replaceAll('_', ' ');

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-');

const getLeadName = (lead) => {
  const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ').trim();
  return name || lead.title || 'Untitled lead';
};

const getInitials = (lead) => {
  const name = getLeadName(lead).split(' ').filter(Boolean);
  return `${name[0]?.[0] || 'L'}${name[1]?.[0] || ''}`.toUpperCase();
};

export default function LeadsPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { byStage, status: loadStatus } = useSelector((s) => s.leads);

  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('board');
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    rating: 'ALL',
    source: 'ALL',
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    leadSource: 'WEBSITE',
    industry: 'OTHER',
    rating: 'WARM',
    expectedRevenue: 0,
    status: 'NEW',
    notes: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search.trim()), 250);
    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    dispatch(fetchLeads({
      search: debouncedSearch,
      status: filters.status,
      source: filters.source,
      rating: filters.rating,
    }));
  }, [dispatch, debouncedSearch, filters.status, filters.source, filters.rating]);

  const allLeads = useMemo(() => {
    const ordered = STATUSES.flatMap((stage) => byStage[stage] || []);
    const extras = Object.keys(byStage)
      .filter((stage) => !STATUSES.includes(stage))
      .flatMap((stage) => byStage[stage] || []);
    return [...ordered, ...extras];
  }, [byStage]);

  const filteredLeads = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return allLeads.filter((lead) => {
      const matchesSearch = !searchTerm || [
        lead.firstName,
        lead.lastName,
        lead.companyName,
        lead.email,
        lead.phone,
        lead.leadSource,
        lead.notes,
      ].filter(Boolean).join(' ').toLowerCase().includes(searchTerm);

      return (
        matchesSearch &&
        (filters.status === 'ALL' || lead.status === filters.status) &&
        (filters.rating === 'ALL' || lead.rating === filters.rating) &&
        (filters.source === 'ALL' || lead.leadSource === filters.source)
      );
    });
  }, [allLeads, filters]);

  const groupedLeads = useMemo(() => {
    return STATUSES.reduce((acc, leadStatus) => {
      acc[leadStatus] = filteredLeads.filter((lead) => (lead.status || 'NEW') === leadStatus);
      return acc;
    }, {});
  }, [filteredLeads]);

  const visibleStatuses = filters.status === 'ALL' ? STATUSES : [filters.status];
  const openCount = filteredLeads.filter((lead) => !['CONVERTED', 'LOST'].includes(lead.status)).length;
  const hotCount = filteredLeads.filter((lead) => lead.rating === 'HOT').length;
  const revenueTotal = filteredLeads.reduce((sum, lead) => sum + Number(lead.expectedRevenue || 0), 0);

  const resetFilters = () => {
    setFilters({ search: '', status: 'ALL', rating: 'ALL', source: 'ALL' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createLead({ ...form, expectedRevenue: Number(form.expectedRevenue) }));
    if (!res.error) {
      toast.success('Lead created');
      setShowModal(false);
      setForm({
        firstName: '',
        lastName: '',
        companyName: '',
        email: '',
        phone: '',
        leadSource: 'WEBSITE',
        industry: 'OTHER',
        rating: 'WARM',
        expectedRevenue: 0,
        status: 'NEW',
        notes: '',
      });
    } else {
      toast.error('Failed to create lead');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const res = await dispatch(updateLead({ id, status: newStatus }));
    if (!res.error) toast.success(`Lead moved to ${formatLabel(newStatus)}`);
    else toast.error('Failed to update lead');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">Track and qualify prospects from first touch to conversion.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Lead
        </button>
      </div>

      <div className="glass-card tracking-toolbar">
        <div className="tracking-toolbar-row wrap">
          <div className="tracking-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              className="form-input"
              placeholder="Search leads by name, company, email, or notes..."
              value={filters.search}
              onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
            />
          </div>

          <div className="segmented-control" aria-label="Lead view">
            <button className={`segmented-button ${viewMode === 'board' ? 'active' : ''}`} onClick={() => setViewMode('board')} type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="18" rx="1" /><rect x="14" y="3" width="7" height="18" rx="1" /></svg>
              Board
            </button>
            <button className={`segmented-button ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
              List
            </button>
          </div>
        </div>

        <div className="tracking-toolbar-row wrap">
          <div className="tracking-filter-grid">
            <div className="tracking-control">
              <label>Status</label>
              <select className="form-input" value={filters.status} onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))}>
                <option value="ALL">All statuses</option>
                {STATUSES.map((leadStatus) => <option key={leadStatus} value={leadStatus}>{formatLabel(leadStatus)}</option>)}
              </select>
            </div>
            <div className="tracking-control">
              <label>Rating</label>
              <select className="form-input" value={filters.rating} onChange={(e) => setFilters((current) => ({ ...current, rating: e.target.value }))}>
                <option value="ALL">All ratings</option>
                {RATINGS.map((rating) => <option key={rating} value={rating}>{formatLabel(rating)}</option>)}
              </select>
            </div>
            <div className="tracking-control">
              <label>Source</label>
              <select className="form-input" value={filters.source} onChange={(e) => setFilters((current) => ({ ...current, source: e.target.value }))}>
                <option value="ALL">All sources</option>
                {SOURCES.map((source) => <option key={source} value={source}>{formatLabel(source)}</option>)}
              </select>
            </div>
          </div>

          <button className="btn-secondary" type="button" onClick={resetFilters}>Reset</button>
        </div>
      </div>

      <div className="tracking-metrics">
        <div className="tracking-metric"><span>Matching leads</span><strong>{filteredLeads.length}</strong><small>{allLeads.length} loaded</small></div>
        <div className="tracking-metric"><span>Open pipeline</span><strong>{openCount}</strong><small>Not converted or lost</small></div>
        <div className="tracking-metric"><span>Hot leads</span><strong>{hotCount}</strong><small>Highest rating</small></div>
        <div className="tracking-metric"><span>Expected value</span><strong>{formatCurrency(revenueTotal)}</strong><small>Filtered total</small></div>
      </div>

      {loadStatus === 'loading' && allLeads.length === 0 ? (
        <div className="page-loading"><div className="spinner"></div></div>
      ) : filteredLeads.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            </div>
            <h3 className="empty-state-title">No leads found</h3>
            <p className="empty-state-desc">Try adjusting the tracking filters or create a new lead.</p>
          </div>
        </div>
      ) : viewMode === 'board' ? (
        <div className="kanban-board">
          {visibleStatuses.map((leadStatus) => (
            <div key={leadStatus} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <span className={`badge badge-${STATUS_COLORS[leadStatus]}`} style={{ marginRight: 8 }}>{formatLabel(leadStatus)}</span>
                </div>
                <div className="kanban-column-count">{groupedLeads[leadStatus]?.length || 0}</div>
              </div>
              <div className="kanban-column-body">
                {(groupedLeads[leadStatus] || []).map((lead) => (
                  <div key={lead._id} className="kanban-card">
                    <div className="record-title">{getLeadName(lead)}</div>
                    <div className="record-subtitle">{lead.companyName || lead.email || 'No company'}</div>

                    <div className="record-meta" style={{ margin: '12px 0' }}>
                      <span className={`badge badge-${RATING_COLORS[lead.rating] || 'gray'}`}>{lead.rating || 'WARM'}</span>
                      <span className="badge badge-gray">{formatLabel(lead.leadSource || 'OTHER')}</span>
                      {Number(lead.expectedRevenue) > 0 && <span className="due-text done">{formatCurrency(lead.expectedRevenue)}</span>}
                    </div>

                    <select
                      className="form-input inline-select"
                      value={lead.status || 'NEW'}
                      onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                    >
                      {STATUSES.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card record-list">
          <table className="data-table tracking-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Company</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Source</th>
                <th>Expected Value</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead._id}>
                  <td>
                    <div className="record-person">
                      <div className="record-avatar">{getInitials(lead)}</div>
                      <div>
                        <div className="record-title">{getLeadName(lead)}</div>
                        <div className="record-subtitle">{lead.email || lead.phone || 'No contact info'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{lead.companyName || '-'}</td>
                  <td>
                    <select className="form-input inline-select" value={lead.status || 'NEW'} onChange={(e) => handleStatusChange(lead._id, e.target.value)}>
                      {STATUSES.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}
                    </select>
                  </td>
                  <td><span className={`badge badge-${RATING_COLORS[lead.rating] || 'gray'}`}>{lead.rating || 'WARM'}</span></td>
                  <td><span className="badge badge-gray">{formatLabel(lead.leadSource || 'OTHER')}</span></td>
                  <td>{Number(lead.expectedRevenue) > 0 ? formatCurrency(lead.expectedRevenue) : '-'}</td>
                  <td>{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 700 }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--accent-blue-glow)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-rounded">person_add</span>
                </div>
                <div>
                  <h2 className="modal-title" style={{ margin: 0 }}>Create New Lead</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Capture a new prospect in your sales pipeline.</p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                
                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>badge</span>
                  Lead Details
                </h3>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">person</span>
                      <input placeholder="Enter First Name" className="form-input" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">person</span>
                      <input placeholder="Enter Last Name" className="form-input" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <div className="form-input-with-icon">
                    <span className="material-symbols-rounded">domain</span>
                    <input placeholder="Enter Company Name" className="form-input" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                  </div>
                </div>

                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>contact_mail</span>
                  Contact Information
                </h3>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">mail</span>
                      <input placeholder="Enter Email" type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">call</span>
                      <input placeholder="Enter Phone" type="tel" className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                </div>

                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>star</span>
                  Qualification
                </h3>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">timeline</span>
                      <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        {STATUSES.map((leadStatus) => <option key={leadStatus} value={leadStatus}>{formatLabel(leadStatus)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">local_fire_department</span>
                      <select className="form-input" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
                        {RATINGS.map((rating) => <option key={rating} value={rating}>{formatLabel(rating)}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <h3 className="form-section-title">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>query_stats</span>
                  Source & Revenue
                </h3>
                <div className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Lead Source</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">campaign</span>
                      <select className="form-input" value={form.leadSource} onChange={(e) => setForm({ ...form, leadSource: e.target.value })}>
                        {SOURCES.map((source) => <option key={source} value={source}>{formatLabel(source)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expected Revenue ($)</label>
                    <div className="form-input-with-icon">
                      <span className="material-symbols-rounded">attach_money</span>
                      <input placeholder="Enter Expected Revenue" type="number" min="0" className="form-input" value={form.expectedRevenue} onChange={(e) => setForm({ ...form, expectedRevenue: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Notes</label>
                  <textarea placeholder="Enter any notes..." className="form-input" rows="3" style={{ paddingLeft: 12 }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}></textarea>
                </div>
                
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-default)', paddingTop: 16, marginTop: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <span className="material-symbols-rounded" style={{ fontSize: 18, marginRight: 6, verticalAlign: 'text-bottom' }}>check_circle</span>
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

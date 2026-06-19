const Contact = require('../models/Contact');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Task = require('../models/Task');
const Ticket = require('../models/Ticket');
const cache = require('../cache/memoryCache');

async function buildDashboardStats(ownerId) {
  const [
    contactCount,
    totalLeads,
    newLeads,
    qualifiedLeads,
    dealStats,
    pendingTasks,
    overdueTasks,
    openTickets,
  ] = await Promise.all([
    Contact.countDocuments({ ownerId }),
    Lead.countDocuments({ ownerId }),
    Lead.countDocuments({ ownerId, status: 'NEW' }),
    Lead.countDocuments({ ownerId, status: 'QUALIFIED' }),
    Deal.aggregate([
      { $match: { ownerId } },
      { $group: {
          _id: null,
          open: { $sum: { $cond: [{ $in: ['$stage', ['NEW', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'OPEN']] }, 1, 0] } },
          won: { $sum: { $cond: [{ $eq: ['$stage', 'WON'] }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ['$stage', 'LOST'] }, 1, 0] } },
          revenue: { $sum: { $cond: [{ $eq: ['$stage', 'WON'] }, '$value', 0] } },
      } },
    ]),
    Task.countDocuments({ assigneeId: ownerId, status: { $in: ['NOT_STARTED', 'IN_PROGRESS'] } }),
    Task.countDocuments({ assigneeId: ownerId, status: { $ne: 'COMPLETED' }, dueAt: { $lt: new Date() } }),
    Ticket.countDocuments({ ownerId, status: { $in: ['OPEN', 'IN_PROGRESS', 'WAITING'] } }),
  ]);

  const stats = dealStats[0] || {};
  const won = stats.won || 0;
  const lost = stats.lost || 0;
  const revenue = stats.revenue || 0;
  const openDeals = stats.open || 0;
  const winRate = won + lost > 0 ? won / (won + lost) : 0;
  const openLeads = totalLeads - (qualifiedLeads || 0);

  return {
    contactCount,
    totalLeads,
    newLeads,
    qualifiedLeads,
    openLeads,
    openDeals,
    wonDeals: won,
    lostDeals: lost,
    revenue,
    winRate,
    pendingTasks,
    overdueTasks,
    openTickets,
  };
}

exports.dashboard = async (req, res) => {
  const cacheKey = `dashboard:${req.user.id}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ data: cached, cached: true });

  const data = await buildDashboardStats(req.user.id);
  cache.set(cacheKey, data, 30000);
  res.json({ data, cached: false });
};

exports.funnel = async (req, res) => {
  const result = await Lead.aggregate([
    { $match: { ownerId: req.user.id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  res.json({ data: result });
};

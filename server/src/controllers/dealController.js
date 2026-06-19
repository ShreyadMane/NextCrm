const Deal = require('../models/Deal');
const { emitEvent } = require('../events/eventBus');

exports.list = async (req, res) => {
  const { stage } = req.query;
  const filter = { ownerId: req.user.id };
  if (stage) filter.stage = stage;
  const deals = await Deal.find(filter)
    .populate('accountId', 'name')
    .populate('contactId', 'firstName lastName')
    .populate('assignedTo', 'firstName lastName')
    .sort('-createdAt');
  res.json({ data: deals });
};

exports.create = async (req, res) => {
  const idempotencyKey = req.headers['x-idempotency-key'];
  if (!idempotencyKey) return res.status(400).json({ message: 'X-Idempotency-Key header required' });

  const existing = await Deal.findOne({ idempotencyKey });
  if (existing) return res.status(200).json({ data: existing });

  // Support both dealName and legacy title
  const body = { ...req.body, ownerId: req.user.id, idempotencyKey };
  if (!body.dealName && body.title) body.dealName = body.title;

  const deal = await Deal.create(body);
  res.status(201).json({ data: deal });
};

exports.update = async (req, res) => {
  const deal = await Deal.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.id }, req.body, { new: true }
  );
  if (!deal) return res.status(404).json({ message: 'Not found' });
  res.json({ data: deal });
};

exports.close = async (req, res) => {
  const { outcome } = req.body;
  const deal = await Deal.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.id },
    { stage: outcome, closedAt: new Date() },
    { new: true }
  );
  if (!deal) return res.status(404).json({ message: 'Not found' });

  if (outcome === 'WON') emitEvent('deal.won', { dealId: deal._id, ownerId: req.user.id, value: deal.value });
  res.json({ data: deal });
};

exports.forecast = async (req, res) => {
  const result = await Deal.aggregate([
    { $match: { stage: 'WON', ownerId: req.user.id } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$closedAt' } }, totalValue: { $sum: '$value' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ data: result });
};

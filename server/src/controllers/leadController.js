const Lead = require('../models/Lead');
const { emitEvent } = require('../events/eventBus');

exports.list = async (req, res) => {
  const { search, status, source, rating } = req.query;
  const filter = { ownerId: req.user.id };
  if (status) filter.status = status;
  if (source) filter.leadSource = source;
  if (rating) filter.rating = rating;
  if (search) filter.$text = { $search: search };

  const leads = await Lead.find(filter)
    .populate('assignedTo', 'firstName lastName')
    .sort('-createdAt');

  // Group by status for Kanban
  const grouped = leads.reduce((acc, lead) => {
    const key = lead.status || 'NEW';
    (acc[key] = acc[key] || []).push(lead);
    return acc;
  }, {});
  res.json({ data: grouped });
};

exports.create = async (req, res) => {
  const lead = await Lead.create({ ...req.body, ownerId: req.user.id });
  res.status(201).json({ data: lead });
};

exports.getOne = async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, ownerId: req.user.id })
    .populate('assignedTo', 'firstName lastName');
  if (!lead) return res.status(404).json({ message: 'Not found' });
  res.json({ data: lead });
};

exports.update = async (req, res) => {
  const lead = await Lead.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.id }, req.body, { new: true }
  );
  if (!lead) return res.status(404).json({ message: 'Not found' });

  if (req.body.status) {
    emitEvent('lead.stageChanged', { leadId: lead._id, stage: req.body.status, ownerId: req.user.id });
  }
  res.json({ data: lead });
};

exports.remove = async (req, res) => {
  await Lead.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
  res.status(204).end();
};

// Legacy compat — redirect old listByStage
exports.listByStage = exports.list;
exports.move = exports.update;

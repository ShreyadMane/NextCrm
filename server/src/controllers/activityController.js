const Activity = require('../models/Activity');
const { emitEvent } = require('../events/eventBus');

exports.list = async (req, res) => {
  const { contactId, dealId, leadId } = req.query;
  const filter = { userId: req.user.id };
  
  if (contactId) filter.contactId = contactId;
  if (dealId) filter.dealId = dealId;
  if (leadId) filter.leadId = leadId;

  const activities = await Activity.find(filter)
    .sort({ createdAt: -1 })
    .populate('contactId', 'firstName lastName')
    .populate('userId', 'firstName lastName');

  res.json({ data: activities });
};

exports.create = async (req, res) => {
  const activity = await Activity.create({ ...req.body, userId: req.user.id });
  
  // Populate to send back full details
  await activity.populate('userId', 'firstName lastName');
  
  emitEvent('activity.created', { activityId: activity._id, userId: req.user.id });
  
  res.status(201).json({ data: activity });
};

exports.deleteActivity = async (req, res) => {
  const activity = await Activity.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!activity) return res.status(404).json({ message: 'Not found' });
  
  res.json({ message: 'Activity deleted' });
};

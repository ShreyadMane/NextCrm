const Task = require('../models/Task');

const populateTask = (query) => query
  .populate('contactId', 'firstName lastName')
  .populate('leadId', 'firstName lastName title')
  .populate('dealId', 'dealName title');

exports.list = async (req, res) => {
  const { status, priority, completed } = req.query;
  const filter = { assigneeId: req.user.id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (completed === 'false') filter.status = { $ne: 'COMPLETED' };
  if (completed === 'true') filter.status = 'COMPLETED';

  const tasks = await populateTask(Task.find(filter)).sort('-createdAt');
  res.json({ data: tasks });
};

exports.create = async (req, res) => {
  const task = await Task.create({ ...req.body, assigneeId: req.user.id });
  const populatedTask = await populateTask(Task.findById(task._id));
  res.status(201).json({ data: populatedTask });
};

exports.update = async (req, res) => {
  const task = await populateTask(Task.findOneAndUpdate(
    { _id: req.params.id, assigneeId: req.user.id }, req.body, { new: true }
  ));
  if (!task) return res.status(404).json({ message: 'Not found' });
  res.json({ data: task });
};

exports.remove = async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, assigneeId: req.user.id });
  res.status(204).end();
};

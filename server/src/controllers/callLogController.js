const CallLog = require('../models/CallLog');

exports.list = async (req, res) => {
  const logs = await CallLog.find({ ownerId: req.user.id })
    .populate('contactId', 'firstName lastName')
    .sort('-callDate');
  res.json({ data: logs });
};

exports.create = async (req, res) => {
  const log = await CallLog.create({ ...req.body, ownerId: req.user.id });
  res.status(201).json({ data: log });
};

exports.update = async (req, res) => {
  const log = await CallLog.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.id }, req.body, { new: true }
  );
  if (!log) return res.status(404).json({ message: 'Not found' });
  res.json({ data: log });
};

exports.remove = async (req, res) => {
  await CallLog.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
  res.status(204).end();
};

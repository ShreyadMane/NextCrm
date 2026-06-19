const Meeting = require('../models/Meeting');

exports.list = async (req, res) => {
  const meetings = await Meeting.find({ ownerId: req.user.id })
    .populate('participants', 'firstName lastName')
    .populate('relatedContact', 'firstName lastName')
    .populate('relatedLead', 'firstName lastName')
    .populate('relatedDeal', 'dealName')
    .sort('-startDate');
  res.json({ data: meetings });
};

exports.create = async (req, res) => {
  const meeting = await Meeting.create({ ...req.body, ownerId: req.user.id });
  res.status(201).json({ data: meeting });
};

exports.update = async (req, res) => {
  const meeting = await Meeting.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.id }, req.body, { new: true }
  );
  if (!meeting) return res.status(404).json({ message: 'Not found' });
  res.json({ data: meeting });
};

exports.remove = async (req, res) => {
  await Meeting.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
  res.status(204).end();
};

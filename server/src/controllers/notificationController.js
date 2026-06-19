const Notification = require('../models/Notification');

exports.list = async (req, res) => {
  const notes = await Notification.find({ userId: req.user.id }).sort('-createdAt').limit(50);
  res.json({ data: notes });
};

exports.markRead = async (req, res) => {
  const note = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id }, { read: true }, { new: true }
  );
  if (!note) return res.status(404).json({ message: 'Not found' });
  res.json({ data: note });
};

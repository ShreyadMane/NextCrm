const Contact = require('../models/Contact');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');

exports.search = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'q is required' });

  const ownerId = req.user.id;
  const [contacts, leads, deals] = await Promise.all([
    Contact.find({ ownerId, $text: { $search: q } }).limit(10),
    Lead.find({ ownerId, title: new RegExp(q, 'i') }).limit(10),
    Deal.find({ ownerId, title: new RegExp(q, 'i') }).limit(10),
  ]);

  res.json({ data: { contacts, leads, deals } });
};

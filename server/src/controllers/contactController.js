const Contact = require('../models/Contact');

exports.list = async (req, res) => {
  const { page = 1, limit = 20, search, tags } = req.query;
  const filter = { ownerId: req.user.id };
  if (tags) filter.tags = { $in: tags.split(',') };
  if (search) filter.$text = { $search: search };

  const [items, total] = await Promise.all([
    Contact.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort('-createdAt').populate('companyId', 'name'),
    Contact.countDocuments(filter),
  ]);
  res.json({ data: items, meta: { total, page: Number(page), limit: Number(limit) } });
};

exports.getOne = async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, ownerId: req.user.id })
    .populate('companyId', 'name');
  if (!contact) return res.status(404).json({ message: 'Not found' });
  res.json({ data: contact });
};

exports.create = async (req, res) => {
  const contact = await Contact.create({ ...req.body, ownerId: req.user.id });
  res.status(201).json({ data: contact });
};

exports.update = async (req, res) => {
  const contact = await Contact.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.id }, req.body, { new: true }
  );
  if (!contact) return res.status(404).json({ message: 'Not found' });
  res.json({ data: contact });
};

exports.remove = async (req, res) => {
  await Contact.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
  res.status(204).end();
};

const Company = require('../models/Company');
const Contact = require('../models/Contact');
const catchAsync = require('../utils/catchAsync');

exports.list = catchAsync(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = { ownerId: req.user.id };
  if (search) filter.$text = { $search: search };

  const total = await Company.countDocuments(filter);
  const companies = await Company.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ data: companies, meta: { total, page: Number(page), limit: Number(limit) } });
});

exports.getOne = catchAsync(async (req, res) => {
  const company = await Company.findOne({ _id: req.params.id, ownerId: req.user.id });
  if (!company) return res.status(404).json({ message: 'Not found' });

  const contacts = await Contact.find({ companyId: company._id });
  res.json({ data: { ...company.toObject(), contacts } });
});

exports.create = catchAsync(async (req, res) => {
  const company = await Company.create({ ...req.body, ownerId: req.user.id });
  res.status(201).json({ data: company });
});

exports.update = catchAsync(async (req, res) => {
  const company = await Company.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.id },
    req.body,
    { new: true }
  );
  if (!company) return res.status(404).json({ message: 'Not found' });
  res.json({ data: company });
});

exports.remove = catchAsync(async (req, res) => {
  const company = await Company.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
  if (!company) return res.status(404).json({ message: 'Not found' });
  // Unlink contacts
  await Contact.updateMany({ companyId: company._id }, { $unset: { companyId: '' } });
  res.json({ message: 'Deleted' });
});

const Quotation = require('../models/Quotation');

function calcTotals(items, taxRate = 0) {
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const tax = subtotal * (taxRate / 100);
  return { subtotal, tax, total: subtotal + tax };
}

exports.list = async (req, res) => {
  const quotations = await Quotation.find({ ownerId: req.user.id })
    .sort({ createdAt: -1 })
    .populate('contactId', 'firstName lastName')
    .populate('companyId', 'name');
  res.json({ data: quotations });
};

exports.create = async (req, res) => {
  const { items = [], taxRate = 0, ...rest } = req.body;
  const totals = calcTotals(items, taxRate);
  const count = await Quotation.countDocuments();
  const quotationNumber = `QUO-${String(count + 1).padStart(5, '0')}`;
  const quotation = await Quotation.create({ ...rest, items, ...totals, quotationNumber, ownerId: req.user.id });
  res.status(201).json({ data: quotation });
};

exports.update = async (req, res) => {
  const { items, taxRate = 0, ...rest } = req.body;
  const update = { ...rest };
  if (items) {
    const totals = calcTotals(items, taxRate);
    Object.assign(update, { items, ...totals });
  }
  const quotation = await Quotation.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.id },
    update,
    { new: true }
  );
  if (!quotation) return res.status(404).json({ message: 'Not found' });
  res.json({ data: quotation });
};

exports.remove = async (req, res) => {
  const q = await Quotation.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
  if (!q) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
};

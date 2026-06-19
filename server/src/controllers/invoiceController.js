const Invoice = require('../models/Invoice');
const Quotation = require('../models/Quotation');

exports.list = async (req, res) => {
  const invoices = await Invoice.find({ ownerId: req.user.id })
    .sort({ createdAt: -1 })
    .populate('contactId', 'firstName lastName')
    .populate('companyId', 'name');
  res.json({ data: invoices });
};

exports.create = async (req, res) => {
  const { items = [], taxRate = 0, ...rest } = req.body;
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  const count = await Invoice.countDocuments();
  const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;
  const invoice = await Invoice.create({ ...rest, items, subtotal, tax, total, invoiceNumber, ownerId: req.user.id });
  res.status(201).json({ data: invoice });
};

// Create invoice from an accepted quotation
exports.createFromQuotation = async (req, res) => {
  const quotation = await Quotation.findOne({ _id: req.params.quotationId, ownerId: req.user.id });
  if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

  const count = await Invoice.countDocuments();
  const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;
  const invoice = await Invoice.create({
    invoiceNumber,
    quotationId: quotation._id,
    contactId: quotation.contactId,
    companyId: quotation.companyId,
    dealId: quotation.dealId,
    ownerId: req.user.id,
    items: quotation.items,
    subtotal: quotation.subtotal,
    tax: quotation.tax,
    total: quotation.total,
    dueDate: req.body.dueDate,
    notes: req.body.notes,
  });
  res.status(201).json({ data: invoice });
};

exports.update = async (req, res) => {
  const invoice = await Invoice.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.id },
    req.body,
    { new: true }
  );
  if (!invoice) return res.status(404).json({ message: 'Not found' });
  res.json({ data: invoice });
};

exports.remove = async (req, res) => {
  const inv = await Invoice.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
  if (!inv) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
};

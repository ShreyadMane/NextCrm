const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
  contactId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  companyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  dealId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  ownerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    description: { type: String, required: true },
    quantity:    { type: Number, required: true, default: 1 },
    unitPrice:   { type: Number, required: true },
    discount:    { type: Number, default: 0 },
    tax:         { type: Number, default: 0 },
    total:       { type: Number, default: 0 },
  }],
  subtotal:      { type: Number, default: 0 },
  discount:      { type: Number, default: 0 },
  tax:           { type: Number, default: 0 },
  total:         { type: Number, default: 0 },
  paidAmount:    { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 },
  status:        { type: String, enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'], default: 'DRAFT' },
  dueDate:       { type: Date },
  paidAt:        { type: Date },
  notes:         { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);

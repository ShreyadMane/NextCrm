const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity:    { type: Number, required: true, default: 1 },
  unitPrice:   { type: Number, required: true },
  discount:    { type: Number, default: 0 },
  tax:         { type: Number, default: 0 },
  total:       { type: Number, default: 0 },
});

const quotationSchema = new mongoose.Schema({
  quotationNumber: { type: String, required: true, unique: true },
  contactId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  companyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  dealId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  ownerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:      [lineItemSchema],
  subtotal:   { type: Number, default: 0 },
  discount:   { type: Number, default: 0 },
  tax:        { type: Number, default: 0 },
  total:      { type: Number, default: 0 },
  quoteDate:  { type: Date, default: Date.now },
  validUntil: { type: Date },
  status:     { type: String, enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'], default: 'DRAFT' },
  notes:      { type: String },
  // Legacy compat
  taxRate:    { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Quotation', quotationSchema);

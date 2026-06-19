const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name:            { type: String, required: true },
  industry:        { type: String, enum: ['TECHNOLOGY', 'HEALTHCARE', 'FINANCE', 'EDUCATION', 'MANUFACTURING', 'RETAIL', 'REAL_ESTATE', 'CONSULTING', 'OTHER'], default: 'OTHER' },
  website:         { type: String },
  phone:           { type: String },
  email:           { type: String },
  employeeCount:   { type: Number, default: 0 },
  annualRevenue:   { type: Number, default: 0 },
  billingAddress:  { type: String },
  shippingAddress: { type: String },
  gstVatNumber:    { type: String },
  description:     { type: String },
  ownerId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Legacy compat
  address:  { type: String },
  city:     { type: String },
  country:  { type: String },
  size:     { type: String },
}, { timestamps: true });

companySchema.index({ name: 'text' });

module.exports = mongoose.model('Company', companySchema);

const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  firstName:      { type: String, required: true },
  lastName:       { type: String, required: true },
  companyName:    { type: String },
  email:          { type: String },
  phone:          { type: String },
  alternatePhone: { type: String },
  website:        { type: String },
  leadSource:     { type: String, enum: ['WEBSITE', 'REFERRAL', 'COLD_CALL', 'SOCIAL_MEDIA', 'ADVERTISEMENT', 'TRADE_SHOW', 'EMAIL_CAMPAIGN', 'OTHER'], default: 'WEBSITE' },
  industry:       { type: String, enum: ['TECHNOLOGY', 'HEALTHCARE', 'FINANCE', 'EDUCATION', 'MANUFACTURING', 'RETAIL', 'REAL_ESTATE', 'CONSULTING', 'OTHER'], default: 'OTHER' },
  status:         { type: String, enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'], default: 'NEW' },
  rating:         { type: String, enum: ['HOT', 'WARM', 'COLD'], default: 'WARM' },
  assignedTo:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expectedRevenue: { type: Number, default: 0 },
  address:        { type: String },
  city:           { type: String },
  state:          { type: String },
  country:        { type: String },
  notes:          { type: String },
  lastActivityDate: { type: Date },
  ownerId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Legacy compat
  title:          { type: String },
  contactId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  stage:          { type: String },
  estimatedValue: { type: Number },
  source:         { type: String },
}, { timestamps: true });

leadSchema.index({ firstName: 'text', lastName: 'text', companyName: 'text', email: 'text' });

module.exports = mongoose.model('Lead', leadSchema);

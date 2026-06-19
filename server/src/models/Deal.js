const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  dealName:          { type: String, required: true },
  accountId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  contactId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  stage:             { type: String, enum: ['NEW', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST', 'OPEN'], default: 'NEW' },
  value:             { type: Number, required: true },
  probability:       { type: Number, min: 0, max: 100, default: 50 },
  expectedCloseDate: { type: Date },
  source:            { type: String, enum: ['WEBSITE', 'REFERRAL', 'COLD_CALL', 'SOCIAL_MEDIA', 'ADVERTISEMENT', 'TRADE_SHOW', 'EMAIL_CAMPAIGN', 'OTHER'] },
  assignedTo:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:             { type: String },
  closedAt:          { type: Date },
  ownerId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  idempotencyKey:    { type: String, unique: true, sparse: true },
  // Legacy compat
  title:             { type: String },
  leadId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);

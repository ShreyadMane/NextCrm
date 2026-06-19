const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, unique: true, sparse: true },
  subject:      { type: String, required: true },
  description:  { type: String },
  status:       { type: String, enum: ['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  priority:     { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  category:     { type: String, enum: ['BILLING', 'TECHNICAL', 'GENERAL', 'FEATURE_REQUEST', 'BUG', 'OTHER'], default: 'GENERAL' },
  customerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  assignedTo:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Legacy compat
  title:        { type: String },
  contactId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  companyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);

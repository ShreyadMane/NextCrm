const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  priority:    { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  status:      { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DEFERRED'], default: 'NOT_STARTED' },
  dueAt:       { type: Date },
  assigneeId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contactId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  leadId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  dealId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  // Legacy compat
  completed:   { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);

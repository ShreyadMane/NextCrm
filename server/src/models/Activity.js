const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: { type: String, enum: ['CALL', 'EMAIL', 'MEETING', 'NOTE'], required: true },
  notes: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);

const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  subject:   { type: String, required: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  callDate:  { type: Date, default: Date.now },
  duration:  { type: Number, default: 0 }, // minutes
  outcome:   { type: String, enum: ['CONNECTED', 'NO_ANSWER', 'VOICEMAIL', 'BUSY', 'WRONG_NUMBER', 'FOLLOW_UP', 'OTHER'], default: 'CONNECTED' },
  notes:     { type: String },
  ownerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('CallLog', callLogSchema);

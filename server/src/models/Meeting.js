const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  startDate:      { type: Date, required: true },
  endDate:        { type: Date, required: true },
  participants:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  location:       { type: String },
  notes:          { type: String },
  relatedContact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  relatedLead:    { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  relatedDeal:    { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  ownerId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);

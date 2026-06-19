const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  firstName:    { type: String, required: true },
  lastName:     { type: String, required: true },
  email:        { type: String },
  phone:        { type: String },
  mobile:       { type: String },
  jobTitle:     { type: String },
  department:   { type: String },
  companyName:  { type: String },
  companyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  address:      { type: String },
  socialProfiles: { type: String },
  notes:        { type: String },
  tags:         [{ type: String }],
  ownerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

contactSchema.index({ firstName: 'text', lastName: 'text', email: 'text', companyName: 'text' });

module.exports = mongoose.model('Contact', contactSchema);

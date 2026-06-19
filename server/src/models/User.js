const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName:        { type: String, required: true },
  lastName:         { type: String, required: true },
  email:            { type: String, required: true, unique: true, lowercase: true },
  passwordHash:     { type: String, required: true },
  role:             { type: String, enum: ['ADMIN', 'MANAGER', 'SALES', 'VIEWER'], default: 'SALES' },
  refreshTokenHash: { type: String, default: null },
  employeeId:       { type: String },
  phone:            { type: String },
  department:       { type: String, enum: ['SALES', 'MARKETING', 'SUPPORT', 'ENGINEERING', 'HR', 'FINANCE', 'OPERATIONS', 'OTHER'], default: 'SALES' },
  designation:      { type: String },
  status:           { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

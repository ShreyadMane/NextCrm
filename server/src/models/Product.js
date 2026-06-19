const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productCode: { type: String, required: true },
  productName: { type: String, required: true },
  category:    { type: String, enum: ['SOFTWARE', 'HARDWARE', 'SERVICE', 'SUBSCRIPTION', 'CONSULTING', 'OTHER'], default: 'OTHER' },
  description: { type: String },
  unitPrice:   { type: Number, required: true, default: 0 },
  tax:         { type: Number, default: 0 }, // percentage
  status:      { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  ownerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

productSchema.index({ productName: 'text', productCode: 'text' });

module.exports = mongoose.model('Product', productSchema);

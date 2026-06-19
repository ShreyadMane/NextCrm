const Product = require('../models/Product');

exports.list = async (req, res) => {
  const { status, category, search } = req.query;
  const filter = { ownerId: req.user.id };
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };

  const products = await Product.find(filter).sort('-createdAt');
  res.json({ data: products });
};

exports.create = async (req, res) => {
  const product = await Product.create({ ...req.body, ownerId: req.user.id });
  res.status(201).json({ data: product });
};

exports.update = async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.id }, req.body, { new: true }
  );
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json({ data: product });
};

exports.remove = async (req, res) => {
  await Product.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
  res.status(204).end();
};

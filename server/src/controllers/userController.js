const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.list = async (req, res) => {
  const users = await User.find().select('-passwordHash -refreshTokenHash');
  res.json({ data: users });
};

exports.create = async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already in use' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash, firstName, lastName, role });
  const { passwordHash: _, refreshTokenHash: __, ...userData } = user.toObject();
  res.status(201).json({ data: userData });
};

exports.update = async (req, res) => {
  const { password, ...rest } = req.body;
  if (password) rest.passwordHash = await bcrypt.hash(password, 12);

  const user = await User.findByIdAndUpdate(req.params.id, rest, { new: true })
    .select('-passwordHash -refreshTokenHash');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ data: user });
};

exports.remove = async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ message: 'Cannot delete yourself' });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User deleted' });
};

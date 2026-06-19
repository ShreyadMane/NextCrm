const Ticket = require('../models/Ticket');

async function getNextTicketNumber() {
  const last = await Ticket.findOne().sort('-createdAt').select('ticketNumber');
  if (!last || !last.ticketNumber) return 'TKT-00001';
  const num = parseInt(last.ticketNumber.replace('TKT-', ''), 10) + 1;
  return `TKT-${String(num).padStart(5, '0')}`;
}

exports.list = async (req, res) => {
  const { status, priority, category } = req.query;
  const filter = { ownerId: req.user.id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;

  const tickets = await Ticket.find(filter)
    .populate('customerId', 'firstName lastName')
    .populate('assignedTo', 'firstName lastName')
    .sort('-createdAt');
  res.json({ data: tickets });
};

exports.create = async (req, res) => {
  const ticketNumber = await getNextTicketNumber();
  // Support both subject and legacy title
  const body = { ...req.body, ownerId: req.user.id, ticketNumber };
  if (!body.subject && body.title) body.subject = body.title;
  const ticket = await Ticket.create(body);
  res.status(201).json({ data: ticket });
};

exports.update = async (req, res) => {
  const ticket = await Ticket.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.id }, req.body, { new: true }
  );
  if (!ticket) return res.status(404).json({ message: 'Not found' });
  res.json({ data: ticket });
};

exports.remove = async (req, res) => {
  await Ticket.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
  res.status(204).end();
};

const { onEvent } = require('./eventBus');
const Notification = require('../models/Notification');
const cache = require('../cache/memoryCache');
const { io } = require('../realtime/socket');

onEvent('deal.won', async ({ dealId, ownerId, value }) => {
  const note = await Notification.create({
    userId: ownerId, type: 'DEAL_WON', message: `Deal ${dealId} closed for $${value}`,
  });
  if (io) io.to(`user:${ownerId}`).emit('notification', note);
  cache.invalidate('dashboard:');
});

onEvent('lead.stageChanged', async ({ leadId, stage, ownerId }) => {
  if (io) io.to(`user:${ownerId}`).emit('lead:updated', { leadId, stage });
});

const { EventEmitter } = require('events');
const bus = new EventEmitter();

function emitEvent(name, payload) {
  bus.emit(name, payload);
}
function onEvent(name, handler) {
  bus.on(name, async (payload) => {
    try {
      await handler(payload);
    } catch (err) {
      console.error(`Listener for ${name} failed:`, err.message);
    }
  });
}

module.exports = { emitEvent, onEvent };

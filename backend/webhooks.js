const { EventEmitter } = require('events');

const webhookUrls = [];
const sseEmitter = new EventEmitter();
sseEmitter.setMaxListeners(0);

function registerWebhook(url) {
  webhookUrls.push(url);
}

function removeWebhook(url) {
  const idx = webhookUrls.indexOf(url);
  if (idx !== -1) {
    webhookUrls.splice(idx, 1);
  }
}

function getWebhooks() {
  return [...webhookUrls];
}

function addSSEListener(fn) {
  sseEmitter.on('task', fn);
}

function removeSSEListener(fn) {
  sseEmitter.off('task', fn);
}

function notifyWebhooks(payload) {
  for (const url of webhookUrls) {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }
  sseEmitter.emit('task', payload);
}

module.exports = {
  registerWebhook,
  removeWebhook,
  getWebhooks,
  notifyWebhooks,
  addSSEListener,
  removeSSEListener,
};

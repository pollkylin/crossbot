/**
 * CrossBot — Vercel Serverless Entry
 * All requests forwarded to Fastify app
 */
const { createApp } = require('../server/app');

// Cache app instance across cold starts
let appPromise;

async function getApp() {
  if (!appPromise) {
    const app = createApp();
    appPromise = app.ready().then(() => app);
  }
  return appPromise;
}

module.exports = async function handler(req, res) {
  const app = await getApp();
  app.server.emit('request', req, res);
};

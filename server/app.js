/**
 * CrossBot Server — Fastify App (shared by local dev & Vercel)
 */

const Fastify = require('fastify');
const cors = require('@fastify/cors');
const { matchTemplate } = require('./templates');
const { askAI } = require('./ai');
const { lookupTracking } = require('./tracking');

function createApp() {
  const fastify = Fastify({ logger: false });

  fastify.register(cors, { origin: true, methods: ['GET', 'POST'] });

  const conversations = new Map();

  fastify.post('/api/chat', async (req, reply) => {
    const { message, sessionId } = req.body || {};
    if (!message || !sessionId) {
      return reply.status(400).send({ error: 'message and sessionId required' });
    }

    const userMessage = String(message).trim();
    const templateResult = matchTemplate(userMessage);

    if (templateResult.hit) {
      if (templateResult.action === 'track' && templateResult.trackingNumber) {
        const trackResult = await lookupTracking(templateResult.trackingNumber);
        saveConversation(conversations, sessionId, userMessage, trackResult.message);
        return reply.send({
          reply: trackResult.message,
          source: 'template',
          handler: 'tracking',
          ...trackResult,
        });
      }

      saveConversation(conversations, sessionId, userMessage, templateResult.reply);
      return reply.send({
        reply: templateResult.reply,
        source: 'template',
        handler: templateResult.action || 'template',
      });
    }

    const history = conversations.get(sessionId) || [];
    const aiReply = await askAI(userMessage, history);
    saveConversation(conversations, sessionId, userMessage, aiReply);

    return reply.send({
      reply: aiReply,
      source: 'ai',
      handler: 'ai',
    });
  });

  fastify.get('/api/health', async () => ({
    status: 'ok',
    provider: process.env.AI_PROVIDER || 'deepseek',
    model: process.env.AI_MODEL || 'deepseek-chat',
    uptime: process.uptime(),
  }));

  fastify.get('/api/widget', async (req, reply) => {
    reply.header('Content-Type', 'application/javascript');
    const fs = require('fs');
    const path = require('path');
    const widgetPath = path.join(__dirname, '..', 'widget', 'crossbot.js');
    return fs.readFileSync(widgetPath, 'utf-8');
  });

  return fastify;
}

function saveConversation(conversations, sessionId, userMsg, botReply) {
  if (!conversations.has(sessionId)) conversations.set(sessionId, []);
  const history = conversations.get(sessionId);
  history.push({ role: 'user', content: userMsg });
  history.push({ role: 'assistant', content: botReply });
  if (history.length > 60) history.splice(0, history.length - 60);
}

module.exports = { createApp };

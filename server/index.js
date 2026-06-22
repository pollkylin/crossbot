/**
 * CrossBot Server — Local Dev Entry
 * 启动: node index.js  (默认端口 3456)
 */
const { createApp } = require('./app');
const PORT = process.env.PORT || 3456;

async function start() {
  const app = createApp();
  await app.listen({ port: PORT, host: '0.0.0.0' });
  const { RULES } = require('./templates');
  console.log(`🐾 CrossBot running on http://0.0.0.0:${PORT}`);
  console.log(`   AI Provider: ${process.env.AI_PROVIDER || 'deepseek'}`);
  console.log(`   Templates: ${RULES.length} rules loaded`);
}

start().catch(err => { console.error(err); process.exit(1); });

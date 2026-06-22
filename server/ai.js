/**
 * CrossBot AI Module — DeepSeek API (可随时切 GPT/Claude)
 * 只在模板未命中时调用
 */

const AI_CONFIG = {
  // 默认 DeepSeek，一行改 OpenAI
  provider: process.env.AI_PROVIDER || 'deepseek',
  apiKey: process.env.AI_API_KEY || '',
  baseURL: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1',
  model: process.env.AI_MODEL || 'deepseek-chat',
  maxTokens: 300,
  temperature: 0.6,
};

// 系统提示词：限定客服角色
const SYSTEM_PROMPT = `You are a friendly customer service assistant for Obi Pet Hall, a US-based pet supplies dropshipping store.

Rules:
- Keep replies under 3 sentences, concise and warm
- Use simple English, 8th-grade reading level
- Always be helpful, never argue
- Don't make up prices, shipping times, or policies — say "Let me check that for you"
- If the customer is angry, apologize first, then solve
- End with a helpful question or call-to-action
- Use emojis sparingly (1-2 max per reply)

Store info:
- Ships from US warehouse, 3-7 business days delivery
- Free shipping on US orders over $35
- 30-day return policy
- Accepts Visa, Mastercard, Amex, PayPal, Shop Pay`;

async function askAI(userMessage, conversationHistory = []) {
  if (!AI_CONFIG.apiKey) {
    return "I'm sorry, I'm having trouble connecting right now. Please email support@obipethall.com or message us on WhatsApp and we'll get back to you within 2 hours! 🙏";
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory.slice(-6), // 保留最近3轮对话
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await fetch(`${AI_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages,
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status, await response.text());
      return "I'm having a little trouble right now. Could you rephrase your question, or email support@obipethall.com? 💛";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || fallbackReply();
  } catch (err) {
    console.error('AI call failed:', err.message);
    return fallbackReply();
  }
}

function fallbackReply() {
  return "I want to make sure I give you the right answer! Could you try asking in a different way, or reach us at support@obipethall.com? 💛";
}

module.exports = { askAI, AI_CONFIG };

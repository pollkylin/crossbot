/**
 * CrossBot Template Engine
 * 模板命中 → 直接回复 | 模板未命中 → 调用AI
 */

// ============================================================
// 1. 关键词匹配规则
// ============================================================
const RULES = [
  // --- 物流追踪 ---
  {
    keywords: ['track', 'tracking', 'where is my order', 'shipping status', 'package', 'delivery status', '物流', '快递', '在哪'],
    handler: 'handleTracking',
  },
  // --- 退货退款 ---
  {
    keywords: ['return', 'refund', 'money back', 'send back', 'exchange', '退货', '退款', '换货'],
    handler: 'handleReturn',
  },
  // --- 发货时间 ---
  {
    keywords: ['shipping time', 'how long', 'delivery time', 'when will', 'arrive', 'estimate', '多久到', '发货时间'],
    handler: 'handleShippingTime',
  },
  // --- 运费 ---
  {
    keywords: ['shipping cost', 'free shipping', 'shipping fee', 'how much shipping', '运费', '包邮'],
    handler: 'handleShippingCost',
  },
  // --- 支付问题 ---
  {
    keywords: ['payment', 'pay', 'credit card', 'paypal', 'checkout', 'charge', 'billing', '支付', '付款'],
    handler: 'handlePayment',
  },
  // --- 订单状态 ---
  {
    keywords: ['order status', 'my order', 'order number', 'confirm', 'cancel order', '订单', '取消'],
    handler: 'handleOrderStatus',
  },
  // --- 产品尺寸 ---
  {
    keywords: ['size', 'dimension', 'measurement', 'how big', 'weight', '尺码', '尺寸', '大小', '重量'],
    handler: 'handleProductSize',
  },
  // --- 产品材质 ---
  {
    keywords: ['material', 'made of', 'fabric', 'plastic', 'silicone', 'what is it made', '材质', '材料'],
    handler: 'handleMaterial',
  },
  // --- 宠物安全 ---
  {
    keywords: ['safe', 'safety', 'non-toxic', 'toxic', 'pet friendly', 'harmful', 'chew', 'bite', '安全', '有毒'],
    handler: 'handleSafety',
  },
  // --- 折扣/优惠 ---
  {
    keywords: ['discount', 'coupon', 'promo', 'code', 'deal', 'sale', 'cheaper', '优惠', '折扣', '促销'],
    handler: 'handleDiscount',
  },
  // --- 批发/B2B ---
  {
    keywords: ['wholesale', 'bulk', 'lot', 'reseller', '批发', '大量'],
    handler: 'handleWholesale',
  },
  // --- 保修 ---
  {
    keywords: ['warranty', 'guarantee', 'broken', 'damaged', 'defect', 'not working', '保修', '坏了', '质量问题'],
    handler: 'handleWarranty',
  },
  // --- 联系人工 ---
  {
    keywords: ['human', 'real person', 'agent', 'support team', 'talk to', 'speak to', '人工', '客服'],
    handler: 'handleHumanSupport',
  },
  // --- 问候 ---
  {
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good evening', '你好', '在吗', '嗨'],
    handler: 'handleGreeting',
  },
  // --- 感谢/告别 ---
  {
    keywords: ['thank', 'thanks', 'bye', 'goodbye', 'see you', '谢谢', '感谢', '再见'],
    handler: 'handleFarewell',
  },
];

// ============================================================
// 2. 模板回复（英文为主 + 中文兜底）
// ============================================================

const TEMPLATES = {
  handleTracking: (input, context) => {
    // 检查是否有物流单号
    const tnMatch = input.match(/([A-Z0-9]{10,30}|[0-9]{10,20})/i);
    if (tnMatch) {
      const tn = tnMatch[1];
      return {
        hit: true,
        reply: `🔍 **Tracking #${tn}**\n\nI'm checking your package for you. Shipping typically takes **3-7 business days** from our US warehouse.\n\nYou can also track it here:\n👉 https://www.17track.net/en/track?nums=${tn}\n\nExpected delivery is usually within **5-10 days** after shipping. If it's been longer than that, let me know and I'll escalate it for you.`,
        action: 'track',
        trackingNumber: tn,
      };
    }
    return {
      hit: true,
      reply: `📦 **Shipping & Delivery**\n\n• **Processing time**: 1-2 business days\n• **Shipping time**: 3-7 business days (US)\n• **Total**: Usually 5-10 business days\n\nAll orders ship from our US warehouse with tracking. Once shipped, you'll receive a tracking number by email.\n\nPlease reply with your **tracking number** and I can check the status for you!`,
    };
  },

  handleReturn: () => ({
    hit: true,
    reply: `🔄 **Returns & Refunds**\n\nWe offer a **30-day return policy** on all products.\n\n**How to return:**\n1️⃣ Reply with your order number\n2️⃣ I'll send you a prepaid return label within 2 hours\n3️⃣ Drop off at any USPS location\n4️⃣ Refund issued within **3 business days** after we receive the item\n\n**Keep it instead?** We can also offer a **30% partial refund** and you keep the product — no shipping hassle!\n\nWhich option works better for you?`,
  }),

  handleShippingTime: () => ({
    hit: true,
    reply: `⏱️ **Shipping Times**\n\n🇺🇸 **United States**: 3-7 business days\n🇨🇦 **Canada**: 7-14 business days\n🇬🇧 **UK/Europe**: 7-14 business days\n🇦🇺 **Australia**: 10-20 business days\n🌍 **Rest of World**: 14-28 business days\n\nAll orders ship from our **US warehouse**. Processing takes 1-2 business days before shipment.\n\nWould you like to know the shipping cost for a specific product?`,
  }),

  handleShippingCost: () => ({
    hit: true,
    reply: `💰 **Shipping Costs**\n\n🎉 **Free shipping** on all US orders over **$35**!\n\nStandard US shipping: **$4.99**\nExpress US shipping: **$12.99**\nInternational: Calculated at checkout based on location\n\nPrices shown at checkout before you pay, so no surprises! 😊`,
  }),

  handlePayment: () => ({
    hit: true,
    reply: `💳 **Payment Methods**\n\nWe accept:\n• Visa / Mastercard / American Express\n• PayPal\n• Shop Pay\n• Apple Pay / Google Pay\n\nAll payments are **SSL encrypted** and secure. Your card information is never stored on our servers.\n\n❗ Having trouble at checkout? Let me know what error you're seeing and I'll help!`,
  }),

  handleOrderStatus: (input) => {
    const orderMatch = input.match(/#?(\d{4,8})/);
    const orderRef = orderMatch ? ` #${orderMatch[1]}` : '';
    return {
      hit: true,
      reply: `📋 **Order${orderRef} Status**\n\nYour order goes through 3 stages:\n🔄 **Processing** (1-2 days) → 📦 **Shipped** (tracking emailed) → ✅ **Delivered**\n\nPlease share your **order number** and I can look up the exact status for you.\n\n💡 **Need to cancel?** Orders can be cancelled within 2 hours of placing. Reply with your order number and I'll process it right away.`,
    };
  },

  handleProductSize: () => ({
    hit: true,
    reply: `📏 **Product Sizing**\n\nI'd love to help you find the right size! Could you tell me which product you're looking at?\n\nFor most of our pet products:\n• **Small**: Cats & small dogs (under 10 lbs)\n• **Medium**: Medium dogs (10-30 lbs)\n• **Large**: Large dogs (30-60 lbs)\n• **XL**: Extra large dogs (60+ lbs)\n\nEach product page also has a detailed size chart in the description. 📐`,
  }),

  handleMaterial: () => ({
    hit: true,
    reply: `🧪 **Materials & Quality**\n\nOur products are made from **pet-safe materials** — non-toxic, BPA-free, and designed with your pet's safety in mind.\n\nFor specific material details, each product page includes a full description. If you have a specific product in mind, tell me the name and I'll give you the details!`,
  }),

  handleSafety: () => ({
    hit: true,
    reply: `🛡️ **Pet Safety**\n\nYour pet's safety is our #1 priority! All our products:\n\n✅ Use **non-toxic, BPA-free** materials\n✅ Meet US safety standards\n✅ Are tested for durability and pet-safe use\n\n⚠️ **Always supervise** your pet when introducing a new product, especially chewable items.\n\nHave a specific safety concern about a product? Let me know which one! 🐾`,
  }),

  handleDiscount: () => ({
    hit: true,
    reply: `🎁 **Discounts & Deals**\n\nHere's what we currently offer:\n\n🔥 **First order**: Use code **WELCOME10** for 10% off\n📦 **2+ items**: 15% off when you buy 2 or more\n✈️ **Free shipping** on US orders over $35\n\nSign up for our newsletter to get notified about flash sales and exclusive deals!\n\nAnything else I can help with? 😊`,
  }),

  handleWholesale: () => ({
    hit: true,
    reply: `🏪 **Wholesale & Bulk Orders**\n\nWe do offer wholesale pricing for bulk orders!\n\n📦 **Minimum order**: 50 units\n💰 **Discount**: 20-40% off retail price (varies by product)\n\nPlease email **wholesale@obipethall.com** with:\n• Product(s) you're interested in\n• Quantity needed\n• Your location\n\nOur team will get back within 24 hours with a quote.`,
  }),

  handleWarranty: (input) => {
    const hasDefect = /broke|damaged|defect|not work|arrived broke|质量问题|坏了/i.test(input);
    if (hasDefect) {
      return {
        hit: true,
        reply: `😟 **Oh no! Sorry about that.**\n\nIf your item arrived damaged or defective, we'll make it right:\n\n1️⃣ Reply with your **order number**\n2️⃣ Attach a photo of the issue if possible\n3️⃣ I'll send a **free replacement** or **full refund** — your choice\n\nNo return needed for damaged items. We'll take care of everything within 24 hours.\n\nAgain, really sorry about this! 🙏`,
      };
    }
    return {
      hit: true,
      reply: `✅ **Warranty Information**\n\nAll products come with a **90-day warranty** against manufacturing defects.\n\n📌 If your product has an issue:\n• Reply with your order number\n• Describe the problem\n• We'll replace it for free\n\nNormal wear and tear is not covered. Pet damage from chewing/scratching is also not covered (but let us know — we may offer a discount on a replacement!).`,
    };
  },

  handleHumanSupport: () => ({
    hit: true,
    reply: `👋 **I'll connect you with a human!**\n\nFor complex issues, you can reach our support team at:\n\n📱 **WhatsApp**: +44 XXXX XXXXXX\n📧 **Email**: support@obipethall.com\n\nWe typically respond within **2-4 hours** during business hours.\n\nOr if you prefer, tell me your issue here and I'll do my best to help — I can solve most problems instantly! 😊`,
    action: 'escalate',
  }),

  handleGreeting: () => ({
    hit: true,
    reply: `🐾 **Welcome to Obi Pet Hall!** 🐾\n\nI'm your pet care assistant. I can help with:\n📦 Order tracking & shipping\n🔄 Returns & refunds\n📏 Product sizing & details\n💳 Payment questions\n\nJust ask away — how can I help you today? 😊`,
  }),

  handleFarewell: () => ({
    hit: true,
    reply: `You're welcome! 🐾\n\nIf you need anything else, I'm always here. Give your furry friend a belly rub from us! 😊\n\nHappy shopping! 🛒`,
  }),
};

// ============================================================
// 3. 匹配引擎
// ============================================================

function matchTemplate(message) {
  const input = message.toLowerCase().trim();

  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (keywordMatch(input, kw)) {
        return TEMPLATES[rule.handler](message, {});
      }
    }
  }

  // 无匹配 → 需要AI
  return { hit: false, reply: null };
}

// 智能匹配: 英文用词边界（hi不命中this），中文用子串（物流命中查物流）
function keywordMatch(text, keyword) {
  const isChinese = /[\u4e00-\u9fff]/.test(keyword);
  if (isChinese) {
    return text.includes(keyword.toLowerCase());
  }
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('\\b' + escaped + '\\b', 'i').test(text);
}

module.exports = { matchTemplate, RULES };

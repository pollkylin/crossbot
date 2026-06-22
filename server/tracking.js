/**
 * CrossBot Tracking Module — 17track 物流查询
 * 免费额度: 100次/月 (17track API) | 可随时升级
 */

const TRACKING_CONFIG = {
  apiKey: process.env.TRACK17_API_KEY || '',
  baseURL: 'https://api.17track.net/track/v2.2',
};

async function lookupTracking(trackingNumber) {
  // 没有 API Key → 给链接让用户自己查
  if (!TRACKING_CONFIG.apiKey) {
    return {
      mode: 'link',
      trackingNumber,
      url: `https://www.17track.net/en/track?nums=${trackingNumber}`,
      message: `🔍 Track your package here:\n👉 https://www.17track.net/en/track?nums=${trackingNumber}\n\nIt may take a moment for the latest status to load.`,
    };
  }

  try {
    const response = await fetch(`${TRACKING_CONFIG.baseURL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        '17token': TRACKING_CONFIG.apiKey,
      },
      body: JSON.stringify([{ number: trackingNumber }]),
    });

    if (!response.ok) {
      return fallbackLink(trackingNumber);
    }

    const data = await response.json();
    const track = data.data?.accepted?.[0]?.track;

    if (!track) {
      return {
        mode: 'pending',
        trackingNumber,
        message: `📦 Tracking #${trackingNumber} has been registered. It may take 24-48 hours for the first scan to appear.\n\nCheck here for updates:\n👉 https://www.17track.net/en/track?nums=${trackingNumber}`,
      };
    }

    const latest = track.e || track.z2 || track.z1 || track.z0;
    const statusMap = {
      0: '📋 Info Received',
      1: '🚚 In Transit',
      2: '⚠️ Exception',
      3: '📍 Out for Delivery',
      4: '✅ Delivered',
      5: '🔄 Alert',
      6: '📦 Expired',
    };
    const statusLabel = statusMap[latest?.s] || '📦 Processing';

    return {
      mode: 'tracked',
      trackingNumber,
      status: statusLabel,
      latestEvent: latest?.c || 'No details available',
      origin: track.originCountry,
      destination: track.destCountry,
      url: `https://www.17track.net/en/track?nums=${trackingNumber}`,
      message: `${statusLabel}\n${latest?.c || ''}\n\n📎 Full tracking: https://www.17track.net/en/track?nums=${trackingNumber}`,
    };
  } catch (err) {
    console.error('17track error:', err.message);
    return fallbackLink(trackingNumber);
  }
}

function fallbackLink(trackingNumber) {
  return {
    mode: 'link',
    trackingNumber,
    url: `https://www.17track.net/en/track?nums=${trackingNumber}`,
    message: `🔍 Track your package here:\n👉 https://www.17track.net/en/track?nums=${trackingNumber}`,
  };
}

module.exports = { lookupTracking };

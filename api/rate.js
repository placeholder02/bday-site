// api/rate.js
export default async function handler(req, res) {
  // 🔹 Set CORS headers FIRST, before any other logic
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 🔹 Handle preflight OPTIONS request immediately
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return; // Make sure we return here and don't continue
  }

  // 🔹 Only check for POST after handling OPTIONS
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    // Parse body data
    const { rating, notes = '', secret } = req.body || {};

    // Validate secret
    if (secret !== process.env.RATE_SECRET) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    // Validate rating
    if (!(Number(rating) >= 1 && Number(rating) <= 5)) {
      return res.status(400).json({ ok: false, error: 'Invalid rating' });
    }

    // Get Telegram credentials
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ ok: false, error: 'Missing Telegram configuration' });
    }

    // Create message
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const text = `⭐ تقييم جديد\nالتقييم: ${rating}/5\nالملاحظات: ${notes || '(لا يوجد)'}\nالوقت: ${ts}`;

    // Send to Telegram
    const tgResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: CHAT_ID, 
        text: text,
        parse_mode: 'HTML' // Optional: allows basic formatting
      })
    });

    const tgJson = await tgResp.json();

    if (!tgJson.ok) {
      console.error('Telegram API Error:', tgJson);
      return res.status(502).json({ 
        ok: false, 
        error: 'Telegram delivery failed', 
        details: tgJson.description || 'Unknown error'
      });
    }

    return res.status(200).json({ ok: true, delivered: true });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Server error', 
      details: error.message 
    });
  }
}
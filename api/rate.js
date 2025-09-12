// api/rate.js
export default async function handler(req, res) {
  // CORS (يفضل تغيّر * إلى دومين صفحتك)
  res.setHeader('Access-Control-Allow-Origin', 'https://placeholder02.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { rating, notes = '', secret } = req.body || {};
    if (secret !== process.env.RATE_SECRET) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    if (!(Number(rating) >= 1 && Number(rating) <= 5)) {
      return res.status(400).json({ ok: false, error: 'Invalid rating' });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;
    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ ok: false, error: 'Missing env vars' });
    }

    const ts = new Date().toISOString().replace('T',' ').slice(0,19);
    const text =
      `⭐ تقييم جديد\n` +
      `التقييم: ${rating}/5\n` +
      `الملاحظات: ${notes || '(لا يوجد)'}\n` +
      `الوقت: ${ts}`;

    const tgResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text })
    });
    const tgJson = await tgResp.json();
    console.log("Telegram response:", tgJson);
    if (!tgJson.ok) {
      return res.status(502).json({ ok:false, error:'Telegram error', tg:tgJson });
    }

    return res.json({ ok:true, delivered:true });
  } catch (e) {
    return res.status(500).json({ ok:false, error:'Server error' });
  }
}

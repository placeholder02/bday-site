// api/rate.js
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 🔹 أي طلب preflight لازم يرجع 200 فورًا
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 🔹 بعدين شوف إذا مش POST
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    // الـ body موجود بس في POST، مش في OPTIONS
    const { rating, notes = '', secret } = req.body || {};

    if (secret !== process.env.RATE_SECRET) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    if (!(Number(rating) >= 1 && Number(rating) <= 5)) {
      return res.status(400).json({ ok: false, error: 'Invalid rating' });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

    const ts = new Date().toISOString().replace('T',' ').slice(0,19);
    const text = `⭐ تقييم جديد\nالتقييم: ${rating}/5\nالملاحظات: ${notes || '(لا يوجد)'}\nالوقت: ${ts}`;

    const tgResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text })
    });
    const tgJson = await tgResp.json();

    if (!tgJson.ok) {
      return res.status(502).json({ ok:false, error:'Telegram error', tg:tgJson });
    }

    return res.json({ ok:true, delivered:true });
  } catch (e) {
    return res.status(500).json({ ok:false, error:'Server error', details: e.message });
  }
}

// api/visit.js
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // بعد الاختبار حدّد الدومين
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ ok:false, error:'Method Not Allowed' });
  }

  try {
    const { secret } = req.body || {};
    if (secret !== process.env.VISIT_SECRET) {
      return res.status(401).json({ ok:false, error:'Unauthorized' });
    }

    // استخرج الـ IP
    const xfwd = req.headers['x-forwarded-for'];
    const ip =
      (typeof xfwd === 'string' && xfwd.split(',')[0].trim()) ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'unknown';

    // هيدرز مفيدة من Vercel إن وُجدت
    const country = req.headers['x-vercel-ip-country'] || '';
    const city    = req.headers['x-vercel-ip-city']    || '';
    const ua      = req.headers['user-agent']          || '';
    const referer = req.headers['referer']             || '';
    const ts      = new Date().toISOString().replace('T',' ').slice(0,19);

    // ⚠️ خيار: لتخفيف الحساسية، أرسل آخر 2 بايت فقط (إخفاء جزئي)
    // const safeIp = ip.replace(/^(\d+\.\d+)\.\d+\.\d+$/, '$1.x.x');

    const lines = [
      '👤 زيارة جديدة',
      `IP: ${ip}`,
      country || city ? `الموقع: ${country}${city ? ' - ' + city : ''}` : '',
      referer ? `الصفحة: ${referer}` : '',
      ua ? `UA: ${ua}` : '',
      `الوقت: ${ts}`
    ].filter(Boolean);

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

    // أرسل لتيليجرام
    const tg = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: lines.join('\n') })
    }).then(r=>r.json());

    if (!tg.ok) {
      return res.status(502).json({ ok:false, error:'Telegram error', tg });
    }

    return res.json({ ok:true });
  } catch (e) {
    return res.status(500).json({ ok:false, error:'Server error' });
  }
}

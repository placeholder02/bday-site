// api/rate.js
export default async function handler(req, res) {
  // لازم تنضاف الهيدرز قبل أي return
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // preflight request (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // باقي الميثودات
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  // بس للتاكيد انه الرد يوصل
  return res.json({ ok: true, msg: "CORS test passed ✅" });
}

// Lemon Squeezy webhook for Bondline Pro.
// Lemon Squeezy calls this after a purchase, renewal, cancellation or refund.
// It checks the signature, then records the user's Pro status in Firestore at entitlements/{uid}.
// No npm packages needed. Environment variables (Netlify → Site configuration → Environment variables):
//   LEMON_WEBHOOK_SECRET   the signing secret you typed when creating the webhook in Lemon Squeezy
//   FIREBASE_PROJECT_ID    your Firebase project ID
//   FIREBASE_CLIENT_EMAIL  client_email from a Firebase service-account key
//   FIREBASE_PRIVATE_KEY   private_key from the same key (paste it whole, including BEGIN/END lines)
//   LEMON_PASS_DAYS        optional, days a semester pass lasts (default 150)
import crypto from 'node:crypto';

const DAY = 864e5;
const env = k => (process.env[k] || '').trim();

export const config = { path: '/api/lemon-webhook' };

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const secret = env('LEMON_WEBHOOK_SECRET');
  if (!secret) return new Response('Webhook secret not set', { status: 500 });
  const raw = await req.text();
  const sig = req.headers.get('x-signature') || '';
  const dig = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  if (sig.length !== dig.length || !crypto.timingSafeEqual(Buffer.from(dig), Buffer.from(sig))) {
    return new Response('Invalid signature', { status: 401 });
  }
  let body;
  try { body = JSON.parse(raw); } catch { return new Response('Bad JSON', { status: 400 }); }
  const ev = body?.meta?.event_name || '';
  const cd = body?.meta?.custom_data || {};
  const uid = String(cd.uid || '');
  // Acknowledge events we can't link to an account, so Lemon Squeezy doesn't keep retrying.
  if (!/^[A-Za-z0-9_-]{6,128}$/.test(uid)) return new Response('No Bondline account on this order', { status: 200 });
  const a = body?.data?.attributes || {};
  const id = String(body?.data?.id || '');
  const ts = s => (s ? Date.parse(s) || 0 : 0);
  const now = Date.now();
  let fields = null;

  if (ev.startsWith('subscription_') && body?.data?.type === 'subscriptions') {
    const st = a.status;
    let until = 0;
    if (st === 'on_trial') until = ts(a.trial_ends_at) + DAY;
    else if (st === 'active' || st === 'past_due') until = ts(a.renews_at) + 3 * DAY; // 3 days' grace for late renewals
    else if (st === 'cancelled') until = ts(a.ends_at);
    fields = { subUntil: until, subStatus: String(st || ''), subId: id, updated: now };
    if (a.urls?.customer_portal) fields.portal = String(a.urls.customer_portal);
    if (a.user_email) fields.email = String(a.user_email);
  } else if (ev === 'order_created' && cd.plan === 'semester' && a.status === 'paid') {
    const days = +env('LEMON_PASS_DAYS') || 150;
    const cur = await fsGet(`entitlements/${uid}`);
    if (cur?.passOrder === id) return new Response('Already recorded', { status: 200 });
    const from = Math.max(now, +(cur?.passUntil || 0)); // a second pass extends the first
    fields = { passUntil: from + days * DAY, passOrder: id, updated: now };
    if (a.user_email) fields.email = String(a.user_email);
  } else if (ev === 'order_refunded' && cd.plan === 'semester') {
    const cur = await fsGet(`entitlements/${uid}`);
    if (cur?.passOrder === id) fields = { passUntil: 0, updated: now };
  }

  if (!fields) return new Response('Ignored ' + ev, { status: 200 });
  await fsPatch(`entitlements/${uid}`, fields);
  return new Response('OK', { status: 200 });
};

// ---------- Firestore REST with a service account (no SDK) ----------
let tok = { v: '', exp: 0 };
async function token() {
  if (tok.v && Date.now() < tok.exp - 60e3) return tok.v;
  const email = env('FIREBASE_CLIENT_EMAIL');
  const key = env('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');
  if (!email || !key) throw new Error('Firebase service account not set');
  const t = Math.floor(Date.now() / 1000);
  const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({ iss: email, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat: t, exp: t + 3600 });
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(key).toString('base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: unsigned + '.' + sig }) });
  const j = await r.json();
  if (!r.ok) throw new Error('Token error ' + r.status + ' ' + JSON.stringify(j));
  tok = { v: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
  return tok.v;
}
const docUrl = p => `https://firestore.googleapis.com/v1/projects/${env('FIREBASE_PROJECT_ID')}/databases/(default)/documents/${p}`;
const enc = v => typeof v === 'number' ? { integerValue: String(Math.round(v)) } : { stringValue: String(v) };
const dec = f => f.integerValue != null ? +f.integerValue : f.doubleValue != null ? +f.doubleValue : f.stringValue != null ? f.stringValue : f.booleanValue != null ? f.booleanValue : null;
async function fsGet(p) {
  const r = await fetch(docUrl(p), { headers: { authorization: 'Bearer ' + await token() } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('Firestore read ' + r.status);
  const j = await r.json(), o = {};
  for (const [k, f] of Object.entries(j.fields || {})) o[k] = dec(f);
  return o;
}
async function fsPatch(p, fields) {
  const mask = Object.keys(fields).map(k => 'updateMask.fieldPaths=' + encodeURIComponent(k)).join('&');
  const r = await fetch(docUrl(p) + '?' + mask, { method: 'PATCH', headers: { authorization: 'Bearer ' + await token(), 'content-type': 'application/json' }, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, enc(v)])) }) });
  if (!r.ok) throw new Error('Firestore write ' + r.status + ' ' + await r.text());
}

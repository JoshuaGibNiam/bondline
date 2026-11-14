// Marks quizzes that a teacher set with "Mark on the server" (Bondline version 27).
// The answers live in classes/{class}/keys/{assignment}, which students can't read, and only this function
// can write a result with v: true. Uses the same Firebase service account as the Stripe webhook;
// no npm packages needed. Environment variables (Netlify → Site configuration → Environment variables):
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
// Like every Netlify function, it only runs when the site is deployed from GitHub or the Netlify CLI.
import crypto from 'node:crypto';

const env = k => (process.env[k] || '').trim();
export const config = { path: '/api/grade-quiz' };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default async (req) => {
  // The app checks this to see whether server marking is available.
  if (req.method === 'GET') return json({ ok: true, v: 1, ready: !!(env('FIREBASE_PROJECT_ID') && env('FIREBASE_CLIENT_EMAIL') && env('FIREBASE_PRIVATE_KEY')) });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let uid, claims;
  try { claims = await verifyIdToken((req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')); uid = claims.sub; }
  catch (e) { return json({ error: 'Please sign in again.' }, 401); }
  let body;
  try { body = await req.json(); } catch { return json({ error: 'Bad request' }, 400); }
  const cid = String(body.cid || ''), aid = String(body.aid || '');
  if (!/^[A-Za-z0-9]{6,40}$/.test(cid) || !/^[A-Za-z0-9]{6,40}$/.test(aid)) return json({ error: 'Bad request' }, 400);
  try {
    const cls = await fsGet(`classes/${cid}`);
    if (!cls || !(cls.memberIds || []).includes(uid)) return json({ error: 'You’re not in this class.' }, 403);
    const a = await fsGet(`classes/${cid}/assignments/${aid}`);
    if (!a || a.kind !== 'quiz' || !(a.opt && a.opt.secure)) return json({ error: 'This quiz isn’t marked on the server.' }, 400);
    const key = await fsGet(`classes/${cid}/keys/${aid}`);
    if (!key || !Array.isArray(key.a)) return json({ error: 'Your teacher needs to set this quiz again (its answer key is missing).' }, 409);
    const rid = `${aid}_${uid}`, prev = await fsGet(`classes/${cid}/results/${rid}`);
    const opt = a.opt || {}, tries = (prev && prev.tries || 0) + 1;
    if (opt.tries && tries > opt.tries) return json({ error: 'You’ve used all your attempts.' }, 403);
    const qs = Array.isArray(a.qs) ? a.qs : [], ans = Array.isArray(body.ans) ? body.ans : [];
    const qo = [], qk = [], qt = [];
    let score = 0;
    qs.forEach((q, i) => {
      const r = ans[i] && typeof ans[i] === 'object' ? ans[i] : null, k = String(key.a[i] ?? '');
      let ok = false;
      if (q.t === 'mc' || q.t === 'tf') ok = !!r && Number.isInteger(r.k) && r.k === Number(k);
      else if (q.t === 'text') { const v = String(r && r.t || ''); ok = !!v.trim() && k.split('\u001f').some(x => normName(x) === normName(v) || looseName(x) === looseName(v)); }
      else if (q.t === 'num') { const [v, t] = k.split('\u001f'), want = Number(v), tol = Number(t) || 0, got = parseNum(r && r.t); ok = got != null && isFinite(want) && Math.abs(got - want) <= (tol > 0 ? tol : Math.max(1e-12, Math.abs(want) * 0.005)) + 1e-12; }
      if (ok) score++;
      qo.push(ok ? 1 : 0); qk.push(r && Number.isInteger(r.k) ? r.k : -1); qt.push(r && r.t != null ? String(r.t).slice(0, 80) : '');
    });
    const total = Math.max(1, qs.length), now = Date.now(), same = prev && prev.total === total;
    const mem = await fsGet(`classes/${cid}/members/${uid}`) || {};
    const doc = {
      aid, uid, n: String(mem.n || claims.name || 'Student').slice(0, 80), e: String(mem.e || claims.email || '').slice(0, 120),
      score, total, best: same ? Math.max(prev.best || 0, score) : score, tries, at: now,
      // Insights use the first attempt.
      qo: same && prev.qo ? prev.qo : qo, qk: same && prev.qk ? prev.qk : qk, qt: same && prev.qt ? prev.qt : qt,
      first: same && prev.first != null ? prev.first : score,
      secs: Math.max(0, Math.round(Number(body.secs) || 0)), sw: Math.max(0, Math.round(Number(body.sw) || 0)), v: true,
    };
    if (a.due && now > a.due) doc.late = true;
    await fsSet(`classes/${cid}/results/${rid}`, doc);
    const reveal = opt.reveal === 'now' || !opt.reveal || (opt.reveal === 'due' && a.due && now > a.due);
    return json({ score, total, qo, best: doc.best, tries, key: reveal ? key.a : null, why: reveal ? key.w || [] : null });
  } catch (e) {
    console.error(e);
    return json({ error: 'The server couldn’t mark this. Try again in a minute.' }, 500);
  }
};

// ---------- the same marking rules as the app ----------
// Copied from app.js so the server forgives the same slips as the app.
const normName=s=>String(s).toLowerCase().normalize('NFKC').replace(/[\u2010-\u2015\u2212]/g,'-').replace(/\s+/g,' ').trim().replace(/\s*-\s*/g,'-').replace(/\s*,\s*/g,',').replace(/\s*\(\s*/g,'(').replace(/\s*\)\s*/g,')');
const looseName=s=>normName(s).replace(/[\s\-,()\[\]'’]/g,'');
function parseNum(s) {
  s = String(s == null ? '' : s).trim().replace(/−/g, '-').replace(/\s+/g, '');
  if (!s) return null;
  if (/^[-+]?\d+,\d+$/.test(s)) s = s.replace(',', '.'); else s = s.replace(/,/g, '');
  s = s.replace(/[×x*]10\^?\(?([-+]?\d+)\)?$/i, 'e$1');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return null;
  const v = parseFloat(s); return isFinite(v) ? v : null;
}

// ---------- Firebase ID tokens, checked against Google's public keys ----------
let certs = { v: null, exp: 0 };
async function googleCerts() {
  if (certs.v && Date.now() < certs.exp) return certs.v;
  const r = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  if (!r.ok) throw new Error('certs ' + r.status);
  const age = /max-age=(\d+)/.exec(r.headers.get('cache-control') || '');
  certs = { v: await r.json(), exp: Date.now() + (age ? +age[1] * 1000 : 3600e3) };
  return certs.v;
}
async function verifyIdToken(tok) {
  const parts = String(tok || '').split('.');
  if (parts.length !== 3) throw new Error('token');
  const dec = s => JSON.parse(Buffer.from(s, 'base64url').toString('utf8'));
  const h = dec(parts[0]), p = dec(parts[1]), project = env('FIREBASE_PROJECT_ID'), now = Math.floor(Date.now() / 1000);
  if (h.alg !== 'RS256' || !h.kid) throw new Error('alg');
  const pem = (await googleCerts())[h.kid];
  if (!pem) throw new Error('kid');
  const key = new crypto.X509Certificate(pem).publicKey;
  if (!crypto.verify('RSA-SHA256', Buffer.from(parts[0] + '.' + parts[1]), key, Buffer.from(parts[2], 'base64url'))) throw new Error('sig');
  if (p.aud !== project || p.iss !== 'https://securetoken.google.com/' + project) throw new Error('aud');
  if (!(p.exp > now) || !(p.iat <= now + 300) || !p.sub) throw new Error('exp');
  return p;
}

// ---------- Firestore REST with a service account (no SDK) ----------
let tok = { v: '', exp: 0 };
async function token() {
  if (tok.v && Date.now() < tok.exp - 60e3) return tok.v;
  const email = env('FIREBASE_CLIENT_EMAIL'), key = env('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');
  if (!email || !key) throw new Error('Firebase service account not set');
  const t = Math.floor(Date.now() / 1000), b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({ iss: email, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat: t, exp: t + 3600 });
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(key).toString('base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: unsigned + '.' + sig }) });
  const j = await r.json();
  if (!r.ok) throw new Error('Token error ' + r.status);
  tok = { v: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
  return tok.v;
}
const docUrl = p => `https://firestore.googleapis.com/v1/projects/${env('FIREBASE_PROJECT_ID')}/databases/(default)/documents/${p}`;
function dec(f) {
  if (!f) return null;
  if ('nullValue' in f) return null;
  if ('booleanValue' in f) return f.booleanValue;
  if ('integerValue' in f) return Number(f.integerValue);
  if ('doubleValue' in f) return Number(f.doubleValue);
  if ('stringValue' in f) return f.stringValue;
  if ('timestampValue' in f) return Date.parse(f.timestampValue);
  if ('arrayValue' in f) return (f.arrayValue.values || []).map(dec);
  if ('mapValue' in f) return Object.fromEntries(Object.entries(f.mapValue.fields || {}).map(([k, v]) => [k, dec(v)]));
  return null;
}
function enc(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
  return { stringValue: String(v) };
}
async function fsGet(p) {
  const r = await fetch(docUrl(p), { headers: { authorization: 'Bearer ' + await token() } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('Firestore read ' + r.status);
  const j = await r.json();
  return Object.fromEntries(Object.entries(j.fields || {}).map(([k, v]) => [k, dec(v)]));
}
async function fsSet(p, o) {
  const r = await fetch(docUrl(p), { method: 'PATCH', headers: { authorization: 'Bearer ' + await token(), 'content-type': 'application/json' }, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(o).map(([k, v]) => [k, enc(v)])) }) });
  if (!r.ok) throw new Error('Firestore write ' + r.status + ' ' + await r.text());
}

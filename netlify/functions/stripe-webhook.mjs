// Stripe webhook for Bondline Pro.
// Stripe calls this after a purchase, paid invoice, renewal, cancellation, refund or dispute. It checks the signature, then records
// Pro in Firestore: entitlements/{uid} for a person, passes/{uid} for a teacher's centre licence.
// No npm packages needed. Environment variables (Netlify → Site configuration → Environment variables):
//   STRIPE_WEBHOOK_SECRET  the signing secret Stripe shows for this webhook (whsec_…)
//   STRIPE_SECRET_KEY      your Stripe secret key (used to look up a refunded payment)
//   STRIPE_PORTAL_URL      optional, your Stripe customer portal link, shown as "Manage subscription"
//   FIREBASE_PROJECT_ID    your Firebase project ID
//   FIREBASE_CLIENT_EMAIL  client_email from a Firebase service-account key
//   FIREBASE_PRIVATE_KEY   private_key from the same key (paste it whole, including BEGIN/END lines)
//   PASS_DAYS              optional, days a semester pass lasts (default 150)
//   EXAM_DAYS              optional, days an exam pass lasts (default 60)
//   CENTRE_DAYS            optional, days a centre licence lasts (default 150)
// Every checkout carries metadata: uid (the Bondline account that gets Pro; for a purchase from the
// "ask a parent" page this is the student's account, not the buyer's), plan and seats.
import crypto from 'node:crypto';

const DAY = 864e5;
const env = k => (process.env[k] || '').trim();
const ok = msg => new Response(msg || 'OK', { status: 200 });

export const config = { path: '/api/stripe-webhook' };

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const secret = env('STRIPE_WEBHOOK_SECRET');
  if (!secret) return new Response('Webhook secret not set', { status: 500 });
  const raw = await req.text();
  // Stripe-Signature: t=<timestamp>,v1=<HMAC-SHA256 of "<timestamp>.<body>">
  const parts = Object.fromEntries((req.headers.get('stripe-signature') || '').split(',').map(x => x.trim().split('=')).filter(x => x.length === 2).map(([k, v]) => [k, v]));
  const sigs = (req.headers.get('stripe-signature') || '').split(',').map(x => x.trim()).filter(x => x.startsWith('v1=')).map(x => x.slice(3));
  const t = +parts.t || 0;
  const dig = crypto.createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex');
  const good = sigs.some(s => s.length === dig.length && crypto.timingSafeEqual(Buffer.from(dig), Buffer.from(s)));
  if (!t || !good || Math.abs(Date.now() / 1000 - t) > 300) return new Response('Invalid signature', { status: 401 });
  let ev;
  try { ev = JSON.parse(raw); } catch { return new Response('Bad JSON', { status: 400 }); }
  const type = ev?.type || '', o = ev?.data?.object || {}, now = Date.now();
  const validUid = u => /^[A-Za-z0-9_-]{6,128}$/.test(String(u || ''));

  // ---- one-off payments: semester pass, exam pass, centre licence ----
  if (type === 'checkout.session.completed' || type === 'checkout.session.async_payment_succeeded') {
    const m = o.metadata || {}, uid = String(m.uid || o.client_reference_id || ''), plan = String(m.plan || '');
    if (o.mode !== 'payment') return ok('Subscription: handled by its own events');
    if (o.payment_status !== 'paid') return ok('Not paid yet');
    if (!validUid(uid)) return ok('No Bondline account on this order');
    const id = String(o.payment_intent || o.id);
    const email = String(o.customer_details?.email || o.customer_email || '');
    if (plan === 'semester' || plan === 'exam') {
      return ok((await once(id, () => grantPass(uid, plan, id, email, m.from === 'gift', now))) ? 'OK' : 'Already recorded');
    }
    if (plan === 'centre') {
      // A centre licence: Pro for the students in this teacher's classes, up to `seats` students in each class.
      const seats = Math.max(0, Math.min(5000, Math.round(+m.seats || 0)));
      if (!seats) return ok('No seats on this order');
      return ok((await once(id, () => grantCentre(uid, seats, id, email, now))) ? 'OK' : 'Already recorded');
    }
    return ok('Unknown plan');
  }

  // ---- an invoice paid (Stripe Invoicing): a centre licence or pass billed to a teacher, school or parent ----
  // Create the invoice in the Stripe Dashboard and give it metadata: uid (the Bondline account that gets Pro),
  // plan (centre, semester or exam) and, for centre, seats. Invoices with no Bondline uid are ignored.
  if (type === 'invoice.paid') {
    if (o.subscription || o.parent?.subscription_details?.subscription) return ok('Subscription invoice: handled by its own events');
    const m = o.metadata || {}, uid = String(m.uid || ''), plan = String(m.plan || '');
    if (!validUid(uid)) return ok('No Bondline account on this invoice');
    const id = String(o.id || ''), email = String(o.customer_email || '');
    if (!id) return ok('No invoice id');
    if (plan === 'semester' || plan === 'exam') {
      return ok((await once(id, () => grantPass(uid, plan, id, email, false, now))) ? 'OK' : 'Already recorded');
    }
    if (plan === 'centre') {
      const seats = Math.max(0, Math.min(5000, Math.round(+m.seats || +o.lines?.data?.[0]?.quantity || 0)));
      if (!seats) return ok('No seats on this invoice');
      return ok((await once(id, () => grantCentre(uid, seats, id, email, now))) ? 'OK' : 'Already recorded');
    }
    return ok('Unknown plan on invoice');
  }

  // ---- the monthly subscription ----
  if (type.startsWith('customer.subscription.')) {
    const uid = String(o.metadata?.uid || '');
    if (!validUid(uid)) return ok('No Bondline account on this subscription');
    const id = String(o.id || ''), at = (+ev.created || 0) * 1000 || now;
    // Stripe can deliver events out of order (or retry an old one). Skip any event older than the one
    // already recorded, so a late "past_due" can't overwrite a newer "active".
    const cur = await fsGet(`entitlements/${uid}`);
    if (cur && cur.subId === id && +(cur.subAt || 0) > at) return ok('Older event ignored');
    const end = (+o.current_period_end || +o.items?.data?.[0]?.current_period_end || 0) * 1000;
    const st = String(o.status || '');
    let until = null, status = st;
    if (st === 'canceled' || type === 'customer.subscription.deleted') { until = Math.min(now, (+o.ended_at || 0) * 1000 || now); status = 'cancelled'; }
    else if (o.cancel_at_period_end && (st === 'active' || st === 'trialing')) { until = end; status = 'cancelled'; } // Pro stays on to the end of the paid month
    else if (st === 'active' || st === 'trialing' || st === 'past_due') until = end + 3 * DAY; // 3 days' grace for late renewals
    else if (st === 'unpaid' || st === 'incomplete_expired' || st === 'paused') until = 0;
    if (until == null) return ok('Ignored status ' + st); // "incomplete": the first payment hasn't gone through yet
    const fields = { subUntil: until, subStatus: status, subId: id, subAt: at, updated: now };
    if (env('STRIPE_PORTAL_URL')) fields.portal = env('STRIPE_PORTAL_URL');
    await fsPatch(`entitlements/${uid}`, fields);
    return ok();
  }

  // ---- a full refund or an opened dispute on a one-off payment takes the pass or licence away again ----
  // (A dispute pulls the money back at once, so access goes too. If you win the dispute, re-grant by hand in the admin page.)
  if ((type === 'charge.refunded' && o.refunded) || type === 'charge.dispute.created') {
    return ok(await undoPayment(String(o.payment_intent || ''), type === 'charge.refunded' ? (o.metadata || {}) : {}, now));
  }

  return ok('Ignored ' + type);
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

// ---------- grants, shared by checkout and invoice events ----------
async function grantPass(uid, plan, id, email, isGift, now) {
  const days = plan === 'exam' ? (+env('EXAM_DAYS') || 60) : (+env('PASS_DAYS') || 150);
  const cur = await fsGet(`entitlements/${uid}`);
  if (cur?.passOrder === id) return;
  const from = Math.max(now, +(cur?.passUntil || 0)); // a second pass extends the first
  await fsPatch(`entitlements/${uid}`, { passUntil: from + days * DAY, passOrder: id, passPlan: plan, passFrom: +(cur?.passUntil || 0), updated: now, ...(email && !isGift ? { email } : {}) });
}
async function grantCentre(uid, seats, id, email, now) {
  const days = +env('CENTRE_DAYS') || 150;
  const cur = await fsGet(`passes/${uid}`);
  if (cur?.order === id) return;
  const curSeats = +(cur?.seats || 0), curUntil = +(cur?.until || 0), live = curSeats > 0 && curUntil > now;
  // More than 30 days left = a top-up (more seats, same end date). Otherwise a new term or a renewal.
  const topUp = live && curUntil - now > 30 * DAY;
  const next = topUp ? { seats: curSeats + seats, until: curUntil } : { seats, until: Math.max(now, live ? curUntil : 0) + days * DAY };
  await fsPatch(`passes/${uid}`, { ...next, order: id, seatsBefore: curSeats, untilBefore: curUntil, at: now, ...(email ? { email } : {}) });
}
async function undoPayment(id, m, now) {
  if (!m.uid && id && env('STRIPE_SECRET_KEY')) {
    const r = await fetch('https://api.stripe.com/v1/payment_intents/' + encodeURIComponent(id), { headers: { authorization: 'Bearer ' + env('STRIPE_SECRET_KEY') } });
    if (r.ok) m = (await r.json()).metadata || {};
  }
  const uid = String(m.uid || ''), plan = String(m.plan || '');
  if (!/^[A-Za-z0-9_-]{6,128}$/.test(uid) || !id) return 'Nothing to undo';
  if (plan === 'semester' || plan === 'exam') {
    const cur = await fsGet(`entitlements/${uid}`);
    if (cur?.passOrder === id) await fsPatch(`entitlements/${uid}`, { passUntil: +(cur.passFrom || 0), updated: now }); // back to what they had before
  } else if (plan === 'centre') {
    const cur = await fsGet(`passes/${uid}`);
    if (cur?.order === id) await fsPatch(`passes/${uid}`, { seats: +(cur.seatsBefore || 0), until: +(cur.untilBefore || 0), at: now });
  }
  return 'OK';
}

// ---------- exactly once ----------
// Stripe retries events and can deliver one twice, even at the same moment. Before granting, create a marker
// document stripeOrders/{payment or invoice id}; Firestore refuses to create it a second time (409), so only one
// delivery gets to grant. If the grant fails, the marker is removed so Stripe's retry can try again.
// Only the server (service account) can touch this collection; the Firestore rules have no rule for it.
async function once(id, fn) {
  const r = await fetch(docUrl('stripeOrders') + '?documentId=' + encodeURIComponent(id), { method: 'POST', headers: { authorization: 'Bearer ' + await token(), 'content-type': 'application/json' }, body: JSON.stringify({ fields: { at: enc(Date.now()) } }) });
  if (r.status === 409) return false;
  if (!r.ok) throw new Error('Firestore claim ' + r.status + ' ' + await r.text());
  try { await fn(); return true; }
  catch (e) {
    await fetch(docUrl('stripeOrders/' + encodeURIComponent(id)), { method: 'DELETE', headers: { authorization: 'Bearer ' + await token() } }).catch(() => {});
    throw e;
  }
}

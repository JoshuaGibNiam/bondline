// Local test for netlify/functions/stripe-webhook.mjs. No network, no Stripe, no Firebase.
// Sends correctly signed fake Stripe events to the real handler and checks what it writes to a fake Firestore.
//   node tools/webhook-test.mjs
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
process.env.FIREBASE_PROJECT_ID = 'p';
process.env.FIREBASE_CLIENT_EMAIL = 'svc@p.iam.gserviceaccount.com';
process.env.FIREBASE_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' }).replace(/\n/g, '\\n');

// ---- fake Firestore + Stripe ----
const docs = new Map();            // path -> { field: value }
let failNextPatch = false, piMetadata = {};
const toFields = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v]));
globalThis.fetch = async (url, opt = {}) => {
  url = String(url);
  const json = (b, status = 200) => new Response(JSON.stringify(b), { status });
  if (url.startsWith('https://oauth2.googleapis.com/token')) return json({ access_token: 't', expires_in: 3600 });
  if (url.startsWith('https://api.stripe.com/v1/payment_intents/')) return json({ metadata: piMetadata });
  const m = url.match(/documents\/([^?]+)(\?.*)?$/);
  if (!m) throw new Error('unexpected fetch ' + url);
  const path = decodeURIComponent(m[1]), method = opt.method || 'GET';
  if (method === 'POST') { // create with ?documentId=
    const id = new URL(url).searchParams.get('documentId'), p = `${path}/${id}`;
    if (docs.has(p)) return json({ error: 'exists' }, 409);
    docs.set(p, JSON.parse(opt.body).fields); return json({});
  }
  if (method === 'DELETE') { docs.delete(path); return json({}); }
  if (method === 'PATCH') {
    if (failNextPatch) { failNextPatch = false; return json({ error: 'boom' }, 500); }
    const cur = docs.get(path) || {}; Object.assign(cur, JSON.parse(opt.body).fields); docs.set(path, cur); return json({});
  }
  if (!docs.has(path)) return json({}, 404);
  return json({ fields: docs.get(path) });
};
const get = p => { const d = docs.get(p); if (!d) return null; return Object.fromEntries(Object.entries(d).map(([k, f]) => [k, f.integerValue != null ? +f.integerValue : f.stringValue])); };

const { default: handler } = await import('../netlify/functions/stripe-webhook.mjs');
const send = async (type, object, { badSig = false } = {}) => {
  const body = JSON.stringify({ id: 'evt_' + Math.random().toString(36).slice(2), type, created: Math.floor(Date.now() / 1000), data: { object } });
  const t = Math.floor(Date.now() / 1000);
  const sig = crypto.createHmac('sha256', badSig ? 'wrong' : 'whsec_test').update(`${t}.${body}`).digest('hex');
  const res = await handler(new Request('http://x/api/stripe-webhook', { method: 'POST', body, headers: { 'stripe-signature': `t=${t},v1=${sig}` } }));
  return { status: res.status, text: await res.text() };
};
const DAY = 864e5, UID = 'user_abc123';
let n = 0; const t = async (name, fn) => { await fn(); console.log('ok  ', ++n, name); };

await t('bad signature is rejected', async () => assert.equal((await send('x', {}, { badSig: true })).status, 401));

await t('semester pass via Checkout grants ~150 days', async () => {
  const r = await send('checkout.session.completed', { id: 'cs_1', mode: 'payment', payment_status: 'paid', payment_intent: 'pi_1', metadata: { uid: UID, plan: 'semester' }, customer_details: { email: 'a@b.co' } });
  assert.equal(r.status, 200);
  const e = get(`entitlements/${UID}`);
  assert.ok(Math.abs(e.passUntil - (Date.now() + 150 * DAY)) < 60e3);
  assert.equal(e.passOrder, 'pi_1');
});

await t('a duplicate delivery does not extend the pass twice', async () => {
  const before = get(`entitlements/${UID}`).passUntil;
  const r = await send('checkout.session.completed', { id: 'cs_1', mode: 'payment', payment_status: 'paid', payment_intent: 'pi_1', metadata: { uid: UID, plan: 'semester' } });
  assert.match(r.text, /Already recorded/);
  assert.equal(get(`entitlements/${UID}`).passUntil, before);
});

await t('an OLD order retried after a newer one is still not applied twice (the bug the marker fixes)', async () => {
  await send('checkout.session.completed', { id: 'cs_2', mode: 'payment', payment_status: 'paid', payment_intent: 'pi_2', metadata: { uid: UID, plan: 'exam' } });
  const before = get(`entitlements/${UID}`).passUntil;
  const r = await send('checkout.session.completed', { id: 'cs_1', mode: 'payment', payment_status: 'paid', payment_intent: 'pi_1', metadata: { uid: UID, plan: 'semester' } });
  assert.match(r.text, /Already recorded/);
  assert.equal(get(`entitlements/${UID}`).passUntil, before);
});

await t('a failed grant releases the marker so the retry succeeds', async () => {
  failNextPatch = true;
  const ev = { id: 'cs_3', mode: 'payment', payment_status: 'paid', payment_intent: 'pi_3', metadata: { uid: 'user_zzz999', plan: 'semester' } };
  await assert.rejects(() => send('checkout.session.completed', ev));
  assert.equal(docs.has('stripeOrders/pi_3'), false);
  assert.equal((await send('checkout.session.completed', ev)).status, 200);
  assert.ok(get('entitlements/user_zzz999').passUntil > Date.now());
});

await t('centre licence via invoice.paid grants seats (Stripe Invoicing)', async () => {
  const r = await send('invoice.paid', { id: 'in_1', customer_email: 'school@x.edu', metadata: { uid: 'teacher_001', plan: 'centre', seats: '30' } });
  assert.equal(r.status, 200);
  const p = get('passes/teacher_001');
  assert.equal(p.seats, 30);
  assert.ok(p.until > Date.now() + 149 * DAY);
});

await t('invoice.paid is exactly-once and falls back to line quantity for seats', async () => {
  assert.match((await send('invoice.paid', { id: 'in_1', metadata: { uid: 'teacher_001', plan: 'centre', seats: '30' } })).text, /Already recorded/);
  await send('invoice.paid', { id: 'in_2', metadata: { uid: 'teacher_002', plan: 'centre' }, lines: { data: [{ quantity: 12 }] } });
  assert.equal(get('passes/teacher_002').seats, 12);
});

await t('subscription invoices and non-Bondline invoices are ignored', async () => {
  assert.match((await send('invoice.paid', { id: 'in_3', subscription: 'sub_1', metadata: { uid: UID, plan: 'semester' } })).text, /Subscription invoice/);
  assert.match((await send('invoice.paid', { id: 'in_4', metadata: {} })).text, /No Bondline account/);
  assert.match((await send('invoice.paid', { id: 'in_5', parent: { subscription_details: { subscription: 'sub_2' } }, metadata: { uid: UID, plan: 'exam' } })).text, /Subscription invoice/);
});

await t('full refund reverts a pass to what the user had before', async () => {
  await send('checkout.session.completed', { id: 'cs_9', mode: 'payment', payment_status: 'paid', payment_intent: 'pi_9', metadata: { uid: 'user_ref001', plan: 'semester' } });
  assert.ok(get('entitlements/user_ref001').passUntil > Date.now());
  await send('charge.refunded', { refunded: true, payment_intent: 'pi_9', metadata: { uid: 'user_ref001', plan: 'semester' } });
  assert.equal(get('entitlements/user_ref001').passUntil, 0);
});

await t('an opened dispute revokes the pass (looks metadata up on the PaymentIntent)', async () => {
  await send('checkout.session.completed', { id: 'cs_10', mode: 'payment', payment_status: 'paid', payment_intent: 'pi_10', metadata: { uid: 'user_dis001', plan: 'exam' } });
  assert.ok(get('entitlements/user_dis001').passUntil > Date.now());
  piMetadata = { uid: 'user_dis001', plan: 'exam' };
  await send('charge.dispute.created', { id: 'dp_1', charge: 'ch_1', payment_intent: 'pi_10' });
  assert.equal(get('entitlements/user_dis001').passUntil, 0);
});

await t('subscription event: active gets 3 days grace; cancel-at-period-end keeps access to period end', async () => {
  const end = Math.floor(Date.now() / 1000) + 20 * 86400;
  await send('customer.subscription.updated', { id: 'sub_9', status: 'active', current_period_end: end, metadata: { uid: 'user_sub001' } });
  assert.equal(get('entitlements/user_sub001').subUntil, end * 1000 + 3 * DAY);
  await send('customer.subscription.updated', { id: 'sub_9', status: 'active', cancel_at_period_end: true, current_period_end: end, metadata: { uid: 'user_sub001' } });
  const e = get('entitlements/user_sub001');
  assert.equal(e.subStatus, 'cancelled'); assert.equal(e.subUntil, end * 1000);
});

console.log(`\nAll ${n} checks passed.`);

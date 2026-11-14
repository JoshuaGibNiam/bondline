// Starts a Stripe Checkout for Bondline Pro and returns its address.
// The app (and the "ask a parent" page) POST { plan, uid, email, seats, from } here, then send the buyer to the URL that comes back.
// No npm packages needed. Environment variables (Netlify → Site configuration → Environment variables):
//   STRIPE_SECRET_KEY        your Stripe secret key (sk_live_… or sk_test_…)
//   STRIPE_PRICE_MONTHLY     price ID (price_…) of the monthly subscription
//   STRIPE_PRICE_SEMESTER    price ID of the semester pass (one-off)
//   STRIPE_PRICE_EXAM        price ID of the exam pass (one-off)
//   STRIPE_PRICE_CENTRE      price ID of the centre licence, priced per student (one-off)
//   CENTRE_MIN_SEATS         optional, smallest centre licence (default 10)
//   STRIPE_API_VERSION       optional, the Stripe API version to use (default 2026-10-28.endive, so checkout behaves the same on every account)
// Checkout settings (ui_mode, address collection, tax, promotion codes and so on) come from Stripe Checkout Studio.
// See STRIPE_INTEGRATION_TODO.md.
const env = k => (process.env[k] || '').trim();
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export const config = { path: '/api/checkout' };

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const key = env('STRIPE_SECRET_KEY');
  if (!key) return json({ error: 'Payments are not set up yet.' }, 500);
  let b;
  try { b = await req.json(); } catch { return json({ error: 'Bad request' }, 400); }
  const plan = String(b?.plan || ''), uid = String(b?.uid || ''), from = b?.from === 'gift' ? 'gift' : 'app';
  const price = { monthly: env('STRIPE_PRICE_MONTHLY'), semester: env('STRIPE_PRICE_SEMESTER'), exam: env('STRIPE_PRICE_EXAM'), centre: env('STRIPE_PRICE_CENTRE') }[plan];
  if (!price) return json({ error: 'That plan is not on sale yet.' }, 400);
  if (!/^[A-Za-z0-9_-]{6,128}$/.test(uid)) return json({ error: 'No Bondline account on this order.' }, 400);
  // A parent pays once; they shouldn't end up with a subscription on a card the student can't manage.
  if (from === 'gift' && (plan === 'monthly' || plan === 'centre')) return json({ error: 'That plan can’t be bought as a gift.' }, 400);
  const min = +env('CENTRE_MIN_SEATS') || 10;
  const seats = plan === 'centre' ? Math.round(+b?.seats || 0) : 1;
  if (plan === 'centre' && !(seats >= min && seats <= 5000)) return json({ error: `A centre licence is for ${min} students or more.` }, 400);

  const origin = new URL(req.url).origin;
  const name = String(b?.n || '').replace(/[^\p{L}\p{N} .'-]/gu, '').slice(0, 30);
  const meta = { uid, plan, seats: String(seats), from };
  const p = new URLSearchParams();
  const mode = plan === 'monthly' ? 'subscription' : 'payment';
  // Configured in Stripe Checkout Studio.
  p.set('ui_mode', 'hosted_page');
  p.set('billing_address_collection', 'auto');
  p.set('phone_number_collection[enabled]', 'false');
  p.set('automatic_tax[enabled]', 'false');
  p.set('allow_promotion_codes', 'false');
  if (mode === 'subscription') p.set('payment_method_collection', 'always');
  p.set('submit_type', 'auto');
  p.set('integration_identifier', 'hosted_web_0001');
  p.set('origin_context', 'web');
  p.set('mode', mode);
  p.set('line_items[0][price]', price);
  p.set('line_items[0][quantity]', String(seats));
  p.set('client_reference_id', uid);
  p.set('success_url', from === 'gift' ? `${origin}/gift/?done=1${name ? '&n=' + encodeURIComponent(name) : ''}` : `${origin}/?app&pro=thanks`);
  p.set('cancel_url', from === 'gift' ? `${origin}/gift/?for=${encodeURIComponent(uid)}${name ? '&n=' + encodeURIComponent(name) : ''}` : `${origin}/?app&pro=plans`);
  const email = String(b?.email || '');
  if (/^[^\s@]{1,64}@[^\s@]{1,180}\.[^\s@]{2,}$/.test(email)) p.set('customer_email', email);
  for (const [k, v] of Object.entries(meta)) {
    p.set(`metadata[${k}]`, v);
    // Copied onto the subscription or the payment, so later events (renewals, cancellations, refunds) still know whose it is.
    p.set(`${plan === 'monthly' ? 'subscription_data' : 'payment_intent_data'}[metadata][${k}]`, v);
  }

  const r = await fetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { authorization: 'Bearer ' + key, 'content-type': 'application/x-www-form-urlencoded', 'stripe-version': env('STRIPE_API_VERSION') || '2026-10-28.endive' }, body: p });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.url) { console.error('Stripe checkout error', r.status, j?.error?.message); return json({ error: 'Couldn’t open the checkout. Please try again.' }, 502); }
  return json({ url: j.url });
};

# Stripe integration: what's left to do

This file is the single source of truth for finishing the Stripe setup. Bondline uses **hosted Stripe Checkout**: the buyer is sent to a Stripe-hosted payment page and comes back to Bondline afterwards.

## Values to Replace

The Checkout Session call has no placeholder values left in its code. The values you must still supply live in **Netlify environment variables**, which the code reads.

**Files that read these values:**
- [netlify/functions/stripe-checkout.mjs](netlify/functions/stripe-checkout.mjs)
- [netlify/functions/stripe-webhook.mjs](netlify/functions/stripe-webhook.mjs)

| Field | Current Value | What to Set |
|-------|--------------|-------------|
| mode | `subscription` for the monthly plan, `payment` for everything else | Already correct. Change it only if you change which plans renew. |
| success_url | `https://<your site>/?app&pro=thanks` (or `/gift/?done=1` for a parent's purchase) | Already real. It uses the site's own address, so it works on bondline.site and on Netlify previews. |
| cancel_url | `https://<your site>/?app&pro=plans` (or back to the parent's `/gift/` page) | Already real. |
| line_items[].price | Read from `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_SEMESTER`, `STRIPE_PRICE_EXAM`, `STRIPE_PRICE_CENTRE` | Set each to the Price ID (`price_…`) of that product, from https://dashboard.stripe.com/prices. A plan whose variable is empty can't be bought. |
| line_items[].quantity | 1, or the number of students for a centre licence | Already correct. The centre licence price must be the price for **one** student. |

## Configured Parameters

These parameters were configured in Checkout Studio and are already set correctly.

**Files containing these parameters:**
- [netlify/functions/stripe-checkout.mjs](netlify/functions/stripe-checkout.mjs)

| Parameter | Value |
|-----------|-------|
| ui_mode | `hosted_page` |
| billing_address_collection | `auto` |
| phone_number_collection | `{ enabled: false }` |
| automatic_tax | `{ enabled: false }` |
| allow_promotion_codes | `false` |
| payment_method_collection | `always` (set only for the monthly subscription, as Stripe requires) |
| submit_type | `auto` |
| integration_identifier | `hosted_web_0001` |
| origin_context | `web` |

**Check `ui_mode` in test mode first.** Bondline calls Stripe's API directly with `fetch` rather than through the Stripe SDK, so there is no SDK version to check. `hosted_page` is the value for current versions (SDK 21.0.0 and above). If your first test checkout fails with an error about `ui_mode`, change it to `hosted` in `stripe-checkout.mjs`. No Stripe API version is pinned, so your account's default version applies.

**Kept on purpose.** The call also sends parameters that aren't in Checkout Studio's list: `client_reference_id`, `customer_email`, `metadata`, and `subscription_data.metadata` / `payment_intent_data.metadata`. These carry the buyer's Bondline account ID and the plan. The webhook reads them to switch Pro on for the right person (or the right student, when a parent pays), so removing them would mean payments never unlock Pro.

**Tax and promotion codes are now off**, as set in Checkout Studio. To turn either on later, change it in `stripe-checkout.mjs`. Turning on automatic tax also needs Stripe Tax set up in the dashboard.

## Setup

### 1. Deploy from GitHub, not drag and drop
Netlify runs server functions only for sites deployed from Git or the Netlify CLI. Link the GitHub repository in Netlify under **Site configuration → Build & deploy → Link repository**. There's no build command.

### 2. Create the products in Stripe
In **Product catalogue**, create these and copy each **Price ID**:

| Product | Type | Price |
|---|---|---|
| Bondline Pro monthly | Recurring, monthly | US$4 |
| Semester pass | One-off | US$19 |
| Exam pass | One-off | US$9 |
| Centre licence | One-off, per student | US$3 |

### 3. Environment variables (Netlify → Site configuration → Environment variables)
Server-only variables. None of these go in the browser or in any file in the repository.

| Name | Value |
|---|---|
| `STRIPE_SECRET_KEY` | Developers → API keys → Secret key (`sk_test_…` first, then `sk_live_…`) |
| `STRIPE_PRICE_MONTHLY` | Price ID of the monthly plan |
| `STRIPE_PRICE_SEMESTER` | Price ID of the semester pass |
| `STRIPE_PRICE_EXAM` | Price ID of the exam pass |
| `STRIPE_PRICE_CENTRE` | Price ID of the centre licence |
| `STRIPE_WEBHOOK_SECRET` | From step 4 (`whsec_…`) |
| `STRIPE_PORTAL_URL` | Optional: Settings → Billing → Customer portal link, shown as "Manage subscription" |
| `FIREBASE_PROJECT_ID` | From a Firebase service-account key (Project settings → Service accounts → Generate new private key) |
| `FIREBASE_CLIENT_EMAIL` | `client_email` from that key |
| `FIREBASE_PRIVATE_KEY` | `private_key` from that key, including the BEGIN and END lines |
| `STRIPE_API_VERSION` | Optional. The Stripe API version checkout uses. Default `2026-10-28.endive`, so `ui_mode` and the other parameters behave the same on every account |
| `PASS_DAYS`, `EXAM_DAYS`, `CENTRE_DAYS`, `CENTRE_MIN_SEATS` | Optional. Defaults: 150, 60, 150, 10 |

Delete any old `LEMON_…` variables. Redeploy after changing variables (Deploys → Trigger deploy).

No npm packages are needed: both functions use `fetch` and Node's built-in `crypto`.

### 4. Create the webhook
Developers → **Webhooks** → Add endpoint:
- URL: `https://bondline.site/api/stripe-webhook`
- Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`, `charge.dispute.created`, `invoice.paid`

Copy its **Signing secret** into `STRIPE_WEBHOOK_SECRET`.

### 5. Put the plans on sale
In [pro-config.js](pro-config.js), change each plan you've set up from `false` to `true` (and `centre.checkout` for centre licences). Keep the displayed prices there in step with Stripe.

## Invoicing (schools, tuition centres, a parent who wants an invoice)

Stripe Invoicing emails a payable invoice (card or bank transfer, due in N days). When it is paid, the webhook switches Pro on, the same as a checkout does.

1. Dashboard → Invoices → Create invoice. Pick or create the customer (the teacher's or school's email).
2. Add the line item: the centre licence price with the number of students as the quantity, or the semester or exam price.
3. Collection: **Send invoice**, due in 14 or 30 days.
4. Under **Metadata**, add:
   - `uid` = the Bondline account that should get Pro. For a centre licence this is the teacher's Firebase user ID (Firebase console → Authentication → the **User UID** column). For a pass it is the student's.
   - `plan` = `centre`, `semester` or `exam`
   - `seats` = the number of students (centre only; if you leave it out, the line item quantity is used)
5. Finalise and send. The webhook endpoint must include `invoice.paid` (step 4 above).

Invoices without a `uid` are ignored, so ordinary invoices are safe. Invoices for the monthly subscription are handled by the subscription events.
Refunds of invoice payments are not undone automatically; change the teacher's seats by hand in the admin page.

## Safety nets in the webhook

- Every one-off payment or invoice is recorded once in `stripeOrders/{id}` in Firestore (server only; the rules give no one access). A redelivered event can't extend a pass or add seats a second time.
- `charge.dispute.created` takes the pass or licence away as soon as a customer disputes the payment, like a refund does. If you win the dispute, give the access back by hand.

## Files

| File | What it does |
|---|---|
| [netlify/functions/stripe-checkout.mjs](netlify/functions/stripe-checkout.mjs) | `POST /api/checkout`: creates the Checkout Session and returns its URL |
| [netlify/functions/stripe-webhook.mjs](netlify/functions/stripe-webhook.mjs) | `POST /api/stripe-webhook`: checks Stripe's signature, then records Pro in Firestore |
| [gift/index.html](gift/index.html), [assets/gift.js](assets/gift.js) | The page a parent opens from the student's link |
| [pro-config.js](pro-config.js) | Which plans are on sale, and the prices shown in the app |

## How it works

1. The student presses **Continue to checkout** (or a parent presses a button on the gift page, or a teacher buys a centre licence).
2. The app sends `/api/checkout` the plan and the Bondline account ID. The server picks the Stripe price, so a buyer can't change the price.
3. The buyer pays on Stripe's hosted page and comes back to Bondline.
4. Stripe calls `/api/stripe-webhook`. It records `entitlements/{uid}` (monthly, semester or exam pass) or `passes/{uid}` (centre licence) in Firestore.
5. The app checks every few seconds after returning, and Pro switches on. Renewals, cancellations and full refunds update the same records.

## Testing

Use your **test** keys and test-mode Price IDs, then:
- Card that succeeds: `4242 4242 4242 4242`, any future expiry date, any CVC and postcode.
- Card that needs 3D Secure: `4000 0025 0000 3155`.
- Card that is declined: `4000 0000 0000 0002`.

Check that Pro switches on within a few seconds, and that Firestore has a document in `entitlements`. Also test:
- a parent's purchase, by opening the link from **Send a link** in another browser
- a centre licence for at least 10 students
- a refund from the Stripe dashboard

Stripe's webhook page shows each delivery and Bondline's response. When everything works, swap in the live key, live Price IDs and a live webhook secret.

## Next steps

- **Tax:** with Stripe you are the seller. Check what registration applies to you before turning `automatic_tax` on.
- **Receipts:** turn on email receipts under Settings → Customer emails.
- **Subscriptions:** set up the customer portal so subscribers can cancel themselves, then set `STRIPE_PORTAL_URL`.
- **Centre licences by invoice:** see "Invoicing" below. Paying the invoice switches the licence on by itself. (You can still set a teacher's seats and end date by hand in the admin page → Teachers.)
- **Orders:** every payment appears in the Stripe dashboard. Bondline keeps only the order ID and dates in Firestore.

## Resources

- https://support.stripe.com
- https://docs.stripe.com/mcp

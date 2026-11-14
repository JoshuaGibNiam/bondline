// Bondline Pro settings. Edit this file, then upload the site again.
//
// enforce: false = every Pro feature is free for everyone (preview).
//          true  = mock exams, the full weak-spot list, every course unit after the first three,
//                  and the streak perks (extra daily lessons, more freezes, streak repair) need Pro.
//          Notes, drawing, practice, the daily lesson, sync and classes are never locked.
// checkout: which plans are on sale. Payments go through Stripe; the price IDs live on Netlify
//          (STRIPE_PRICE_MONTHLY and so on, see the README), not in this file. Change a plan to true
//          once its price ID is set. false shows a "Notify me" waitlist instead of a Buy button.
// price:   the prices shown in the app. Change them here if you change them in Stripe.
// passDays: how long a semester pass lasts. Must match PASS_DAYS on Netlify (default 150).
// examDays: how long an exam pass lasts. Must match EXAM_DAYS on Netlify (default 60).
// centre:  the licence teachers and tuition centres buy for their classes (Classes → Bondline for teachers).
//          price is per student and must match the Stripe price. days must match CENTRE_DAYS on Netlify
//          (default 150). checkout: false takes orders by email and invoice only.
// streak:  what the free plan gets in Daily practice. Pro has no lesson limit.
window.BONDLINE_PRO = {
  enforce: true,
  checkout: {
    monthly: false,   // monthly subscription
    semester: false,  // semester pass
    exam: false       // exam pass
  },
  price: { monthly: 'US$4', semester: 'US$19', exam: 'US$9' },
  passDays: 150,
  examDays: 60,
  centre: { checkout: false, price: 'US$3', minSeats: 10, days: 150 },
  streak: { freeLessons: 3, freeFreezes: 1, proFreezes: 3, repairDays: 30 }
};

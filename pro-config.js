// Bondline Pro settings. Edit this file, then upload the site again.
//
// enforce: false = every Pro feature is free for everyone (preview).
//          true  = mock exams, the full weak-spot list, every course unit after the first three,
//                  the streak perks (extra daily lessons, more freezes, streak repair), and (from version 30)
//                  the reaction drill beyond substitution/elimination/addition, the route finder,
//                  printable reaction packs and the exam study plan need Pro.
//          The reaction map and achievements are free for everyone.
//          Notes, drawing, practice, the daily lesson, sync and classes are never locked.
// checkout: which plans are on sale. Payments go through Stripe; the price IDs live on Netlify
//          (STRIPE_PRICE_MONTHLY and so on, see the README), not in this file. Change a plan to true
//          once its price ID is set. false shows a "Notify me" waitlist instead of a Buy button.
// price:   the prices shown in the app now. Change them here if you change them in Stripe.
// sale:    an introductory price. Until sale.ends, the app and website show price (with the later
//          price crossed out and the end date). From sale.ends on, the later prices replace them by
//          themselves. The checkout switches Stripe prices at the same moment: set SALE_ENDS and the
//          STRIPE_PRICE_*_LATER price IDs on Netlify (see STRIPE_INTEGRATION_TODO.md). Keep the dates the same.
//          Monthly subscribers who join before the end keep the price they signed up at.
// passDays: how long a semester pass lasts. Must match PASS_DAYS on Netlify (default 150).
// examDays: how long an exam pass lasts. Must match EXAM_DAYS on Netlify (default 60).
// centre:  the licence teachers and tuition centres buy for their classes (Classes → Bondline for teachers).
//          price is per student and must match the Stripe price. days must match CENTRE_DAYS on Netlify
//          (default 150). checkout: false takes orders by email and invoice only.
// streak:  what the free plan gets in Daily practice. Pro has no lesson limit.
window.BONDLINE_PRO = {
  enforce: true,
  checkout: {
    monthly: true,   // monthly subscription
    semester: true,  // semester pass
    exam: true       // exam pass
  },
  price: { monthly: 'US$4', semester: 'US$19', exam: 'US$9' },
  sale: {
    ends: '2026-11-29T23:59:59+08:00',  // Sunday 29 November 2026, 11:59 pm Malaysia time
    label: 'Launch price',
    later: { monthly: 'US$8', semester: 'US$38', exam: 'US$18', centre: 'US$6' }
  },
  passDays: 150,
  examDays: 60,
  centre: { checkout: true, price: 'US$3', minSeats: 10, days: 150 },
  streak: { freeLessons: 3, freeFreezes: 1, proFreezes: 3, repairDays: 30 }
};
// Works out which prices apply right now. Nothing to edit below.
(function(c){var s=c.sale,end=s&&Date.parse(s.ends),L=(s&&s.later)||{};
  c.saleOn=!!(end&&Date.now()<end);c.saleEnds=end||0;c.was={};
  ['monthly','semester','exam','centre'].forEach(function(k){if(!L[k])return;
    if(c.saleOn){c.was[k]=L[k]}else if(end){if(k==='centre')c.centre.price=L[k];else c.price[k]=L[k]}});
  c.saleText=c.saleOn?(s.label||'Introductory price')+' until '+new Date(end).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kuala_Lumpur'}):'';
})(window.BONDLINE_PRO);

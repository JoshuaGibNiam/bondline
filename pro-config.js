// Bondline Pro settings. Edit this file, then upload the site again.
//
// enforce: false = every Pro feature is free for everyone (preview).
//          true  = mock exams, the full weak-spot list and every course unit after the first three need Pro.
//          Notes, drawing, practice, sync and classes are never locked.
// checkout: paste your Lemon Squeezy checkout links (Store → Products → Share).
//          Leave them empty to show a "Notify me" waitlist instead of a Buy button.
// price:   the prices shown in the app. Change them here if you change them in Lemon Squeezy.
// passDays: how long a semester pass lasts. Must match LEMON_PASS_DAYS on Netlify (default 150).
window.BONDLINE_PRO = {
  enforce: true,
  checkout: {
    monthly: '',   // e.g. 'https://bondline.lemonsqueezy.com/buy/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    semester: ''   // e.g. 'https://bondline.lemonsqueezy.com/buy/yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy'
  },
  price: { monthly: 'US$4', semester: 'US$19' },
  passDays: 150
};

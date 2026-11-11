# Bondline: organic chemistry notebook (version 27)

An installable web app for organic chemistry:

- **Notes:** write notes and draw structures, reactions and curly-arrow mechanisms. Open any drawing in 3D to watch the mechanism step by step. Export notes to PDF.
- **Naming:** IUPAC lessons and a quiz, with progress tracked per topic.
- **Chemistry tools:** templates, draw-from-name, molecule info, R/S and E/Z, predicted spectra, a reaction library, mechanism practice, resonance structures, a reaction builder and a formula calculator.
- **Accounts:** sign in with Google or with an email and password to sync notes and quiz progress across devices. Without signing in, everything is saved on that device only.

## Upload

Drag the whole `bondline-app` folder onto your Netlify site's **Deploys** page. Version 12 needs updated Firestore rules (see below) (`firestore.rules` is included in case you need it).

## Updating to version 12: one extra step in Firebase

Version 12 needs **new Firestore security rules** for shared notebooks and your own glossary terms. Without them, shared notebooks won't work and custom glossary terms won't sync (everything else keeps working).

1. Upload the `bondline-app` folder to Netlify as usual.
2. Open the [Firebase console](https://console.firebase.google.com/) → your Bondline project → **Firestore Database** → **Rules**.
3. Replace everything there with the contents of `firestore.rules` from this folder, and press **Publish**.
4. Check that your domain is allowed: **Authentication** → **Settings** → **Authorized domains** should list `bondline.site` (and any test address you use).

To check the rules, use the **Rules Playground** button on the Rules page:
- Signed in as any user, a `get` of `/users/<that user's id>/notes/test` is **allowed**, and of `/users/someone-else/notes/test` is **denied**.
- A `create` of `/notebooks/abc` is **allowed** when the data has `owner` and `memberIds` set to your own id, and **denied** when `owner` is someone else.

## New in version 27: teaching tools

Everything is in **Classes**.

- **My quizzes.** Teachers write their own questions (multiple choice, true or false, short answer, or a number with an allowed error and a unit), each with an optional structure drawn from a name or SMILES, $maths$, an explanation and a topic tag. They can mix in any of Bondline's 1,144 questions (naming, spectra, stereochemistry and every course unit, filtered by course), or **paste in** questions they already have (“A)” options, “*” or “Answer: B” for the right one, “Explanation:” and “Topic:” lines). Quizzes are saved in the new `quizzes` collection.
- **Set anything as class work.** New assignment types: one of my quizzes; a paper of Bondline's questions from chosen topics or course units (picked once, so every student gets the same questions); a drill (rounds of SN1/SN2/E1/E2, R/S or IR); a flashcard deck from the teacher's notes. Quizzes run in **Practice** (feedback after each question) or **Test** mode (marked when handed in), with an optional time limit, attempt limit, and a choice of when answers are shown.
- **Insights.** For each quiz: the share of students who got each question right on their first try, which options they chose, common wrong typed answers, time taken and how often students left the page. Across the class: the weakest topics, with one click to set a practice quiz on them. Results show attempts, time, late work and a ✓ for server-marked scores; click a student for every answer. Two CSV downloads: scores, and answers question by question.
- **Worksheets.** Print any quiz, or any assignment, with name/class/date boxes, optional working space and an answer key with explanations on a separate page. **Join slips** print the class code eight to a page.
- **Live quizzes.** The teacher's screen shows a 6-digit PIN; students join on their phones (`bondline.site/?live=PIN`), answer against the clock (500 to 1,000 points for a right answer, more for faster), and see a leaderboard after each question. The host can download the results. Games live in the new `live` collection and are deleted when the host closes them.
- **Co-teachers.** The class owner makes a teacher code (People tab). Another teacher types it in the Join box, or opens `bondline.site/?teach=CODE`. Co-teachers can set work, see every result and manage students; only the owner can delete the class.
- **Class notebooks.** Link a shared notebook to a class (Notebooks tab) and every student is added as a reader (or editor), including students who join later; co-teachers are added as editors. Shared notebooks now hold up to 320 people.
- **Class-only accounts.** Students without an email address, or under 13, can join a class or a live quiz with a first name and an initial. This uses Firebase **anonymous sign-in** (see step 2). The account lives on that device. The under-13 screen now offers this too.
- **Free Pro for teachers.** Teachers ask from Classes → Free Pro for teachers (`teachers` collection). The admin page has a new **Teachers** tab to approve a request (Pro for a year), decline it, give Pro to any user ID, and set **class passes**: a number of Pro seats per class for a teacher's students, for centres that pay. Students in those classes get Pro while they're enrolled.
- **Quizzes marked on the server.** For quizzes made only of a teacher's own questions, the teacher can tick **Mark on the server**. The answers are stored in `classes/{class}/keys/{assignment}`, which students can't read, and the new function `netlify/functions/grade-quiz.mjs` marks the answers and writes the result. Other results are still worked out in the student's browser, so treat those as practice records.
- Service worker version is `bondline-v27-1`.

### Uploading version 27 (four steps)

1. **Firestore rules (required).** Firebase console → Firestore Database → **Rules**, paste the new `firestore.rules`, press **Publish**. Without this, quizzes, live games, co-teachers and the teacher plan won't save. If Publish shows an error, nothing changes; send the message to Claude.
2. **Turn on anonymous sign-in** for class-only accounts: Firebase console → **Authentication → Sign-in method → Add new provider → Anonymous → Enable**. Until you do, students who try it see “Class-only accounts aren’t switched on for this site yet.” Everything else works.
3. **Upload the folder** to Netlify as usual.
4. **Optional: server marking.** The `grade-quiz` function runs only when the site is deployed from GitHub or the Netlify CLI (like the payments webhook), and uses the same three variables: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`. Until it's running, the “Mark on the server” box is greyed out with a note explaining why.

### Checking the rules in the Rules Playground
- `get` on `/classes/<a class id>` as a co-teacher (their uid in `teacherIds`) → **allowed**; as someone else → **denied**.
- `create` on `/classes/<id>/results/<assignment>_<uid>` for an assignment whose `opt.secure` is `true` → **denied** (only the server writes those).
- `get` on `/classes/<id>/keys/<assignment>` as a student → **denied**; as the teacher → **allowed**.
- `update` on `/teachers/<your uid>` setting `st` to `ok` as yourself → **denied**; as an admin → **allowed**.

### Things to know
- Class-only accounts store a first name and initial, never an email. A student who logs out or clears their browser can't get back in; the teacher can remove the old account and the student joins again. Under-13 use is the school's or teacher's responsibility (the join screen says so). This is a reasonable baseline, not legal advice; check COPPA or GDPR rules if you expect many young users.
- Insights use each student's **first** attempt. The results table shows the best.
- Live quizzes and server marking need the app version on each phone to match the host's; old versions are asked to reload.
- No Firestore indexes are needed: every new query uses a single field.

## New in version 26

- **Reaction guide:** the reaction library now opens on **All reactions (230)**, grouped by functional group (alkanes to sugars and amino acids). Each entry has the reagents, a drawn scheme, key points and, where one exists, a link to the full curly-arrow mechanism. The 41 mechanisms are under the **Mechanisms** tab. The data is in the new file `guide-data.js`; every structure and atom balance was checked with RDKit. `/?rx=<id>` opens an entry (ids start with `g-`).
- **Back button:** in the left menu, and at the top on phones. It returns to the previous section or note and closes an open dialog first. The browser or phone back gesture does the same. The Bondle page has a Back button too.
- **Fused and spiro rings** (naphthalene, steroids, indoles, epoxides on rings) now draw as regular rings everywhere structures are drawn from a name or SMILES.
- Service worker version is `bondline-v26-1`. No Firebase changes are needed.

## New in version 25

- **Study** (new item in the left menu, `?study=today|timer|tasks|schedule|exams|goals`): the planning and focus tools students use most, built into Bondline.
  - **Today:** focus minutes against your daily goal, your streak, this week's total, the next exam countdown, tasks due today, today's timetable, and a one-tap focus button.
  - **Focus timer:** Pomodoro (focus/short break/long break, all adjustable, optional auto-start), stopwatch and countdown. It keeps running across the app (a small timer pill appears in the corner) and through reloads, because it stores timestamps. It shows the time in the tab title, chimes, can send a notification when the tab is in the background, and can play rain, brown or white noise (generated in the browser, no audio files). Space starts and pauses it.
  - **Tasks:** due dates, priorities, subjects, subtasks, overdue/today/upcoming groups, and ▶ to start a focus session linked to a task. Focus time is added to each task. Course unit pages have an **Add to my study plan** link that creates a task with a subtask for each lesson, the exam-style question and the quiz.
  - **Timetable:** repeating weekly study blocks (a week grid on desktop, a day list on phones).
  - **Exam countdown**, plus **Goals and stats:** daily and weekly focus goals, current and best streak, a 16-week heatmap, time by subject, and custom counter goals.
  - The Home page gets a "Study today" card.
- Data is saved on the device (`bondline.study` in localStorage). When signed in, it syncs to the `_study` document in the user's existing notes collection (the same place as `_quiz`), so you need to **publish the updated `firestore.rules`** (it adds a rule for `_study`). Until you do, everything still works on the device; it just won't sync.
- Service worker version is `bondline-v25-1`.

## New in version 24

**Before you upload: Pro is now switched on.** `pro-config.js` has `enforce: true`, so units 4 onwards of every course, mock exams and the full weak-spot list need Pro. There are no checkout links in `pro-config.js` yet, so people see a **Notify me** waitlist button instead of a Buy button. Paste your two Lemon Squeezy links into `checkout` when you're ready to sell. To go back to "free while in preview", set `enforce: false`.

- **Four more courses:** AP Chemistry (6 units: CED Units 1–2 and the start of 3), IB Diploma Chemistry (18 units, SL and HL), JEE Main (20 units) and NEET UG (20 units). All seven courses now share one set of lessons (`PU_UNITS` plus the per-course maps in `PU_EXT` in `app.js`). A section or question tagged `only:'sjn'` appears only in the courses whose letters it lists: `a` Cambridge, `s` STPM, `p` AP, `i` IB, `j` JEE, `n` NEET (NEET reuses the JEE syllabus points).
- **New lessons and units:** photons and the photoelectric effect, Bohr model and quantum numbers, PES and Coulomb's law, electron affinity, formal charge and resonance, lattice energy and alloys, molecular orbital theory, sp³d/sp³d² and dipole moments, types of solid, reaction intermediates and hyperconjugation, conformations, the peroxide effect, alkynes, aromaticity, NCERT halogen, alcohol, ether, phenol, carbonyl, acid and amine chemistry, IHD. New units: *Purifying and analysing organic compounds*, *Biomolecules* and *Named reactions* (JEE and NEET). 110 new questions (302 in the shared lessons).
- **Drills** (new Practice tab, `?drill=mech`, `?drill=rs`, `?drill=ir`): SN1/SN2/E1/E2 decisions checked by the predictor; R/S on a random 3D model; tap-the-peak and match-the-spectrum IR. Best streaks are kept on the device.
- **7 new mechanisms** in the library (alcohol + HCl SN1, nitrile and amine formation, alcohol dehydration, phenol bromination, azo coupling, Cannizzaro), each with its own page under `/reactions/` (added to `sitemap.xml` and the reactions index).
- **Predictor:** Wurtz, Fittig, Wurtz–Fittig, Swarts, Finkelstein, AgCN/AgNO₂, Rosenmund, Stephen, Etard, Gattermann–Koch, Reimer–Tiemann, Kolbe, phenol + Zn, Cannizzaro, 2,4-DNP, semicarbazide, Fehling's, Lucas, Al₂O₃ and Cu dehydration/dehydrogenation, distil vs reflux oxidation, iodoform on alcohols, HVZ, decarboxylation, Kolbe electrolysis, Hofmann bromamide, carbylamine, Hinsberg, HNO₂ on aliphatic amines, bromine water on phenol/aniline.
- **Age check:** before signing in or creating an account, Bondline asks for month and year of birth (not stored). Under 13: no account, usage statistics off on that device, and the feedback form hides the email field. The privacy policy and terms say so. This is a reasonable baseline, not legal advice: if you expect many users in the US (COPPA) or EU (GDPR sets 13–16 by country), check with a lawyer.
- Nothing to change in Firebase. Service worker version is `bondline-v24-1`.

## New in version 23

- **Two new courses** in the Courses tab, next to IChO: **Cambridge International A Level Chemistry (9701)**, 22 units, and **STPM Chemistry (962)**, 21 units. The tab opens on an "All courses" page; switch courses with the IChO / A Level / STPM buttons at the top of the course list.
- **Shared lessons.** Both courses use the same 22 units (`PU_UNITS` in `app.js`): six on atomic structure, orbitals, ionisation energy, bonding, shapes and intermolecular forces, then all of the organic chemistry. A lesson or question tagged `only:'a'` shows in 9701 only, `only:'s'` in STPM only. Spectroscopy and chromatography are A Level only (STPM has none). Each unit shows its own syllabus points and references for each course. Physical and inorganic chemistry are left for a later version.
- **192 new questions**, each with an explanation, plus an exam-style question with worked answers in every unit. They appear in Progress as "A Level / STPM" and in mock exams. Units 1–3 of each course are free; the rest are Pro (free for everyone while Pro is in preview).
- **Links.** `bondline.site/?course=cie` and `?course=stpm` open a course; add `&unit=pu-oh` (for example) to open one unit. `?course=icho` and the old IChO links still work.
- Nothing to change in Firebase for this version. Upload the files as usual (the service worker version is now `bondline-v23-1`).

## New in version 22

- **Bondle**, the daily chemistry and science puzzle, on its own page at **bondline.site/bondle** (the Bondle button and Home card in the app open it). Each day has six rounds: four chemistry, two from physics, biology, earth science or space. Rarer answers score more: 💧 Tap Water 10, 🧪 Lab Grade 25, ⚗️ Analytical 50, 💎 Rare Earth 75, ⚛️ One in a Mole 100. 30 seconds (60 with Extra time) and two tries per round. Total = "bond strength" in kJ/mol, with streaks, sharing, "you beat X% of today's players" and every answer revealed afterwards. The page also has past puzzles (the last 7 days, not counted for streaks), practice rounds (Chemistry, Science or Mixed), stats, a how-to-play box, a "suggest an answer" form and an FAQ for search engines. No sign-up needed.
- **No daily uploads.** `bondle-data.js` (90 chemistry prompts) and `bondle-science.js` (35 science prompts), about 4,800 accepted answers, are picked from automatically by `bondle-core.js`: no prompt repeats within two weeks. Typos are forgiven only when what was typed isn't itself another real answer (so "ethene" never counts as "ethane"). To set a day by hand, use the admin page → Bondle.
- **Admin dashboard** at `bondline.site/admin`: visitors, page views, where people came from (including Instagram/TikTok links), countries, devices, the most used features, each signed-in user's activity, a live activity feed, feedback inbox, Bondle results (including answers people tried that weren't accepted), the announcement bar and the Pro waitlist.
- **Send feedback** from the account menu, Settings → Help, the bottom of Home, or after a Bondle.
- **"How did you find Bondline?"** An optional one-tap card shown once, from someone's second visit. Answers appear on the admin page.
- **Announcement bar** at the top of the app, set from the admin page without uploading.
- **Usage statistics** in Bondline's own Firestore (no cookies, no third parties). People can turn it off in Settings → Privacy. The privacy policy explains it.

### Uploading version 22 (three steps, about 10 minutes)

1. **Firestore rules.** Firebase console → Firestore Database → **Rules**, paste the new `firestore.rules`, press **Publish**. Without this, nothing is recorded and the admin page shows "Missing or insufficient permissions".
2. **Create the admin login.**
   - Firebase console → **Authentication → Users → Add user**. Email: `bondlinenotes@gmail.com` (or another address you own). Choose the password. If your password policy requires a number, the password must contain one.
   - Copy the new user's **User UID** from the list.
   - **Firestore Database → Start collection** → ID `admins` → Document ID: paste the UID → add a field `role` (string) = `owner` → Save.
   - Open `bondline.site/admin`, type `admin` as the username and your password. ("admin" maps to the email set at the top of `admin/admin.js`; change it there if you used a different email. You can also type the full email, or use Google sign-in if the admin account is a Google account.) If you sign in with an account that isn't listed, the page shows its UID so you can add it.
3. **Upload the folder** to Netlify as usual.

Opening the admin page marks that browser as yours, so your own visits aren't counted.

### Tracking your reels
Add a source to links in your bio or stories: `bondline.site/?utm_source=instagram&utm_campaign=nmr-reel` (or `bondline.site/bondle?utm_source=tiktok`). Overview → Campaigns and "Where visits come from" show them, and each user's row shows the link they first came from.

### Free-tier limits
Firestore's free plan allows 50,000 reads and 20,000 writes a day. Each page view is one write; each app session a few more. The admin Overview reads every page view in the chosen range, so with heavy traffic, prefer "Today" or "Last 7 days".

## New in version 21

- **Courses tab** (Practice → Courses), starting with **IChO: organic and biological chemistry**: 15 units following the International Chemistry Olympiad syllabus (2020 revision). Units 1–9 are the core topics (structure and bonding, isomerism, reactivity, substitution and elimination, alkenes and alkynes, aromatic chemistry, carbonyl chemistry, polymers and surfactants, biomolecules); units 10–15 are the advanced topics (heterocycles and SNAr, stereoselectivity and conformational analysis, spectroscopy, proteins and enzymes, carbohydrates and nucleic acids, advanced polymers and supramolecular chemistry).
- **Every unit has:** the IChO syllabus points as a checklist, lessons with structures and tables, links into the mechanisms, Stereo lessons, spectra lessons and 3D models, an olympiad-style problem with answers to reveal part by part, and a quiz. 144 questions in all; they count towards Progress and can be chosen as a section in mock exams.
- **Free and Pro:** units 1–3 are free for everyone. Units 4–15 are part of Pro: while `enforce` is `false` in `pro-config.js` everyone gets them; when you set it to `true`, people without Pro see the unit's syllabus points and a button to Pro.
- **Deep links:** `bondline.site/?course=icho` opens the course, and `?course=icho&unit=u7` opens a unit (u1–u15).

### Uploading version 21
Upload the folder as usual. No Firebase changes.

## New in version 20

- **16 new guides** at /guides/ (25 in all): how to study organic chemistry, functional groups, drawing structures, resonance, naming compounds, esters and amides, types of reactions, organic vs inorganic, chiral centres, enantiomers vs diastereomers, meso compounds, Fischer projections, Newman projections, chair conformations, ¹³C NMR and mass spectrometry. Each has a "Quick answers" section and structured data for Google, and links to related guides and practice.
- **Search metadata:** guides are grouped by topic on /guides/, the sitemap has real "last changed" dates, titles and descriptions fit what Google shows, and the footer links to popular guides from every page.
- **Smaller updates for users:** fonts, icons and the sign-in and 3D libraries are kept between versions. The maths, PDF and PowerPoint libraries download the first time they're used, instead of on every update.
- **Browser caching** for fonts, icons, libraries and the guides' stylesheet (in `_headers`).
- **Payments webhook:** ignores subscription events that arrive out of order, so a late, older event can't overwrite a newer status.
- Fixed: tables on guide pages no longer make the page scroll sideways on phones.

### Uploading version 20
Upload the folder as usual. No Firebase changes. If payments are set up, deploy through GitHub or the Netlify CLI so the updated webhook goes live.

### After uploading
In Google Search Console, open **Sitemaps** and resubmit `sitemap.xml`, then use **URL inspection → Request indexing** on /guides/ and two or three of the new guides.

## New in version 19

- **Stereochemistry** (Practice → Stereo): nine lessons covering chirality, R and S, E and Z, meso compounds and isomer relationships, Fischer projections, conformations, optical activity and stereochemistry in reactions.
- **Interactive models:** a 3D R/S step-through (rank the groups, turn the lowest priority to the back, trace 1 → 2 → 3), a mirror-image demo that tries to superimpose a molecule on its mirror image, a 3D meso compound with its mirror plane, a cyclohexane chair with an animated ring flip, a Newman projection of butane with its energy curve, an E/Z builder and an interactive Fischer projection. The 3D models use the same viewer as the orbitals pages.
- **211 stereochemistry questions,** which count towards Progress and appear in mock exams. Every R/S, E/Z, chirality and relationship answer was checked with two independent engines: Bondline's own CIP code and RDKit.
- **More content:** 44 naming questions (137 in all), 14 synthesis problems (27 in all) and 31 glossary terms.
- **Fix:** clicking an answer in Spectra or Progress no longer also answers an unfinished naming quiz in the background.

Upload as usual. No Firebase or Netlify changes are needed.

## New in version 18

- **Progress tab** (Practice → Progress): accuracy, a 14-day activity chart, and every naming and spectra topic ranked weakest first, with one-click retries.
- **Mock exams:** timed papers of mixed naming and spectra questions (10, 20 or 40 questions). You can skip and flag questions; it marks the paper at the end, with a topic breakdown and every answer explained. **Fix my weak spots** builds a session from questions you got wrong.
- **Bondline Pro:** mock exams, the full weak-spot ranking and weak-spot practice are Pro features. **The paywall is off**, so everything is free while Pro is in preview, and existing features are never locked.
- **New public pages:** `/pricing/`, `/about/`, `/contact/` and `/terms/` (terms of service and refund policy), plus a shared footer on every public page. The privacy policy has a new section on payments.

### Uploading version 18

1. Upload the folder to Netlify as usual. The app, the new pages and the waitlist all work straight away.
2. In Firebase → Firestore Database → **Rules**, paste the new `firestore.rules` and press **Publish**. It adds two collections: `entitlements` (Pro status, which only the server can write) and `waitlist`.

Until you set up payments (below), the Pro window shows **Notify me** buttons. Signed-in people who press one are saved in Firestore under `waitlist`, so you can see how many people want Pro before you charge anything.

### Turning on payments (when you're ready)

Payments use **Lemon Squeezy** as merchant of record: it charges the card, adds and pays sales tax/VAT, and sends receipts. A small server function, `netlify/functions/lemon-webhook.mjs`, tells Bondline who has paid.

**Step 1: deploy from GitHub instead of drag and drop.** Netlify only runs server functions for sites deployed from Git or the Netlify CLI. Put this folder in a GitHub repository, then in Netlify open **Site configuration → Build & deploy → Link repository** and pick it. There's no build command; `netlify.toml` already says to publish the folder as it is. After that, every push to GitHub updates the site.

**Step 2: create the products in Lemon Squeezy.** Sign up at lemonsqueezy.com, finish the store activation (it asks for your website, which needs the `/terms/` and `/pricing/` pages, already included), then create one product, **Bondline Pro**, with two variants:
- *Monthly*: subscription, US$4, billed every month.
- *Semester pass*: single payment, US$19.

For each variant, set the **Confirmation modal → Button link** (the "redirect after purchase" setting) to `https://bondline.site/?app&pro=thanks`.

**Step 3: get a Firebase service-account key.** In Firebase → Project settings → **Service accounts** → **Generate new private key**. A JSON file downloads. Keep it secret; never put it in the folder or on GitHub.

**Step 4: add environment variables in Netlify** (Site configuration → Environment variables):

| Name | Value |
|---|---|
| `LEMON_WEBHOOK_SECRET` | A long random password you make up (you'll paste the same one into Lemon Squeezy) |
| `FIREBASE_PROJECT_ID` | `project_id` from the JSON file |
| `FIREBASE_CLIENT_EMAIL` | `client_email` from the JSON file |
| `FIREBASE_PRIVATE_KEY` | `private_key` from the JSON file, the whole thing, including the BEGIN and END lines |

Redeploy afterwards (Deploys → Trigger deploy) so the function sees them.

**Step 5: create the webhook in Lemon Squeezy.** Settings → **Webhooks** → add:
- URL: `https://bondline.site/api/lemon-webhook`
- Signing secret: the same value as `LEMON_WEBHOOK_SECRET`
- Events: `order_created`, `order_refunded`, `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_resumed`, `subscription_expired`, `subscription_paused`, `subscription_unpaused`

**Step 6: paste the checkout links** into `pro-config.js` (Products → each variant → Share → copy the checkout link) and push to GitHub. The Pro window now shows **Continue to checkout**. Bondline adds the person's account ID to the link, so their payment is matched to their account automatically.

**Step 7: test it.** Turn on Lemon Squeezy's **Test mode**, buy with the test card `4242 4242 4242 4242`, and check that Pro switches on within a few seconds and that Firestore has a document in `entitlements`. Lemon Squeezy's webhook page shows each delivery and its response. Turn test mode off when it works.

**Step 8: start charging.** In `pro-config.js`, change `enforce: false` to `enforce: true`. Mock exams and the full weak-spot list then need Pro; everything else stays free. Change the prices in `pro-config.js` too if you change them in Lemon Squeezy.

To give someone Pro for free (a tester, a lecturer), add a document in Firestore at `entitlements/<their user ID>` with a number field `grantUntil` set to a date in milliseconds (for example `1830297600000` is 1 January 2028).

## New in version 17

- **Guided tour.** A walk-through that highlights the real buttons one at a time and waits for you to click them (or press *Do it for me*). It covers Home, a note, adding blocks, Present, Practice, Tools, Classes and the account menu, and works on phones. New visitors start it from the welcome screen or the *Next up* card on Home; anyone can replay it from the account menu or the command palette.
- **Simpler sidebar.** The icon bar now has four sections: **Home, Notes, Practice, Classes**. **Practice** holds Flashcards, Naming, Spectra, Synthesis and Orbitals as tabs along the top of the page (Bondline remembers the last tab). **Tools** opens a menu with the reaction predictor, reaction library, mechanism practice, glossary and quick reference. Trash, the guide, Settings and signing in are in one **account menu** at the bottom.
- **New Home page.** A greeting, one search box for notes (including the text inside them), reactions, lessons and tools, a **Next up** card that suggests one thing to study with progress bars for naming, spectra and synthesis, and your recent notes.
- **What's new.** An update log in the account menu. After an update, a red dot on the account button and a short message point to it.
- No Firebase or Search Console changes are needed for this version. Just upload the folder.

## New in version 16

- **Lecture mode.** Press the screen icon at the top of a note (or **Export → Present**) to show it full screen as slides. Each heading starts a slide. Curly arrows appear one at a time as you click, so you can talk through a mechanism. Keys: → / Space / clicker next, ← back, **B** black screen, **W** white screen, **L** laser pointer, **D** draw on the slide, **C** clear, **T** light/dark, **F** full screen, **Esc** exit. **Build** reveals points one at a time.
- **PowerPoint export.** **Export → PowerPoint slides (.pptx)** makes a deck from the note: headings become slide titles, text keeps bold, italics, subscripts and lists, drawings and images become pictures, and flashcards become a table. The note text goes in the speaker notes.
- **Synthesis problems** (new **Synthesis** icon on the left). 13 multi-step problems at three levels. Pick the reagents for each step; wrong choices explain what they'd make instead. **Add this route to a note** draws the whole route.
- **Classes** (new **Classes** icon). A lecturer makes a class and shares its code or invite link (`bondline.site/?class=CODE`). They set naming quizzes, spectra practice, mechanism practice or synthesis problems, and see each student's best score, with a class average and a CSV download. Students see the work set and their own scores only.
- **Study tips** on Home, after quizzes, after mechanism practice and in Synthesis and Classes.
- **Guides and reaction pages for search engines.** 9 guides at `/guides/` (SN1 vs SN2, naming alkenes, E/Z, R/S, NMR splitting, IR table, curly arrows, Markovnikov's rule, reagents cheat sheet) and a page for each of the 34 library reactions at `/reactions/`, with the mechanism drawn. The landing page links to them and `sitemap.xml` lists all 47 pages.
- **Links into the app:** `/?rx=sn2` opens a reaction, `/?practise=sn2` starts practising it, `/?synth` opens Synthesis, `/?class=CODE` opens Classes with the code filled in.

### Updating to version 16: one extra step in Firebase

Classes need **new Firestore security rules**. Without them, everything else works but classes can't be created or joined.

1. Upload the `bondline-app` folder to Netlify as usual.
2. Firebase console → **Firestore Database** → **Rules**. Replace everything with the contents of `firestore.rules` from this folder and press **Publish**. (If Publish shows an error, nothing changes; send the message to Claude.)
3. Check the rules in the **Rules Playground** (with **Authenticated** on):
   - `create` on `/classes/test1` with data `{"name":"Test","owner":"<your uid>","ownerName":"Me","code":"ABCD2345","memberIds":[],"at":1}` → **allowed** when the playground uid matches `owner`, **denied** otherwise.
   - `get` on `/classCodes/ABCD2345` → **allowed**; `list` on `/classCodes` → **denied**.

Things to know about classes:
- Scores are worked out in the student's browser, so a determined student could fake one. Treat them as practice records, not exam marks.
- Students' names and emails are stored in `classes/{class}/members/{student}`, readable only by the lecturer and that student.

### Google Search Console after this update

In Search Console → **Sitemaps**, submit `sitemap.xml` again so Google picks up the 45 new pages. Then use **URL inspection** → **Request indexing** for `https://bondline.site/guides/` and `https://bondline.site/reactions/`. Google will find the rest from those.

## New in version 15

- **Landing page.** First-time visitors (and search engines) now see an animated page about Bondline before the notebook opens: a self-drawing molecule, an S<sub>N</sub>2 mechanism that plays as you scroll, sideways-scrolling feature cards, and a FAQ. Returning users, the installed app, share links and invite links skip it and go straight to the notebook. To see it again, open `bondline.site/?about`, or use the **About** link at the bottom of ⚙ Settings.
- **Small animations around the app.** Pages fade in when you switch sections, dialogs and menus pop in, toasts slide up, and buttons respond when pressed. All animations switch off if the device is set to reduce motion.
- **Privacy policy** at `/privacy/`, linked from the landing page and ⚙ Settings.
- **Search engine set-up.** New page title and description, a social-media preview image (`og-image.png`), structured data, `robots.txt` and `sitemap.xml`.
- Fixed: opening a page other than the app (such as the privacy policy) no longer replaces the app's offline copy.

### Before you upload version 15

1. Upload the `bondline-app` folder to Netlify as usual. No Firebase changes are needed.

### Google Search Console (one-time, about 10 minutes)

1. Go to [search.google.com/search-console](https://search.google.com/search-console), choose **Add property → Domain**, and type `bondline.site`.
2. Google shows a **TXT record**. In Netlify, open **Domains → bondline.site → DNS settings → Add new record**, choose type **TXT**, leave the name blank (or `@`), paste the value, and save. Back in Search Console, press **Verify**. It can take a few minutes to an hour.
3. In Search Console, open **Sitemaps** and submit `sitemap.xml`.
4. Open **URL inspection**, enter `https://bondline.site/`, and press **Request indexing**. Do the same for `https://bondline.site/privacy/`.
5. Optional: in [Bing Webmaster Tools](https://www.bing.com/webmasters), choose **Import from Google Search Console**. This covers Bing, DuckDuckGo and Copilot too.

Check back after a week or two: **Pages** shows whether Google indexed the site, and **Performance** shows the searches people found it with.

### The old bondline.netlify.app address

The landing page tells search engines that `bondline.site` is the main address. `_redirects` contains a line that would send every visit to `bondline.netlify.app` on to `bondline.site`, but it is switched off: notes saved **without an account** on the old address live in that address's browser storage and would not appear on the new one. Once anyone still using the old address has signed in (or moved over), remove the `#` from that line.

## New in version 14

- **Spectra**: lessons on IR, ¹H NMR, ¹³C NMR and mass spectrometry, with drawn example spectra, and a practice mode with hundreds of questions built from about 40 compounds. Progress syncs with your account.
- **Orbitals**: diatomic MO diagrams with bond order and magnetism, Hückel π molecular orbitals for conjugated chains and aromatic rings, and 3D atomic, hybrid and molecular orbitals you can rotate.

## New in version 13

- A slim bar of icons down the left edge switches between Home, Notes, Cards and Naming, and opens the reaction predictor, glossary, trash, guide and settings. Hiding the sidebar (Ctrl+\) keeps this bar.
- Folders, Shared and Tags are now sections you can fold away. Bondline remembers which ones you keep open.
- Fixed: the sync status no longer overlaps the last note on short screens, tags wrap instead of being cut off, and the Home card no longer runs past the edge.
- Calmer look: one accent colour, quieter tags, simpler note list, and a Home page with a smaller greeting and a Study today strip.

## New in version 12

**Glossary**
- Over 300 built-in terms: solvents (DMSO, THF, DMF…), reagents (LiAlH₄, PCC, mCPBA, LDA…), abbreviations (Et, Ts, Boc…), concepts (nucleophile, enolate, Zaitsev's rule…) and named reactions (SN2, aldol, Diels–Alder…).
- Terms in your notes are highlighted. Hover over one (or tap it on a phone or tablet) to see a definition card, with a structure for solvents and reagents.
- Open the glossary from Home, the command palette (Ctrl K) or ⚙ Settings. Search it, filter by type, and **add your own terms**; they highlight in your notes too and sync with your account.
- ⚙ Settings → Glossary: highlight every mention, only the first in each note, or turn highlighting off.

**Reaction predictor**
- Open it from Home, the command palette, or **Predict reaction** at the bottom of a note. Type a starting material (name or SMILES, or pick a molecule from the selected drawing) and the reagents, e.g. `NaOEt, EtOH, heat` or `1. BH3·THF 2. H2O2, NaOH`.
- For alkyl halides it weighs **SN1, SN2, E1 and E2** (substrate, nucleophile/base, solvent, heat), shows which wins and why, and draws the major and minor products, including Zaitsev vs Hofmann alkenes.
- It also predicts additions to alkenes and alkynes (Markovnikov, anti-Markovnikov, syn/anti), carbocation rearrangements, oxidations and reductions, Grignard, Wittig, acetal, imine, enamine, aldol and Claisen reactions, acid derivative reactions, alcohol reactions, epoxide opening, aromatic substitution with directing effects, Sandmeyer reactions and more.
- **Add to note** inserts the reaction as an editable drawing; **Mechanism** opens the matching entry in the reaction library.

**Shared notebooks** (installed app, signed in)
- Press **+** next to **Shared** in the sidebar to make a notebook, then invite people **by email** (they see the invitation in their sidebar after signing in with that email) or with an **invite link**.
- Each person **can edit** or **can only view** (viewers can still comment). Only the owner can invite, remove people or delete the notebook.
- Changes appear live. Two people can edit different paragraphs or drawings of the same note at once; if both edit the same block, the last save wins.
- See who else is looking at a note; move notes in and out; viewers can **Copy to my notes**. Deleting a shared note keeps a copy in your Trash.
- Bondline doesn't send emails. Email invitations need a verified email address: Google accounts are verified automatically; email-and-password users can send themselves a verification email from the notebook's People window.

## New in version 11 (a calmer, roomier look)

- **Collapsible sidebar:** press the panel button next to the Bondline name (or `Ctrl` + `\`, `Cmd` + `\` on a Mac) to hide the sidebar and give your notes the whole screen. A small button at the top left brings it back. Bondline remembers your choice. On phones the sidebar stays a slide-out menu.
- **Clickable logo:** click the Bondline logo or name, at the top of the sidebar, to go straight to Home.
- **New Home page:** more white space and fewer things at once. A short greeting, four quick actions, one large "Continue" card, three recent notes, a Study section (flashcards and naming progress), your topics, and quieter links to the reaction library, mechanism practice and quick reference at the bottom. A brand-new account sees a "Start your first note" card and example notes instead.
- **New welcome screen:** first-time visitors see a single calm screen with two buttons (start a note, or open an example), a light/dark switch, and links to a 1-minute tour or to skip. People who have already used Bondline will not see it again. To preview it, open the app with `?welcome=1` on the end of the address, or press `Ctrl` + `K` and choose **Welcome page**.
- **Tidier sidebar:** more spacing, a shorter search box label, and no scrollbar on the topic chips.

## New in version 10

**Syncing**
- **Live sync:** a note you change on one device updates on your other open devices within a second or two, without reloading.
- **No lost edits:** if the same note was changed on two devices before they could sync (for example, one was offline), Bondline keeps the other device's version as the note and saves yours as a copy called "… (edited on this device)". A message tells you when this happens.
- **Clearer status** at the bottom of the sidebar: *Synced*, *Saving…*, *Offline · will sync later*, or *Saved* when you're not signed in. Hover over it for details.

**Chemistry**
- **Structure checks:** atoms that can't exist as drawn (a carbon with five bonds, Cl with two bonds, C²⁺, a triple bond in a small ring, atoms drawn on top of each other) get a dashed circle, and a "⚠ 1 problem" badge appears on the drawing. Click the badge for details. Turn checks off in ⚙ Settings → Drawing.
- **Resonance structures:** select a molecule or ion, then **More → Resonance structures**. Bondline draws every contributor, with the curly arrows linking them and the major contributors marked.
- **Reaction builder:** **Add reaction** at the bottom of a note. Type reactants and products as names, formulas or SMILES, choose the arrow, add reagents and conditions. Bondline checks that the atoms balance and can balance it for you, then adds it as an editable drawing.
- **Formula calculator:** **More → Formula calculator** (also a tab in Quick reference). Molar mass, % by mass, exact mass and degrees of unsaturation for formulas like CuSO₄·5H₂O or (NH₄)₂SO₄; mass ↔ moles; empirical and molecular formulae from % composition.
- **12 more reactions** in the library (34 in total): imine formation, acetals, Fischer esterification, Claisen condensation, Michael addition, bromination of benzene, Friedel–Crafts alkylation, epoxidation, acid-catalysed epoxide opening, LiAlH₄ reduction, aldol condensation and acyl chloride hydrolysis. Every step is checked with RDKit.

**PDFs**
- **Export PDF** now offers **Print or save as PDF**, which makes a PDF with real, selectable and searchable text and sharp vector drawings (choose "Save as PDF" as the printer), or **Download PDF (image)**, the old exact-look version.

**Tidier**
- The rarer chemistry tools sit in one **More ▾** menu in the drawing toolbar, the sidebar status is shorter, and zoom controls fade until you point at them.

## New in version 8 and 9

**Chemistry tools**
- **Predict spectra:** turn on CₓHᵧ for a drawing and press *Predict spectra* under a molecule: ¹H NMR signals (shift range, number of H, splitting), ¹³C NMR signals, main IR peaks and the molecular-ion pattern, including Cl/Br isotope peaks.
- **Reaction library (📖):** 22 core reactions with conditions and every mechanism step drawn with curly arrows. Add one to a note, then press 3D to watch it.
- **Mechanism practice (↷):** draw the curly arrows for each step and press Check. Bondline says which arrows are right, missing or extra.
- **Quick reference (▦):** periodic table, pKa table, functional groups and IR/NMR tables.

**Safety and convenience**
- **Trash:** deleted notes stay for 30 days (sidebar → Trash), with Undo straight after deleting.
- **History:** earlier versions of each note, saved on the device; preview and restore.
- **Images:** Add image, paste or drag pictures into a note. They're compressed and sync with the note.
- **Share:** read-only links to a note (signed-in users).
- **Command palette:** Ctrl+K (⌘K on a Mac) to jump to anything.

## New in version 7

- **Folders:** press **+** next to Folders in the sidebar. Folders can have subfolders. Drag a note onto a folder, or pick one from **▤** at the top of the note. Use **⋯** on a folder to rename or delete it.
- **Tags:** a note can now have several tags. Type in the Tags box and press Enter. Click a tag in the sidebar to filter.
- **Pin and sort:** ★ Pin keeps a note at the top; sort by Recent or A–Z. Search now also looks inside tags, flashcards and comments.
- **Flashcards:** a new **Cards** section, Flashcards blocks in notes, and **+ Card** to turn selected text into a card. Sides can hold text, $maths$ or a structure drawn from a name. Study sessions use spaced repetition (Again / Hard / Good / Easy).
- **Comments:** select text and press 💬 Comment (Ctrl+Alt+C), or 💬 on any block. Reply, resolve and delete in the Comments panel.

## New in version 6

- **Home page:** opens when you start Bondline. Pick up your last note, see recent notes, topics and naming progress, or start a note, whiteboard, quiz or the guide.
- **Guide:** a searchable how-to with every keyboard shortcut. Open it from Home, the sidebar ("Guide and shortcuts") or the ? card.
- **Document formatting:** click in text and the toolbar switches to text tools: headings, quotes, code, lists, alignment, text colour, highlighter and callout boxes (Key idea, Definition, Example, Watch out, Tip). Typing shortcuts work too: `#` heading, `-` list, `1.` numbered list, `>` quote, `---` divider.
- **Fonts:** Serif, Sans, Rounded, Handwriting, Classic and Typewriter.
- **Equations:** type LaTeX between `$…$` (or `$$…$$` for its own line), or press ∑x² / Ctrl+M for a live preview. `\ce{…}` writes chemical equations, e.g. `\ce{N2 + 3H2 <=> 2NH3}`. Works offline in the installed app.
- **Whiteboard and sketches:** add a Sketch to any note or start a New whiteboard. Pen (pressure-sensitive with a stylus), highlighter, shapes, arrows, eraser, full screen, and "Pen only" so fingers scroll on tablets.

## New in version 5

- **Appearance menu** at the bottom of the sidebar:
  - **Mode:** Light, Dark or Auto (follows your device).
  - **Colour scheme:** Copper Sulfate (blue and teal), Malachite (green and indigo), Potassium Flame (violet and amber) or Sodium Lamp (amber and blue). Each scheme has a main colour, a second colour (topic tags, R/S labels, quiz progress) and its own curly-arrow colour.
  - Your choice is remembered on each device.
- **Phones and tablets:** bigger buttons for fingers, easier tapping on atoms and bonds, and zoom controls (− 100% +) on the selected drawing. When zoomed in, tap ✋ to scroll around the drawing, and tap it again to keep drawing.
- **Accessibility:** screen readers announce what each drawing contains, and Windows high-contrast mode is supported.
- **Security:**
  - The new `_headers` file tells browsers to run only Bondline's own code and Google sign-in, and to refuse to load Bondline inside other websites.
  - New database rules check the shape and size of everything saved.
  - New passwords must be at least 8 characters.

## What's in this folder

| File | What it is |
|---|---|
| `index.html`, `app.js`, `boot.js` | The app itself |
| `landing.js` | Animations for the landing page |
| `guides/`, `reactions/`, `assets/site.css` | Public guide and reaction pages for search engines |
| `privacy/` | The privacy policy page |
| `robots.txt`, `sitemap.xml`, `og-image.png` | Help search engines and social media show Bondline |
| `_headers`, `_redirects` | Security settings and redirects that Netlify applies automatically |
| `firebase-config.js` | Your Firebase settings (already filled in) |
| `firestore.rules` | Database security rules to paste into Firebase |
| `manifest.webmanifest`, `sw.js` | Make the app installable and work offline |
| `icons/`, `fonts/`, `vendor/` | Icons, fonts, the PDF and PowerPoint tools, the 3D engine and the Firebase library |

## Updating from version 7 (do the steps in this order)

1. **Update the database rules first.** Firebase console → **Databases & Storage → Firestore → Rules**. Replace everything with the contents of `firestore.rules` from this folder and click **Publish**. Version 8 saves trash and share information and adds the rules for share links; with the old rules, deleting notes and sharing would fail.
2. **Upload the app.** Drag the whole `bondline-app` folder onto your Netlify site's **Deploys** page.
3. **Reload on every device.** Open the app online, close it fully and reopen it.

## Updating from version 6

1. **Update the database rules first.** Firebase console → **Databases & Storage → Firestore → Rules**. Replace everything with the contents of `firestore.rules` from this folder and click **Publish**. Version 7 saves folders, tags, pins and comments, and the old rules would block those saves.
2. **Upload the app.** Drag the whole `bondline-app` folder onto your Netlify site's **Deploys** page.
3. **Reload on every device.** Open the app online, close it fully and reopen it, so no device keeps editing with the old version.

## Updating from version 4

1. **Update the database rules (do this first).** In the Firebase console open **Databases & Storage → Firestore → Rules**. Replace everything with the contents of `firestore.rules` from this folder and click **Publish**.
2. **Upload the app.** On app.netlify.com open your Bondline site → **Deploys**, and drag the whole `bondline-app` folder onto the drop box.
3. **Reload.** Open the app online, close it fully and reopen it.

To check it worked, open the app, make a small change to a note, and look for the green "Saved to your account" status at the bottom of the sidebar.

## Recommended Firebase security settings (5 minutes)

All of these are in the Firebase console for your project.

1. **Password rules.** Authentication → **Settings** → **Password policy**. Turn on enforcement, set the minimum length to 8 and tick "Require numeric character".
2. **Email enumeration protection.** Authentication → **Settings** → **User actions**. Make sure **Email enumeration protection** is ticked, so nobody can use the sign-in box to find out which emails have accounts.
3. **Authorised domains.** Authentication → **Settings** → **Authorized domains**. Keep only `localhost`, `bondline-1b932.firebaseapp.com`, `bondline-1b932.web.app` and `bondline.netlify.app`. Delete anything else.
4. **Restrict the API key to your site.** Open **console.cloud.google.com**, choose the bondline-1b932 project, then **APIs & Services → Credentials**. Click the key named "Browser key (auto created by Firebase)".
   - Under **Application restrictions** choose **Websites** and add `https://bondline.netlify.app/*` and `https://bondline-1b932.firebaseapp.com/*`.
   - Click **Save**.

   The key is still public, as all Firebase web keys are, but other websites can no longer use it.
5. **Budget alert (optional).** In Google Cloud → **Billing → Budgets & alerts**, set a small budget such as $1 so you get an email if usage ever rises unexpectedly. The free Spark plan can't charge you, so this only matters if you ever upgrade.

## How accounts behave

- **First sign-in on a device:** notes and quiz progress already on that device are copied into the account.
- **Several devices:** sign in with the same account on each. Changes made elsewhere appear when you reopen the app or switch back to it.
- **Offline:** keep working. Changes upload when the connection returns.
- **Log out:** removes that account's notes from the device. If some changes haven't uploaded yet, Bondline asks you to reconnect first.
- **Forgot password:** use the link in the sign-in window to get a reset email.
- **iPhone or iPad home-screen app:** Google sign-in may open in a separate window. Email and password sign-in always works there.

## Updating the app later

If you change any files, edit the version near the top of `sw.js` (for example `bondline-v16` to `bondline-v17`) before uploading. Installed copies then pick up the update the next time they're opened.

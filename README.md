# Bondline: organic chemistry notebook (version 15)

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
| `privacy/` | The privacy policy page |
| `robots.txt`, `sitemap.xml`, `og-image.png` | Help search engines and social media show Bondline |
| `_headers`, `_redirects` | Security settings and redirects that Netlify applies automatically |
| `firebase-config.js` | Your Firebase settings (already filled in) |
| `firestore.rules` | Database security rules to paste into Firebase |
| `manifest.webmanifest`, `sw.js` | Make the app installable and work offline |
| `icons/`, `fonts/`, `vendor/` | Icons, fonts, the PDF tools, the 3D engine and the Firebase library |

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

If you change any files, edit the version near the top of `sw.js` (for example `bondline-v15` to `bondline-v16`) before uploading. Installed copies then pick up the update the next time they're opened.

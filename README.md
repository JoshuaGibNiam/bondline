# Bondline: organic chemistry notebook (version 10)

An installable web app for organic chemistry:

- **Notes:** write notes and draw structures, reactions and curly-arrow mechanisms. Open any drawing in 3D to watch the mechanism step by step. Export notes to PDF.
- **Naming:** IUPAC lessons and a quiz, with progress tracked per topic.
- **Chemistry tools:** templates, draw-from-name, molecule info, R/S and E/Z, predicted spectra, a reaction library, mechanism practice, resonance structures, a reaction builder and a formula calculator.
- **Accounts:** sign in with Google or with an email and password to sync notes and quiz progress across devices. Without signing in, everything is saved on that device only.

## Upload

Drag the whole `bondline-app` folder onto your Netlify site's **Deploys** page. Firestore rules are unchanged from version 9 (`firestore.rules` is included in case you need it).

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
| `_headers` | Security settings that Netlify applies automatically |
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

If you change any files, edit the version on the first line of `sw.js` (for example `bondline-v8` to `bondline-v9`) before uploading. Installed copies then pick up the update the next time they're opened.

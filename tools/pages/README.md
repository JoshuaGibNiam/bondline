# Page generators (Bondline v39)

Python scripts that build the static pages added in version 39. They need `pip install rdkit`.
Run them from this folder; each writes into the site folder two levels up.

- `gen_aa.py` → `/guides/amino-acids/` (data in `aa_data.py`)
- `gen_bio.py` → `/guides/biochemistry/`
- `gen_learn2.py` → all four `/learn/` lessons and `/learn/` (lesson text lives in `gen_learn.py` and `gen_learn2.py`; the animations are in `learn/<slug>/scenes.js`)
- `gen_nmr.py` → `lab/nmr/data.js` (samples, shifts and couplings; checks every H count)
- `gen_courses.py` → `/courses/` from `courses.json`, a snapshot of the app's course units. To refresh it, open `/?app&bltest`, run `copy(JSON.stringify(...))` over `window.__bl.COURSES` as in the script's field list, and save it here.
- `newrx.py` checks the 36 v39 reactions with RDKit and writes `newrx.json` (already merged into `guide-data.js`).

import os, sys
from blsite import head, LOGO, FOOTER, E, ROOT

NAVL = f'<nav class="nav" aria-label="Site"><a class="brand" href="/?about">{LOGO}Bondline</a><a class="l" href="/learn/">Lessons</a><a class="l" href="/guides/">Guides</a><a class="open" href="/?app">Open the notebook</a></nav>'


def step(key, tag, h, body):
    return f'<div class="lx-step" data-s="{key}"><div class="lx-card"><span class="lx-tag">{tag}</span><h2>{h}</h2>{body}</div></div>'


def chap(scene, title, steps):
    return f'<section class="lx-chap" data-scene="{scene}" data-title="{E(title)}" id="{scene}"><div class="lx-stage" aria-hidden="true"></div><div class="lx-steps">{"".join(steps)}</div></section>'


def btns(ctl, opts, on):
    return f'<div class="lx-row" data-ctl="{ctl}" role="group">' + ''.join(f'<button class="lx-btn{" on" if v == on else ""}" data-v="{v}" aria-pressed="{"true" if v == on else "false"}">{l}</button>' for v, l in opts) + '</div>'


def slider(ctl, label, lo, hi, val, st=1):
    return f'<div class="lx-ctl"><label for="c-{ctl}">{label} <output for="c-{ctl}"></output></label><input type="range" id="c-{ctl}" data-ctl="{ctl}" min="{lo}" max="{hi}" step="{st}" value="{val}"></div>'


def quiz(q, opts):
    return f'<div class="lx-quiz"><p><b>{q}</b></p><div class="lx-row" style="flex-direction:column">' + ''.join(f'<button class="lx-btn"{" data-ok" if ok else ""} data-why="{E(why)}">{t}</button>' for t, ok, why in opts) + '</div><p class="lx-fb" aria-live="polite"></p></div>'


def lesson(slug, title, desc, kicker, h1, lede, acc, chapters, end, about, pre=''):
    url = f"https://bondline.site/learn/{slug}/"
    out = head(url, title, desc, about=about, extra='<link rel="stylesheet" href="/assets/learn.css">\n')
    out = out.replace('<body>', f'<body class="lx-body" style="--acc:{acc}">')
    out += f'''<div class="lx-progress" aria-hidden="true"></div><nav class="lx-toc" aria-label="Chapters"></nav>
<header class="lx-hero">{NAVL}
  <p class="lx-kicker">{kicker}</p><h1>{h1}</h1><p>{lede}</p>
  <p class="lx-scrollhint">Scroll to start. Move the sliders and press the buttons as you go.</p>
</header>
<main>
{"".join(chapters)}
<section class="lx-end">{end}</section>
</main>
{FOOTER}
{pre}<script src="/learn/learn.js" defer></script>
<script src="/learn/{slug}/scenes.js" defer></script>
<script src="/assets/track.js" defer></script>
</body>
</html>
'''
    os.makedirs(f"{ROOT}/learn/{slug}", exist_ok=True)
    open(f"{ROOT}/learn/{slug}/index.html", "w", encoding="utf-8").write(out)


# ===================== SPECTROSCOPY =====================
spec = [
 chap('em', 'Light and energy', [
  step('intro', 'Chapter 1', 'Spectroscopy is listening to molecules', '<p>Shine energy at a molecule and it only absorbs the amounts that match something it can do: spin, vibrate or move an electron.</p><p>Measure which energies are absorbed, and you learn what the molecule is made of.</p>'),
  step('regions', 'Try it', 'Different light, different job', '<p>Pick a kind of radiation and watch what it does to the molecule.</p>' + btns('region', [('radio', 'Radio'), ('ir', 'Infrared'), ('uv', 'UV–visible')], 'ir') + '<p>Higher energy (shorter wavelength) can do bigger things: radio only flips nuclear spins, while UV moves electrons.</p>'),
 ]),
 chap('ir', 'Infrared', [
  step('spring', 'Chapter 2 · IR', 'A bond is a spring', '<p>Atoms joined by a bond vibrate like balls on a spring. Each bond absorbs infrared at its own frequency.</p>' + btns('bond', [('1', 'Single'), ('2', 'Double'), ('3', 'Triple')], '1') + '<p style="margin-top:12px">Atom bonded to carbon:</p>' + btns('atom', [('H', 'H'), ('C', 'C'), ('N', 'N'), ('O', 'O'), ('Cl', 'Cl')], 'H') + '<p>Stronger bonds and lighter atoms vibrate faster. That is why C–H and O–H are at the high end (above 2800 cm⁻¹) and C=O sits near 1700. (The numbers here come from a simple spring model, so they are close but not exact.)</p>'),
  step('spectrum', 'Read it', 'Reading an IR spectrum', '<p>Peaks point <b>down</b>, because the spectrum shows light that gets <b>through</b> (transmittance). Keep scrolling to sweep across ethanol’s spectrum.</p><h3>Look for:</h3><p><b>Broad O–H</b> at 3200–3550 (alcohol) or very broad 2500–3300 (acid).<br><b>Sharp C=O</b> at 1680–1750.<br><b>C–H</b> just below 3000.</p><p>Below 1500 is the fingerprint region: unique to each molecule but hard to assign by hand.</p>'),
  step('quiz', 'Check', 'What does this compound contain?', quiz('A strong, sharp peak at 1715 cm⁻¹, and nothing broad above 3000. Which group is present?', [
    ('C=O (a ketone or aldehyde)', True, 'A strong, sharp peak near 1715 is the classic C=O stretch. This is propanone.'),
    ('O–H (an alcohol)', False, 'An O–H would give a broad peak at 3200–3550, and there isn’t one.'),
    ('C≡N (a nitrile)', False, 'Nitriles absorb near 2250, in the triple-bond region.'),
    ('C=C (an alkene)', False, 'C=C is weaker and nearer 1650.')])),
 ]),
 chap('ms', 'Mass spectrometry', [
  step('ionise', 'Chapter 3 · Mass spec', 'Smash it and weigh the pieces', '<p>An electron beam knocks an electron off the molecule, making the <b>molecular ion M⁺</b>. Its m/z (mass ÷ charge, and the charge is +1) gives the relative molecular mass.</p><p>The ion often breaks up. Only charged pieces reach the detector. Scroll to fire the beam at 2-chloropropane.</p><p>The tallest peak is the <b>base peak</b>: the most stable fragment, here C₃H₇⁺ at 43.</p>'),
  step('iso', 'Try it', 'The M+2 peak gives halogens away', '<p>Chlorine and bromine each have two common isotopes, two mass units apart. That gives a second molecular ion peak at M+2.</p>' + btns('hal', [('none', 'No halogen'), ('Cl', 'One Cl'), ('Br', 'One Br'), ('Cl2', 'Two Cl')], 'Cl') + '<p>Learn the ratios: <b>3 : 1 means Cl</b>, <b>1 : 1 means Br</b>.</p>'),
  step('quiz', 'Check', 'Which halogen?', quiz('Peaks at m/z 136 and 138 are the same height. What does the molecule contain?', [
    ('One bromine atom', True, 'Equal M and M+2 peaks mean bromine (⁷⁹Br : ⁸¹Br ≈ 1 : 1). This is C₄H₉Br.'),
    ('One chlorine atom', False, 'Chlorine gives 3 : 1, not 1 : 1.'),
    ('Two chlorine atoms', False, 'Two Cl give three peaks, M : M+2 : M+4 = 9 : 6 : 1.'),
    ('No halogen', False, 'Without Cl or Br the M+2 peak would be tiny.')])),
 ]),
 chap('nmr', 'NMR', [
  step('spin', 'Chapter 4 · NMR', 'Hydrogen nuclei are tiny magnets', '<p>A ¹H nucleus has spin, so it behaves like a small bar magnet. Scroll to switch on a strong magnetic field, B₀.</p><p>The spins line up <b>with</b> the field (lower energy) or <b>against</b> it (higher energy). A pulse of radio waves with exactly the right energy flips them, and as they relax back they give off the signal.</p>'),
  step('shift', 'Try it', 'Chemical shift: who is next door?', '<p>Electrons around an H shield it from the field. An electronegative neighbour pulls electrons away, so the H is <b>deshielded</b> and appears further left (higher δ).</p>' + btns('x', [('H', 'H'), ('C', 'C'), ('N', 'N'), ('Cl', 'Cl'), ('O', 'O'), ('F', 'F')], 'O') + '<p>Shifts are measured in ppm from TMS (δ = 0). Typical: alkyl 0.9–1.7, next to C=O 2–2.7, next to O 3.3–4.5, alkene 4.5–6.5, aromatic 6.5–8, aldehyde 9–10.</p>'),
  step('split', 'Try it', 'Splitting: the n + 1 rule', '<p>Hydrogens on the <b>neighbouring carbon</b> split a signal. With n equivalent neighbours you get n + 1 peaks, in the ratios of Pascal’s triangle.</p>' + slider('n', 'Neighbouring H (n)', 0, 6, 3) + '<p>H on O and N usually don’t split or get split (they swap too fast), so an O–H is a singlet.</p>'),
  step('integ', 'Read it', 'Integration counts the hydrogens', '<p>The area under each signal is proportional to the number of H that make it. Scroll to draw the integration traces for ethanol.</p><p>Steps of 3 : 2 : 1 tell you CH₃, CH₂ and OH. Together with shift and splitting, that’s a full assignment.</p>'),
  step('quiz', 'Check', 'Solve the spectrum', quiz('C₃H₇Cl gives a 6H doublet at δ 1.5 and a 1H septet at δ 4.1. Which isomer is it?', [
    ('2-chloropropane, (CH₃)₂CHCl', True, 'Two equivalent CH₃ (6H) are split by one H into a doublet; that CH is split by six H into a septet and is deshielded by Cl.'),
    ('1-chloropropane, CH₃CH₂CH₂Cl', False, '1-Chloropropane would give three signals (3H, 2H, 2H), not two.'),
    ('Chloroethane', False, 'Chloroethane is C₂H₅Cl, and would give a triplet and a quartet.')])),
 ]),
]
spec_end = '''<h2>Now run a real experiment</h2><p>Load a tube into a 3D spectrometer, shim the magnet, record an FID and Fourier transform it into a spectrum you can click through.</p>
<a class="lx-cta" href="/lab/nmr/">Open the virtual NMR lab</a> <a class="lx-cta alt" href="/?app">Practise spectra in Bondline</a>
<p style="margin-top:28px"><a href="/guides/ir-spectroscopy-table/">IR table</a> · <a href="/guides/mass-spectrometry-fragmentation/">Mass spec fragments</a> · <a href="/guides/nmr-splitting-n-plus-1-rule/">The n + 1 rule</a> · <a href="/guides/13c-nmr-chemical-shifts/">¹³C shifts</a></p>'''

lesson('spectroscopy', 'Interactive spectroscopy lesson: IR, mass spec and NMR',
  'Learn IR, mass spectrometry and NMR by scrolling through interactive animations: vibrate bonds, smash molecules, flip spins and solve spectra.',
  'Interactive lesson · Spectroscopy', 'How molecules reveal themselves', 'IR, mass spec and NMR, one scroll at a time. Change the bonds, isotopes and neighbours yourself and watch the spectra respond.',
  '#ff9e8f', spec, spec_end, 'Spectroscopy')

if __name__ == '__main__':
    for extra in sys.argv[1:]:
        exec(open(extra).read())
    print('ok')

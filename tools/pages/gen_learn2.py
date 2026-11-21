from gen_learn import *

# ===================== STEREOCHEMISTRY =====================
st = [
 chap('chiral', 'Chirality in 3D', [
  step('hands', 'Chapter 1', 'Your hands are mirror images', '<p>Your left and right hands are mirror images, but you can’t stack one exactly on top of the other. Molecules can be like that too.</p><p>On the left is bromochlorofluoromethane, CHBrClF. On the right is its reflection. Drag nothing: they rotate on their own.</p><button class="lx-btn" data-act="super">Try to superimpose them</button>'),
  step('four', 'Try it', 'Four different groups = a chiral centre', '<p>A carbon with <b>four different groups</b> is a stereocentre. Its mirror image is a different molecule, called its <b>enantiomer</b>.</p><p>Swap the bromine for a second fluorine, then try again:</p>' + btns('sub', [('Br', 'H, Br, Cl, F'), ('F2', 'H, F, Cl, F')], 'Br') + '<button class="lx-btn" data-act="super" style="margin-top:10px">Superimpose</button><p>With two identical groups the mirror image can be turned to match: the molecule is <b>achiral</b>.</p>'),
  step('cip', 'Chapter 2 · R and S', 'Rank the groups (CIP rules)', '<p>To name each enantiomer, rank the four groups by the <b>atomic number</b> of the atom joined to the stereocentre. Higher atomic number = higher priority.</p><p>Br (35) > Cl (17) > F (9) > H (1). The gold numbers show the ranking.</p><p>If two atoms tie, compare the atoms attached to them, one layer further out, until there is a difference. Double bonds count their atom twice.</p>'),
  step('rs', 'Try it', 'Point the lowest group away, then follow 1 → 2 → 3', '<p>Scroll slowly: the molecule turns so that H (priority 4) points away from you. Then trace 1 → 2 → 3.</p><p><b>Clockwise = R</b> (rectus), <b>anticlockwise = S</b> (sinister).</p><p>Now look at the other enantiomer:</p>' + btns('which', [('A', 'Left molecule'), ('B', 'Its mirror image')], 'A') + '<p>Mirror images always have opposite labels.</p>'),
 ]),
 chap('polar', 'Optical activity', [
  step('polar', 'Chapter 3', 'Enantiomers rotate polarised light', '<p>Enantiomers have the same melting point, boiling point and NMR spectrum. The one physical difference: they rotate plane-polarised light by the same angle, in opposite directions.</p>' + btns('form', [('p', '(+) enantiomer'), ('m', '(−) enantiomer'), ('rac', 'Racemic 50 : 50')], 'p') + slider('c', 'Concentration', 0, 1, 0.5, 0.05) + '<p>A 50 : 50 (racemic) mixture shows no rotation. Note: R/S does not tell you the sign of rotation; that has to be measured.</p>'),
 ]),
 chap('ez', 'E/Z isomers', [
  step('ez', 'Chapter 4', 'E/Z: geometric isomers', '<p>There is no rotation around a C=C, so groups are locked on one side or the other. Rank the two groups on <b>each</b> carbon with the same CIP rules.</p><p>Tap to change a group:</p><div class="lx-row"><button class="lx-btn" data-act="tl">Top left</button><button class="lx-btn" data-act="bl">Bottom left</button><button class="lx-btn" data-act="tr">Top right</button><button class="lx-btn" data-act="br">Bottom right</button></div><p><b>Z</b>: the two higher priorities on the same side. <b>E</b>: on opposite sides. Cis/trans only works when each carbon has an H, which is why E/Z is the general system.</p>'),
 ]),
 chap('dia', 'Diastereomers', [
  step('dia', 'Chapter 5', 'Two stereocentres: enantiomers or diastereomers?', '<p>With two stereocentres there can be up to four stereoisomers. Each is drawn as a <b>Fischer projection</b>: horizontal bonds come towards you, vertical ones go back.</p>' + btns('mol', [('bc', '2-bromo-3-chlorobutane'), ('ta', 'tartaric acid')], 'bc') + '<p style="margin-top:10px">Pick two to compare:</p><div class="lx-row"><button class="lx-btn" data-act="b0">1</button><button class="lx-btn" data-act="b1">2</button><button class="lx-btn" data-act="b2">3</button><button class="lx-btn" data-act="b3">4</button></div><p>Every centre inverted = <b>enantiomers</b>. Only some inverted = <b>diastereomers</b>, which have different physical properties. Tartaric acid has a <b>meso</b> form: two stereocentres, but a mirror plane makes it achiral.</p>'),
  step('quiz', 'Check', 'Test yourself', quiz('(2R,3S)-2-bromo-3-chlorobutane and (2S,3S)-2-bromo-3-chlorobutane are…', [
    ('Diastereomers', True, 'Only one centre is different (C2), so they are stereoisomers that are not mirror images: diastereomers.'),
    ('Enantiomers', False, 'Enantiomers would need both centres inverted: (2R,3S) and (2S,3R).'),
    ('Identical', False, 'C2 is R in one and S in the other, so they are different compounds.'),
    ('Structural isomers', False, 'The atoms are joined in the same order; only the 3D arrangement differs.')])),
 ]),
]
st_end = '''<h2>Keep practising</h2><p>Bondline’s stereochemistry drills give you new molecules to label R/S and E/Z every day, free.</p>
<a class="lx-cta" href="/?app&practise=stereo">Practise R/S in Bondline</a> <a class="lx-cta alt" href="/learn/">More lessons</a>
<p style="margin-top:28px"><a href="/guides/r-and-s-configuration/">R and S guide</a> · <a href="/guides/e-z-vs-cis-trans/">E/Z vs cis/trans</a> · <a href="/guides/enantiomers-vs-diastereomers/">Enantiomers vs diastereomers</a> · <a href="/guides/meso-compounds/">Meso compounds</a> · <a href="/guides/fischer-projections/">Fischer projections</a></p>'''
lesson('stereochemistry', 'Interactive stereochemistry lesson: chirality, R/S, E/Z and diastereomers',
  'Spin a chiral molecule in 3D, try to superimpose it on its mirror image, assign R and S, rotate polarised light and sort out E/Z and diastereomers.',
  'Interactive lesson · Stereochemistry', 'Molecules in the mirror', 'Chirality, R and S, optical activity, E/Z and diastereomers, with a real 3D molecule you can watch from every side.',
  '#7fd1b9', st, st_end, 'Stereochemistry', pre='<script src="/vendor/three.min.js" defer></script>\n')

# ===================== BIOCHEMISTRY =====================
bio = [
 chap('zwit', 'Amino acids', [
  step('zw', 'Chapter 1', 'Amino acids are acids and bases at once', '<p>Every amino acid has an NH₂ (a base) and a COOH (an acid). In water they react with each other, so glycine exists as a <b>zwitterion</b>: + and − charges on the same molecule.</p>' + slider('ph', 'pH', 0, 14, 6, 0.1) + '<p>Low pH adds H⁺ (overall +1). High pH removes it (overall −1). At the <b>isoelectric point</b> the zwitterion dominates and the amino acid doesn’t move in an electric field.</p><p><a href="/guides/amino-acids/">Learn all 20 with flashcards →</a></p>'),
 ]),
 chap('peptide', 'Peptide bonds', [
  step('join', 'Chapter 2', 'Joining amino acids', '<p>Scroll to bring glycine and alanine together. The COOH of one and the NH₂ of the other react, losing water. The new C(=O)–NH link is a <b>peptide bond</b> (an amide).</p><p>This is a <b>condensation</b> reaction. Hydrolysis (acid, or enzymes in your gut) reverses it.</p>'),
  step('chain', 'Try it', 'Build a polypeptide', '<p>Add amino acids to the C-terminus:</p><div class="lx-row"><button class="lx-btn" data-act="add-G">Gly</button><button class="lx-btn" data-act="add-A">Ala</button><button class="lx-btn" data-act="add-S">Ser</button><button class="lx-btn" data-act="add-F">Phe</button><button class="lx-btn" data-act="add-K">Lys</button><button class="lx-btn" data-act="add-D">Asp</button><button class="lx-btn" data-act="add-C">Cys</button><button class="lx-btn" data-act="clear">Start again</button></div><p>n amino acids make n − 1 peptide bonds and release n − 1 waters.</p>'),
 ]),
 chap('fold', 'Protein structure', [
  step('primary', 'Chapter 3', 'Primary structure', '<p>The sequence of amino acids, held by covalent peptide bonds. Orange beads are hydrophobic side chains, green are polar and red are charged.</p>'),
  step('secondary', 'Keep scrolling', 'Secondary structure', '<p>The backbone coils into an <b>α-helix</b> (or folds into β-sheets), held by hydrogen bonds between the C=O of one amino acid and the N–H four further along.</p>'),
  step('tertiary', 'Keep scrolling', 'Tertiary structure', '<p>The whole chain folds up. Hydrophobic side chains pack into the middle, away from water. The shape is held by <b>hydrophobic interactions, hydrogen bonds, ionic bonds</b> and <b>disulfide bridges</b> (gold).</p>'),
  step('denature', 'Try it', 'Denaturation', '<p>Heat the protein:</p>' + slider('temp', 'Temperature', 20, 95, 37, 1) + '<p>Above about 60 °C the weak interactions break and the protein unfolds. The primary structure survives, but the shape, and so the function, is lost. Extreme pH does the same by changing the charges.</p>'),
 ]),
 chap('enzyme', 'Enzymes', [
  step('fit', 'Chapter 4', 'Enzymes are protein catalysts', '<p>Scroll to watch one cycle. The substrate binds in the <b>active site</b>, which closes around it (<b>induced fit</b>), strains its bonds and lowers the activation energy. The products leave and the enzyme is ready again.</p>'),
  step('mm', 'Try it', 'Michaelis–Menten kinetics', '<p>Change the substrate concentration and add an inhibitor.</p>' + slider('s', '[S]', 0.2, 20, 2, 0.2) + btns('inh', [('none', 'No inhibitor'), ('comp', 'Competitive'), ('non', 'Non-competitive')], 'none') + '<p><b>K<sub>m</sub></b> is the [S] that gives half of V<sub>max</sub>. A competitive inhibitor competes for the active site (more substrate overcomes it). A non-competitive one binds elsewhere and lowers V<sub>max</sub>.</p>'),
 ]),
 chap('dna', 'DNA', [
  step('pair', 'Chapter 5', 'Base pairing', '<p>DNA’s two strands are held together by hydrogen bonds between bases: <b>A with T</b> (2 H-bonds) and <b>G with C</b> (3). Build the new strand:</p><div class="lx-row"><button class="lx-btn" data-act="b-A">A</button><button class="lx-btn" data-act="b-T">T</button><button class="lx-btn" data-act="b-G">G</button><button class="lx-btn" data-act="b-C">C</button><button class="lx-btn" data-act="reset">Reset</button></div><p>The strands run in opposite directions (antiparallel). More G–C pairs make DNA harder to separate.</p>'),
  step('quiz', 'Check', 'Test yourself', quiz('A tripeptide is hydrolysed completely. How many water molecules are used?', [
    ('2', True, 'Three amino acids are joined by two peptide bonds, and each hydrolysis uses one water.'),
    ('3', False, 'There are only two peptide bonds in a tripeptide.'),
    ('1', False, 'One water breaks one peptide bond, and a tripeptide has two.'),
    ('0', False, 'Hydrolysis always uses water.')])),
 ]),
]
bio_end = '''<h2>Memorise the 20 amino acids</h2><p>Structures, codes and side-chain types, with flashcards that bring back the ones you miss.</p>
<a class="lx-cta" href="/guides/amino-acids/">Amino acid flashcards</a> <a class="lx-cta alt" href="/guides/biochemistry/">Read the biochemistry guide</a>'''
lesson('biochemistry', 'Interactive biochemistry lesson: amino acids, proteins, enzymes and DNA',
  'Slide the pH to see zwitterions, build a peptide, fold and denature a protein, run Michaelis–Menten kinetics with inhibitors and pair DNA bases.',
  'Interactive lesson · Biochemistry', 'The chemistry of life', 'Zwitterions, peptide bonds, protein folding, enzymes and DNA: the organic chemistry you already know, at work inside cells.',
  '#7be0a6', bio, bio_end, 'Biochemistry')

# ===================== MECHANISMS =====================
mech = [
 chap('sn2', 'SN2', [
  step('sn2', 'Chapter 1', 'SN2: one step, from the back', '<p>Scroll to play the reaction of bromoethane with hydroxide.</p><p>The nucleophile attacks the carbon from the side <b>opposite</b> the leaving group. The new bond forms while the C–Br bond breaks, in a single step through a crowded transition state.</p><p>Both reactants are in the slow step, so the rate is <b>second order</b>. The carbon’s configuration inverts, like an umbrella in the wind.</p>'),
 ]),
 chap('sn1', 'SN1', [
  step('sn1', 'Chapter 2', 'SN1: leave first, attack later', '<p>Scroll to play 2-bromo-2-methylpropane in water.</p><p><b>Step 1 (slow):</b> the C–Br bond breaks on its own, giving a planar <b>carbocation</b>. <b>Step 2 (fast):</b> the nucleophile adds to either face.</p><p>Only the halogenoalkane is in the slow step, so the rate is <b>first order</b>. A stereocentre would give a racemic mixture.</p>'),
 ]),
 chap('choose', 'SN1 or SN2?', [
  step('choose', 'Try it', 'Predict the mechanism', '<p>Choose the substrate, nucleophile and solvent:</p>' + btns('sub', [('me', 'Methyl'), ('p', 'Primary'), ('s', 'Secondary'), ('t', 'Tertiary')], 'p') + '<div style="height:8px"></div>' + btns('nu', [('strong', 'Strong Nu⁻'), ('weak', 'Weak Nu')], 'strong') + '<div style="height:8px"></div>' + btns('sol', [('aprotic', 'Polar aprotic'), ('protic', 'Polar protic')], 'aprotic') + '<p>The bars are a rough guide to which path wins, not measured rates.</p>'),
  step('quiz', 'Check', 'Test yourself', quiz('2-Bromo-2-methylpropane is warmed with water. Which mechanism, and what is the rate equation?', [
    ('SN1, rate = k[(CH₃)₃CBr]', True, 'Tertiary substrate + weak nucleophile + protic solvent: SN1, first order.'),
    ('SN2, rate = k[(CH₃)₃CBr][H₂O]', False, 'A tertiary carbon is too crowded for back-side attack.'),
    ('SN1, rate = k[H₂O]', False, 'The nucleophile is not in the slow step of SN1.'),
    ('SN2, rate = k[(CH₃)₃CBr]', False, 'SN2 is second order, and it does not happen at a tertiary carbon.')])),
 ]),
]
mech_end = '''<h2>Draw the curly arrows yourself</h2><p>Bondline checks every arrow you draw, then plays the mechanism in 3D.</p>
<a class="lx-cta" href="/?practise=sn2">Practise SN2 in Bondline</a> <a class="lx-cta alt" href="/reactions/">Reaction library</a>
<p style="margin-top:28px"><a href="/guides/sn1-sn2-e1-e2/">SN1 vs SN2 vs E1 vs E2</a> · <a href="/reactions/sn1/">SN1 mechanism</a> · <a href="/reactions/sn2/">SN2 mechanism</a> · <a href="/guides/how-to-draw-curly-arrows/">Curly arrows</a></p>'''
lesson('mechanisms', 'Interactive lesson: SN1 vs SN2 substitution mechanisms',
  'Scroll through SN2 and SN1 step by step with energy profiles, then predict the mechanism for any substrate, nucleophile and solvent.',
  'Interactive lesson · Mechanisms', 'SN1 or SN2?', 'Watch both substitution mechanisms happen, step by step with their energy profiles, then predict which one wins.',
  '#ffc857', mech, mech_end, 'Reaction mechanisms')

# ===================== INDEX =====================
from blsite import guide_page
cards = [
 ('/learn/spectroscopy/', 'Spectroscopy', 'IR, mass spec and NMR. Vibrate bonds, smash molecules and flip nuclear spins.', '#ff9e8f'),
 ('/learn/stereochemistry/', 'Stereochemistry', 'A chiral molecule in 3D, R and S, optical activity, E/Z and diastereomers.', '#7fd1b9'),
 ('/learn/biochemistry/', 'Biochemistry', 'Zwitterions, peptide bonds, protein folding, enzymes and DNA.', '#7be0a6'),
 ('/learn/mechanisms/', 'SN1 vs SN2', 'Both substitution mechanisms with energy profiles, and a mechanism predictor.', '#ffc857'),
 ('/lab/nmr/', 'Virtual NMR spectrometer', 'Load a sample into a 3D magnet, shim it, record an FID and read the spectrum.', '#9fc0ff'),
 ('/guides/amino-acids/', 'Amino acid flashcards', 'All 20 amino acids with structures and codes, and spaced-repetition flashcards.', '#b18cff'),
]
body = '<div class="lxi">' + ''.join(f'<a class="lxi-card" href="{u}" style="--c:{c}"><b>{t}</b><span>{d}</span></a>' for u, t, d, c in cards) + '</div><p>All lessons are free and work on phones. They are made to be scrolled slowly: the animations follow your scrolling, and the sliders and buttons let you change things yourself.</p>'
guide_page('/learn/', 'Interactive chemistry lessons', 'Free scroll-through chemistry lessons with animations you control: spectroscopy, stereochemistry, biochemistry and reaction mechanisms, plus a virtual NMR spectrometer.',
  'Interactive lessons', 'Scroll-through lessons with animations you control, a 3D NMR spectrometer, and flashcards.', 'Free · Updated 21 November 2026', body,
  '<h2>Guides</h2><ul><li><a href="/guides/">All guides</a></li><li><a href="/guides/biochemistry/">Biochemistry</a></li><li><a href="/reactions/">Reaction library</a></li></ul>', crumb=('Lessons', '/learn/'),
  extra_head='<link rel="stylesheet" href="/assets/learn.css">\n')
print('ok2')

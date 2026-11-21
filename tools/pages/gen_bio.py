from blsite import guide_page, mol_svg, E
from rdkit import Chem


def fig(smi, cap, w=250, h=190, hl_smarts=None, color=(0.12, 0.37, 0.82)):
    hl = None
    if hl_smarts:
        m = Chem.MolFromSmiles(smi)
        mt = m.GetSubstructMatch(Chem.MolFromSmarts(hl_smarts))
        hl = list(mt)
    return f'<figure class="mol"><div class="sv">{mol_svg(smi, w, h, hl=hl, hl_color=color, label=cap)}</div><figcaption>{cap}</figcaption></figure>'


def table(head, rows):
    return '<div class="tw"><table><thead><tr>' + ''.join(f'<th>{h}</th>' for h in head) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows) + '</tbody></table></div>'


gly = '<div class="figs">' + fig('[NH3+]CC(=O)O', 'Low pH (below 2): overall +1') + fig('[NH3+]CC(=O)[O-]', 'At the pI (about 6): zwitterion, no overall charge') + fig('NCC(=O)[O-]', 'High pH (above 10): overall −1') + '</div>'
pep = '<div class="figs">' + fig('NCC(=O)N[C@@H](C)C(=O)O', 'Gly-Ala: the peptide (amide) bond is shaded', w=300, hl_smarts='C(=O)N', color=(0.83, 0.25, 0.29)) + '</div>'
glc = '<div class="figs">' + fig('O=C[C@H](O)[C@@H](O)[C@H](O)[C@H](O)CO', 'Open-chain D-glucose (an aldehyde)', w=300) + fig('OC[C@H]1O[C@H](O)[C@H](O)[C@@H](O)[C@@H]1O', 'α-D-glucose: C1 OH on the opposite face to CH₂OH', hl_smarts='[CH1]([OH1])O', color=(0.83, 0.25, 0.29)) + fig('OC[C@H]1O[C@@H](O)[C@H](O)[C@@H](O)[C@@H]1O', 'β-D-glucose: C1 OH on the same face as CH₂OH', hl_smarts='[CH1]([OH1])O', color=(0.12, 0.54, 0.36)) + '</div>'
mal = '<div class="figs">' + fig('OC[C@H]1O[C@H](O[C@H]2[C@H](O)[C@@H](O)[C@H](O)O[C@@H]2CO)[C@H](O)[C@@H](O)[C@@H]1O', 'Maltose: two glucoses joined by an α(1→4) glycosidic bond', w=440, h=230) + '</div>'
tg = '<div class="figs">' + fig('CCCCCCCCCCCCCCCC(=O)OCC(OC(=O)CCCCCCC/C=C\\CCCCCCCC)COC(=O)CCCCCCCCCCCCCCCCC', 'A triglyceride: glycerol plus three fatty acids (one with a cis C=C kink)', w=520, h=230) + '</div>'

body = f'''
<p>Biochemistry is organic chemistry inside living things. The molecules are bigger, but the reactions are the ones you already know: <b>condensation</b> (joining with loss of water), <b>hydrolysis</b> (splitting by adding water), acid–base chemistry, oxidation and reduction. This guide covers what A Level, STPM, IB, AP, JEE and NEET chemistry students need.</p>

<h2 id="amino-acids">Amino acids and zwitterions</h2>
<p>Every amino acid has an amine group and a carboxylic acid group on the same carbon (the α-carbon), plus a side chain <b>R</b>. All except glycine are chiral, and the ones in proteins are the <b>L</b> form. See all twenty in the <a href="/guides/amino-acids/">amino acids list and flashcards</a>.</p>
<p>The acid and the base react inside the molecule, so in water an amino acid exists as a <b>zwitterion</b>: H₃N⁺–CHR–COO⁻. That is why amino acids are crystalline solids with high melting points and dissolve well in water but not in hexane.</p>
{gly}
<p>The <b>isoelectric point (pI)</b> is the pH where the amino acid carries no overall charge. Below the pI it is mainly positive; above it, mainly negative. In <b>electrophoresis</b>, amino acids move towards the electrode of opposite charge, and one at its pI does not move at all.</p>

<h2 id="peptides">Peptide bonds</h2>
<p>Two amino acids join by a <b>condensation reaction</b>: the COOH of one reacts with the NH₂ of the next, losing water and forming an amide called a <b>peptide bond</b>. Repeating this gives a polypeptide, read from the N-terminus to the C-terminus.</p>
{pep}
<ul>
<li>The peptide bond is <b>planar</b>, because the nitrogen lone pair is delocalised into the C=O. There is no free rotation about the C–N bond.</li>
<li><b>Hydrolysis</b> breaks peptide bonds again: boiling with 6 mol dm⁻³ HCl for about 24 hours, or with enzymes (proteases) at body temperature.</li>
<li>Two different amino acids can make two dipeptides (Gly-Ala and Ala-Gly). Three different ones give 6 tripeptides.</li>
</ul>

<h2 id="proteins">Protein structure</h2>
{table(['Level', 'What it is', 'Held together by'], [
 ['Primary', 'The sequence of amino acids', 'Covalent peptide bonds'],
 ['Secondary', 'α-helices and β-pleated sheets', 'Hydrogen bonds between backbone C=O and N–H groups'],
 ['Tertiary', 'The overall 3D fold of one chain', 'Side-chain interactions: hydrophobic, hydrogen bonds, ionic bonds (salt bridges) and disulfide bridges'],
 ['Quaternary', 'Two or more chains together (e.g. haemoglobin has four)', 'The same side-chain interactions, between chains'],
])}
<p><b>Denaturation</b> unfolds the protein (heat, extreme pH, heavy metal ions, organic solvents). The primary structure survives, but the shape, and with it the function, is lost. Heat breaks hydrogen bonds; pH changes break ionic bonds by changing which groups are charged.</p>

<h2 id="enzymes">Enzymes</h2>
<p>Enzymes are protein catalysts. The substrate binds in the <b>active site</b>, a pocket whose shape and side chains suit that substrate. In the <b>induced-fit</b> model, the active site changes shape slightly as the substrate binds, straining its bonds and lowering the activation energy.</p>
<ul>
<li><b>Specificity:</b> enzymes are often stereospecific, so only one enantiomer of a substrate fits.</li>
<li><b>Temperature:</b> rate rises with temperature up to an optimum (about 37 °C in humans), then falls as the enzyme denatures.</li>
<li><b>pH:</b> each enzyme has an optimum pH (pepsin about 2, trypsin about 8), because the charges in the active site must be right.</li>
<li><b>Michaelis–Menten kinetics:</b> at low [S] the rate is first order in substrate; at high [S] the active sites are saturated, so the rate levels off at V<sub>max</sub>. K<sub>m</sub> is the [S] that gives half of V<sub>max</sub>; a small K<sub>m</sub> means the enzyme binds its substrate tightly.</li>
</ul>
{table(['Inhibitor', 'Where it binds', 'Effect'], [
 ['Competitive', 'The active site (it looks like the substrate)', 'K<sub>m</sub> rises, V<sub>max</sub> unchanged; overcome by adding more substrate'],
 ['Non-competitive', 'Another site (allosteric), changing the active site’s shape', 'V<sub>max</sub> falls, K<sub>m</sub> unchanged; more substrate does not help'],
])}
<p>Try changing [S] and adding inhibitors yourself in the <a href="/learn/biochemistry/#enzymes">interactive biochemistry lesson</a>.</p>

<h2 id="carbohydrates">Carbohydrates</h2>
<p>Glucose (C₆H₁₂O₆) is an aldohexose: an aldehyde with five OH groups. In water, the OH on carbon 5 adds to the aldehyde to form a six-membered ring (a cyclic hemiacetal). This creates a new stereocentre, the <b>anomeric carbon</b> (C1), so there are two ring forms, α and β.</p>
{glc}
<p>Two sugars join by a condensation reaction to form a <b>glycosidic bond</b> (an acetal, C–O–C). Hydrolysis with acid or enzymes splits it again.</p>
{mal}
{table(['Carbohydrate', 'Made of', 'Linkage', 'Role'], [
 ['Maltose', 'Glucose + glucose', 'α(1→4)', 'From starch digestion'],
 ['Sucrose', 'Glucose + fructose', 'α(1→2)β', 'Table sugar; non-reducing'],
 ['Lactose', 'Galactose + glucose', 'β(1→4)', 'Milk sugar'],
 ['Starch (amylose)', 'α-glucose', 'α(1→4), coiled', 'Energy store in plants'],
 ['Glycogen', 'α-glucose', 'α(1→4) with many α(1→6) branches', 'Energy store in animals'],
 ['Cellulose', 'β-glucose', 'β(1→4), straight chains with H-bonds between them', 'Plant cell walls; strong fibres'],
])}
<p><b>Reducing sugars</b> have a free anomeric carbon, so the ring can open to the aldehyde. They give a brick-red precipitate with Benedict’s or Fehling’s solution and a silver mirror with Tollens’ reagent. Glucose, maltose and lactose are reducing; sucrose is not, because both anomeric carbons are tied up in the glycosidic bond.</p>

<h2 id="lipids">Lipids</h2>
<p>A <b>triglyceride</b> (fat or oil) is an ester of glycerol (propane-1,2,3-triol) with three fatty acids.</p>
{tg}
<ul>
<li><b>Saturated</b> fatty acids (no C=C) pack closely, so fats like butter are solid. <b>Unsaturated</b> ones have cis C=C bonds that kink the chain, so oils are liquid.</li>
<li><b>Hydrogenation</b> (H₂, Ni catalyst) saturates the C=C bonds to make margarine. Partial hydrogenation can make trans fats.</li>
<li><b>Saponification:</b> boiling a fat with NaOH hydrolyses the esters to glycerol and sodium salts of the fatty acids, which are soaps.</li>
<li><b>Phospholipids</b> swap one fatty acid for a phosphate group. The polar head and two non-polar tails make them form bilayers: cell membranes.</li>
<li><b>Biodiesel</b> is made by transesterification of a triglyceride with methanol.</li>
</ul>

<h2 id="nucleic-acids">Nucleic acids</h2>
<p>DNA and RNA are polymers of <b>nucleotides</b>. Each nucleotide is a phosphate, a pentose sugar (deoxyribose in DNA, ribose in RNA) and a nitrogenous base. Nucleotides join by <b>phosphodiester bonds</b> between the 3′-OH of one sugar and the 5′-phosphate of the next, which are condensation reactions again.</p>
{table(['', 'DNA', 'RNA'], [
 ['Sugar', '2-deoxyribose', 'Ribose'],
 ['Bases', 'A, T, G, C', 'A, U, G, C'],
 ['Strands', 'Double helix, antiparallel', 'Usually single'],
 ['Base pairs', 'A=T (2 H-bonds), G≡C (3 H-bonds)', 'A=U, G≡C where it folds'],
])}
<p>Base pairing is specific because each pair has hydrogen bond donors and acceptors in the right places. DNA with more G–C pairs needs more energy to separate (a higher melting temperature).</p>

<h2 id="tests">Tests for biological molecules</h2>
{table(['Test', 'Positive for', 'Positive result'], [
 ['Biuret (CuSO₄ in NaOH)', 'Peptide bonds (proteins)', 'Blue to purple/lilac'],
 ['Ninhydrin', 'Free amino groups (amino acids)', 'Purple (yellow for proline)'],
 ['Benedict’s, heat', 'Reducing sugars', 'Blue to brick-red precipitate'],
 ['Iodine in KI', 'Starch', 'Orange-brown to blue-black'],
 ['Ethanol emulsion', 'Lipids', 'Cloudy white emulsion'],
])}

<h2>Quick answers</h2><div class="faq">
<details><summary>Is a peptide bond the same as an amide bond?</summary><p>Yes. A peptide bond is an amide bond (–CO–NH–) that links two amino acids. It forms in a condensation reaction and is broken by hydrolysis.</p></details>
<details><summary>Why do amino acids have high melting points?</summary><p>They exist as zwitterions, so the solid is held together by strong ionic attractions between NH₃⁺ and COO⁻ groups on neighbouring molecules, not just by hydrogen bonds.</p></details>
<details><summary>What is the difference between α- and β-glucose?</summary><p>They differ only at carbon 1 (the anomeric carbon). In α-glucose the OH on C1 is on the opposite side of the ring to the CH₂OH group (down in a Haworth projection); in β-glucose it is on the same side (up).</p></details>
<details><summary>Why is sucrose a non-reducing sugar?</summary><p>Its glycosidic bond joins the anomeric carbons of both glucose and fructose, so neither ring can open to give a free aldehyde or ketone that could reduce Cu²⁺ or Ag⁺.</p></details>
</div>
<div class="cta"><p><b>Learn it interactively</b>Slide the pH, build a peptide, fold a protein and run an enzyme assay in the scroll-through lesson.</p><a href="/learn/biochemistry/">Start the biochemistry lesson</a></div>
<div class="rel"><h2>Related</h2><ul><li><a href="/guides/amino-acids/">The 20 amino acids: list and flashcards</a></li><li><a href="/reactions/saponification/">Saponification mechanism</a></li><li><a href="/guides/fischer-projections/">Fischer projections (used for sugars)</a></li><li><a href="/guides/naming-esters-and-amides/">Naming esters and amides</a></li></ul></div>
'''
aside = '''<h2>Biochemistry</h2><ul><li><a href="/guides/amino-acids/">The 20 amino acids and flashcards</a></li><li><a href="/learn/biochemistry/">Interactive lesson</a></li></ul><h2>On this page</h2><ul><li><a href="#amino-acids">Amino acids</a></li><li><a href="#peptides">Peptide bonds</a></li><li><a href="#proteins">Protein structure</a></li><li><a href="#enzymes">Enzymes</a></li><li><a href="#carbohydrates">Carbohydrates</a></li><li><a href="#lipids">Lipids</a></li><li><a href="#nucleic-acids">Nucleic acids</a></li><li><a href="#tests">Tests</a></li></ul>'''

guide_page("/guides/biochemistry/", "Biochemistry for chemistry students: proteins, sugars, lipids and DNA",
  "Amino acids and zwitterions, peptide bonds, protein structure, enzymes and Michaelis–Menten kinetics, carbohydrates, lipids, nucleic acids and food tests, explained for chemistry exams.",
  "Biochemistry for chemistry students", "Amino acids, proteins, enzymes, sugars, fats and DNA, explained as the organic chemistry they really are: condensation, hydrolysis and acid–base reactions.",
  "Biochemistry · Updated 21 November 2026", body, aside, about="Biochemistry")
print('ok')

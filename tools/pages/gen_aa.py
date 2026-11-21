import json, math
from rdkit import Chem
from rdkit.Chem import rdDepictor
from rdkit.Chem.Draw import rdMolDraw2D
from rdkit.Geometry import Point3D
from blsite import guide_page, E, ROOT
from aa_data import AA, GROUPS
import re

BB = Chem.MolFromSmarts("[NX3][CX4][CX3](=O)[OX2H1]")


def hexrgb(h):
    h = h.lstrip('#'); return tuple(int(h[i:i+2], 16)/255 for i in (0, 2, 4))


def aa_svg(smi, color, label, w=230, h=210):
    m = Chem.MolFromSmiles(smi)
    rdDepictor.SetPreferCoordGen(True)
    rdDepictor.Compute2DCoords(m)
    n, ca, c, o1, o2 = m.GetSubstructMatch(BB)
    conf = m.GetConformer()
    P = lambda i: conf.GetAtomPosition(i)
    ang = math.atan2(P(c).y - P(n).y, P(c).x - P(n).x)
    ca_, sa_ = math.cos(-ang), math.sin(-ang)
    for i in range(m.GetNumAtoms()):
        p = P(i); conf.SetAtomPosition(i, Point3D(p.x*ca_ - p.y*sa_, p.x*sa_ + p.y*ca_, 0))
    side = [a.GetIdx() for a in m.GetAtoms() if a.GetIdx() not in (n, ca, c, o1, o2)]
    if side:
        cy = sum(P(i).y for i in side)/len(side)
        if cy < P(ca).y:
            for i in range(m.GetNumAtoms()):
                p = P(i); conf.SetAtomPosition(i, Point3D(p.x, -p.y, 0))
    Chem.WedgeMolBonds(m, conf)
    d = rdMolDraw2D.MolDraw2DSVG(w, h)
    o = d.drawOptions()
    o.clearBackground = False; o.bondLineWidth = 2; o.minFontSize = 15; o.maxFontSize = 15
    o.padding = 0.1; o.useBWAtomPalette(); o.fixedBondLength = 30
    rgb = hexrgb(color)
    hl = side if side else []
    if smi == "NCC(=O)O":  # glycine: highlight the H position is not possible, highlight Cα instead
        hl = [ca]
    bonds = [b.GetIdx() for b in m.GetBonds() if b.GetBeginAtomIdx() in hl and b.GetEndAtomIdx() in hl]
    if smi.startswith("OC(=O)[C@@H]1CCCN1"):  # proline: include the ring bonds to N and Cα
        bonds = [b.GetIdx() for b in m.GetBonds() if (b.GetBeginAtomIdx() in hl or b.GetEndAtomIdx() in hl) and {b.GetBeginAtomIdx(), b.GetEndAtomIdx()} <= set(hl) | {n, ca}]
    col = (*rgb, 0.25)
    d.DrawMolecule(m, highlightAtoms=hl, highlightBonds=bonds, highlightAtomColors={a: col for a in hl},
                   highlightBondColors={b: col for b in bonds}, highlightAtomRadii={a: 0.38 for a in hl})
    d.FinishDrawing()
    s = d.GetDrawingText()
    s = s[s.index('<svg'):]
    s = s.replace("<svg ", f'<svg role="img" aria-label="{E(label)}" ', 1)
    s = re.sub(r"width='\d+px' height='\d+px' ", "", s, count=1)
    s = re.sub(r"<rect style='opacity:1.0;fill:#FFFFFF[^>]*>\s*</rect>", "", s)
    s = s.replace("#000000", "currentColor").replace("#000", "currentColor")
    s = re.sub(r">\s+<", "><", s)
    return s


rows, data = [], []
for name, t3, t1, smi, g, pka, pi, ess, fact, hint in AA:
    gname, gcol, _ = GROUPS[g]
    svg = aa_svg(smi, gcol, f"Structure of {name}")
    data.append(dict(n=name, t=t3, o=t1, g=g, k=pka, p=pi, e=ess, f=fact, h=hint))
    rows.append(f'''<tr data-g="{g}" id="aa-{t3.lower()}"><td class="aa-sv">{svg}</td><td><b>{name}</b><span class="aa-code">{t3} · {t1}</span>{'<span class="aa-ess">essential</span>' if ess else ''}</td>
<td><span class="aa-dot" style="--c:{gcol}"></span>{gname}<span class="aa-num">{f'side-chain pK<sub>a</sub> {pka} · ' if pka else ''}pI {pi:.2f}</span></td><td class="aa-fact">{E(fact)}</td></tr>''')

chips = '<button class="aa-chip on" data-f="all">All 20</button>' + ''.join(f'<button class="aa-chip" data-f="{k}" style="--c:{v[1]}">{v[0]}</button>' for k, v in GROUPS.items()) + '<button class="aa-chip" data-f="ess">Essential</button>'
legend = ''.join(f'<li><span class="aa-dot" style="--c:{v[1]}"></span><b>{v[0]}.</b> {v[2]}</li>' for v in GROUPS.values())

body = f'''
<section class="aa-flash" id="flashcards" aria-label="Amino acid flashcards">
  <div class="fc-top">
    <h2>Flashcards</h2>
    <div class="fc-modes" role="tablist" aria-label="What to practise">
      <button role="tab" data-mode="s2n" aria-selected="true">Structure → name</button>
      <button role="tab" data-mode="n2s">Name → structure</button>
      <button role="tab" data-mode="code">Codes</button>
      <button role="tab" data-mode="cls">Side-chain type</button>
    </div>
  </div>
  <div class="fc-deck"><select class="fc-set" aria-label="Which amino acids"><option value="all">All 20</option>{''.join(f'<option value="{k}">{v[0]} only</option>' for k, v in GROUPS.items())}<option value="ess">The 9 essential ones</option></select>
    <span class="fc-prog" aria-live="polite"></span></div>
  <div class="fc-card" tabindex="0" aria-live="polite"><div class="fc-face fc-front"></div><div class="fc-face fc-back" hidden></div></div>
  <div class="fc-btns">
    <button class="fc-flip">Show answer <kbd>Space</kbd></button>
    <button class="fc-again" hidden>Again <kbd>1</kbd></button>
    <button class="fc-good" hidden>Got it <kbd>2</kbd></button>
  </div>
  <p class="fc-note">Cards you get right come back less often (a Leitner box system). Your progress is saved in this browser. <button class="linkbtn fc-reset">Reset progress</button></p>
</section>

<h2>All 20 amino acids</h2>
<p>Each structure is drawn as the neutral L-amino acid, with the side chain (R group) shaded by type. In water at pH 7 they actually exist as zwitterions: NH₃⁺ and COO⁻.</p>
<div class="aa-chips" role="group" aria-label="Filter the table">{chips}</div>
<div class="aa-tablewrap"><table class="aa-table">
<thead><tr><th>Structure</th><th>Name and codes</th><th>Side chain</th><th>Remember</th></tr></thead>
<tbody>{''.join(rows)}</tbody></table></div>
<p class="aa-small">pK<sub>a</sub> and pI values are typical textbook values (they vary slightly between sources and inside proteins). Essential = adults must get it from food: His, Ile, Leu, Lys, Met, Phe, Thr, Trp, Val.</p>

<h2>The five side-chain groups</h2>
<ul class="aa-legend">{legend}</ul>

<h2>How to memorise them</h2>
<ol class="steps">
<li><b>Learn the backbone once.</b> Every amino acid is H₂N–CH(R)–COOH. Only the R group changes, so you're really memorising 20 side chains.</li>
<li><b>Learn them in families.</b> Ala → Val → Leu/Ile are just bigger and bigger hydrocarbons. Ser → Thr add an OH; Cys swaps the O of serine for S. Asp/Glu are acids, and Asn/Gln are their amides (one CH₂ apart each time).</li>
<li><b>Pair the look-alikes.</b> Phe + OH = Tyr. Asp + CH₂ = Glu. Ser with S instead of O = Cys.</li>
<li><b>Use the odd one-letter codes as hooks:</b> F = 'Fenylalanine', R = 'aRginine', Y = 'tYrosine', W = 'tWo rings' (tryptophan), Q = 'Q-tamine', D = 'asparDic', E = 'glutEmate', N = 'asparagiNe', K = just before L.</li>
<li><b>Mnemonic for the essential nine:</b> "<b>PVT TIM HALL</b>" – Phe, Val, Thr, Trp, Ile, Met, His, Arg*, Leu, Lys. (*Arg is only essential for children, so the adult list is nine.)</li>
<li><b>Practise a little every day</b> with the flashcards above, in both directions. Recall beats rereading.</li>
</ol>

<h2>Quick answers</h2><div class="faq">
<details><summary>Which amino acid is not chiral?</summary><p>Glycine. Its side chain is a hydrogen atom, so the α-carbon has two identical H atoms and no stereocentre.</p></details>
<details><summary>Why is L-cysteine R, when the other L amino acids are S?</summary><p>L and D describe the 3D shape, which is the same for all of them. R and S follow CIP priorities. In cysteine, the CH₂SH group outranks COOH (sulfur beats oxygen), so the priorities swap and the label becomes R.</p></details>
<details><summary>Which amino acids are charged at pH 7?</summary><p>Aspartate and glutamate are negative. Lysine and arginine are positive. Histidine is only partly protonated, because its side-chain pK<sub>a</sub> is about 6.</p></details>
<details><summary>What is the isoelectric point (pI)?</summary><p>The pH at which the amino acid has no overall charge (all molecules are zwitterions). For a neutral side chain, pI is the average of the two backbone pK<sub>a</sub> values, about 2 and 9.5.</p></details>
</div>
<div class="cta"><p><b>See them in action</b>Peptide bonds, protein folding and enzymes, step by step in the interactive biochemistry lesson.</p><a href="/learn/biochemistry/">Start the lesson</a></div>
'''

aside = '''<h2>Biochemistry</h2><ul><li><a href="/guides/biochemistry/">Biochemistry for chemistry students</a></li><li><a href="/learn/biochemistry/">Interactive lesson: biochemistry</a></li></ul>
<h2>Stereochemistry</h2><ul><li><a href="/guides/chiral-centres/">Chiral centres</a></li><li><a href="/guides/r-and-s-configuration/">R and S configuration</a></li><li><a href="/guides/fischer-projections/">Fischer projections</a></li></ul>'''

guide_page("/guides/amino-acids/", "The 20 amino acids: structures, codes and flashcards",
  "All 20 amino acids with structures, three- and one-letter codes, side-chain groups, pKa and pI values, plus free flashcards to memorise them.",
  "The 20 amino acids", "Structures, three- and one-letter codes and side-chain types for all twenty, with flashcards that help you memorise them.",
  "Biochemistry · Updated 21 November 2026", body, aside,
  extra_head='<link rel="stylesheet" href="/assets/learn.css">\n',
  scripts=f'<script type="application/json" id="aa-data">{json.dumps(data, ensure_ascii=False)}</script>\n<script src="/guides/amino-acids/flash.js" defer></script>\n',
  about="Biochemistry")
print("ok")

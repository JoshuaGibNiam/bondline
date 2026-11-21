import json, re
from rdkit import Chem
from rdkit.Chem import rdDepictor
from rdkit.Chem.Draw import rdMolDraw2D

COLS = ['#d33f49', '#1f5fd1', '#1f8a5b', '#c27a12', '#7b4fc9']
# env: atoms (indices in SMILES order), shift (ppm), nH, couplings [(neighbour H count, J Hz)], broad, text
M = [
 dict(id="ethanol", name="Ethanol", f="C₂H₆O", smi="CCO", env=[
   dict(a=[0], d=1.22, n=3, c=[(2, 7.0)], t="CH₃ next to a CH₂. 2 neighbouring H, so 2 + 1 = 3 peaks: a triplet."),
   dict(a=[1], d=3.69, n=2, c=[(3, 7.0)], t="CH₂ on the oxygen. O pulls electron density away (deshields), so it is far downfield. 3 neighbours on the CH₃: a quartet."),
   dict(a=[2], d=2.61, n=1, c=[], br=1, t="O–H. Broad, and its shift moves with concentration. It swaps H with other molecules too fast to couple, so it is a singlet (and disappears with D₂O).")],
   c13=[(0, 18.3), (1, 58.3)]),
 dict(id="ethylacetate", name="Ethyl ethanoate", f="C₄H₈O₂", smi="CC(=O)OCC", env=[
   dict(a=[0], d=2.04, n=3, c=[], t="CH₃ on the C=O. No H on the neighbouring carbons, so a singlet, near 2 ppm like most CH₃C=O."),
   dict(a=[4], d=4.12, n=2, c=[(3, 7.1)], t="O–CH₂ of the ester. Next to the ester oxygen, so far downfield (about 4 ppm). Quartet from the CH₃."),
   dict(a=[5], d=1.26, n=3, c=[(2, 7.1)], t="CH₃ of the ethyl group: a triplet from the CH₂. Together the quartet + triplet say 'ethyl group'.")],
   c13=[(0, 21.0), (1, 171.1), (4, 60.4), (5, 14.2)]),
 dict(id="butanone", name="Butanone", f="C₄H₈O", smi="CCC(C)=O", env=[
   dict(a=[3], d=2.14, n=3, c=[], t="CH₃ on the C=O: a singlet, as there are no H on the carbonyl carbon."),
   dict(a=[1], d=2.44, n=2, c=[(3, 7.3)], t="CH₂ next to the C=O. Quartet from the CH₃ beside it."),
   dict(a=[0], d=1.05, n=3, c=[(2, 7.3)], t="CH₃ at the end of the ethyl group: a triplet.")],
   c13=[(0, 7.9), (1, 36.9), (2, 209.3), (3, 29.4)]),
 dict(id="chloropropane", name="2-Chloropropane", f="C₃H₇Cl", smi="CC(C)Cl", env=[
   dict(a=[0, 2], d=1.51, n=6, c=[(1, 6.5)], t="Two equivalent CH₃ groups (6 H). Each has one neighbouring H, so a doublet."),
   dict(a=[1], d=4.14, n=1, c=[(6, 6.5)], t="The CH carrying Cl. Six neighbouring H: 6 + 1 = 7 peaks, a septet. Cl deshields it to about 4 ppm.")],
   c13=[(0, 27.3), (1, 53.9)]),
 dict(id="propanal", name="Propanal", f="C₃H₆O", smi="CCC=O", env=[
   dict(a=[2], d=9.79, n=1, c=[(2, 1.4)], t="The aldehyde H: 9–10 ppm is almost a fingerprint for CHO. A tiny 1.4 Hz coupling to the CH₂ makes a narrow triplet."),
   dict(a=[1], d=2.46, n=2, c=[(3, 7.4), (1, 1.4)], t="CH₂ next to the C=O: a quartet (from CH₃), each line split again by the CHO (a quartet of doublets)."),
   dict(a=[0], d=1.13, n=3, c=[(2, 7.4)], t="CH₃: a triplet from the CH₂.")],
   c13=[(0, 5.9), (1, 37.3), (2, 202.8)]),
 dict(id="toluene", name="Methylbenzene (toluene)", f="C₇H₈", smi="Cc1ccccc1", env=[
   dict(a=[0], d=2.35, n=3, c=[], t="CH₃ on the benzene ring (benzylic). No neighbouring H on the ring carbon, so a singlet near 2.3 ppm."),
   dict(a=[2, 6], d=7.17, n=2, c=[(1, 7.6)], t="Ring H ortho to CH₃. Aromatic H appear at 6.5–8 ppm because of the ring current."),
   dict(a=[3, 5], d=7.26, n=2, c=[(2, 7.6)], t="Ring H meta to CH₃. They overlap with the others, so the ring shows as one multiplet worth 5 H."),
   dict(a=[4], d=7.19, n=1, c=[(2, 7.4)], t="Ring H para to CH₃, also inside the 7.1–7.3 ppm multiplet.")],
   c13=[(0, 21.5), (1, 137.9), (2, 129.1), (3, 128.3), (4, 125.4)]),
 dict(id="propanoic", name="Propanoic acid", f="C₃H₆O₂", smi="CCC(=O)O", env=[
   dict(a=[4], d=11.7, n=1, c=[], br=1, t="Carboxylic acid O–H: very broad and very far downfield (10–13 ppm)."),
   dict(a=[1], d=2.38, n=2, c=[(3, 7.5)], t="CH₂ next to the C=O: a quartet."),
   dict(a=[0], d=1.16, n=3, c=[(2, 7.5)], t="CH₃: a triplet.")],
   c13=[(0, 9.0), (1, 27.6), (3, 181.2)]),
 dict(id="bromopropane", name="1-Bromopropane", f="C₃H₇Br", smi="CCCBr", env=[
   dict(a=[2], d=3.40, n=2, c=[(2, 6.8)], t="CH₂Br: deshielded by bromine. Two H on the next carbon: a triplet."),
   dict(a=[1], d=1.89, n=2, c=[(5, 7.0)], t="Middle CH₂ with 3 + 2 = 5 neighbouring H: about 6 peaks (a sextet)."),
   dict(a=[0], d=1.03, n=3, c=[(2, 7.3)], t="CH₃: a triplet from the middle CH₂.")],
   c13=[(0, 13.0), (1, 26.2), (2, 35.8)]),
 dict(id="propan2ol", name="Propan-2-ol", f="C₃H₈O", smi="CC(C)O", env=[
   dict(a=[0, 2], d=1.21, n=6, c=[(1, 6.1)], t="Two equivalent CH₃ groups: a 6H doublet."),
   dict(a=[1], d=4.03, n=1, c=[(6, 6.1)], t="CH on the oxygen: a septet (6 neighbouring H), at about 4 ppm."),
   dict(a=[3], d=1.85, n=1, c=[], br=1, t="O–H: broad singlet; its position varies.")],
   c13=[(0, 25.3), (1, 64.2)]),
 dict(id="pxylene", name="1,4-Dimethylbenzene", f="C₈H₁₀", smi="Cc1ccc(C)cc1", env=[
   dict(a=[0, 5], d=2.31, n=6, c=[], t="Two equivalent CH₃ groups on the ring: one 6H singlet."),
   dict(a=[2, 3, 6, 7], d=7.05, n=4, c=[], t="All four ring H are equivalent (the molecule is symmetrical), so they give one 4H singlet.")],
   c13=[(0, 21.0), (1, 134.7), (2, 129.0)]),
]


def svg(m):
    mol = Chem.MolFromSmiles(m["smi"])
    rdDepictor.SetPreferCoordGen(True); rdDepictor.Compute2DCoords(mol)
    hl, ac, rad = [], {}, {}
    for k, e in enumerate(m["env"]):
        h = COLS[k].lstrip('#'); rgb = tuple(int(h[i:i+2], 16)/255 for i in (0, 2, 4))
        for a in e["a"]:
            hl.append(a); ac[a] = (*rgb, 0.32); rad[a] = 0.4
            mol.GetAtomWithIdx(a).SetProp('atomNote', 'abcde'[k])
    d = rdMolDraw2D.MolDraw2DSVG(240, 170)
    o = d.drawOptions()
    o.clearBackground = False; o.bondLineWidth = 2; o.minFontSize = 15; o.maxFontSize = 15
    o.padding = 0.1; o.useBWAtomPalette(); o.fixedBondLength = 44; o.annotationFontScale = 0.8
    d.DrawMolecule(mol, highlightAtoms=hl, highlightAtomColors=ac, highlightAtomRadii=rad, highlightBonds=[])
    d.FinishDrawing()
    s = d.GetDrawingText(); s = s[s.index('<svg'):]
    s = re.sub(r"width='\d+px' height='\d+px' ", "", s, count=1)
    s = re.sub(r"<rect style='opacity:1.0;fill:#FFFFFF[^>]*>\s*</rect>", "", s)
    s = s.replace("#000000", "#121a24")
    return re.sub(r">\s+<", "><", s)


out = []
for m in M:
    mol = Chem.MolFromSmiles(m["smi"])
    tot = sum(a.GetTotalNumHs() for a in mol.GetAtoms())
    assert tot == sum(e["n"] for e in m["env"]), (m["id"], tot)
    for e in m["env"]:
        assert sum(mol.GetAtomWithIdx(a).GetTotalNumHs() for a in e["a"]) == e["n"], (m["id"], e)
    out.append(dict(id=m["id"], name=m["name"], f=m["f"], svg=svg(m),
                    env=[dict(d=e["d"], n=e["n"], c=e["c"], br=e.get("br", 0), t=e["t"], col=COLS[k], l='abcde'[k]) for k, e in enumerate(m["env"])],
                    c13=[dict(d=d, col='#121a24') for _, d in m["c13"]]))
js = "/* Bondline virtual NMR lab: sample data (generated by tools; shifts are typical literature values in CDCl3 at 400 MHz). */\nwindow.NMR_DATA=" + json.dumps(out, ensure_ascii=False) + ";\n"
import os
os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "lab", "nmr") + "", exist_ok=True)
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "lab", "nmr") + "/data.js", "w", encoding="utf-8").write(js)
print(len(out), len(js))

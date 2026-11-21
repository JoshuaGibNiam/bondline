"""Shared helpers for generating Bondline's public pages (same header, footer and styles as the existing guides)."""
import json, html, re
from rdkit import Chem
from rdkit.Chem import AllChem, rdDepictor
from rdkit.Chem.Draw import rdMolDraw2D

import os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TPL = open(f"{ROOT}/guides/newman-projections/index.html", encoding="utf-8").read()
NAV = TPL[TPL.index('  <nav class="nav"'):TPL.index('\n', TPL.index('  <nav class="nav"'))]
FOOTER = TPL[TPL.index('<footer class="bf">'):TPL.index('</footer>') + len('</footer>')]
LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3.5l10.8 6.25v12.5L16 28.5 5.2 22.25V9.75z"/><path class="c" d="M9.5 19.5c1-6 6-9.5 12-8"/><path class="c" d="M19 8.3l3.1 3.1-3.6 2.3"/></svg>'
E = lambda s: html.escape(s, quote=True)


def head(url, title, desc, kind="Article", about="Chemistry", extra="", date="2026-11-21"):
    ld = {"@context": "https://schema.org", "@graph": [{"@type": kind, "headline": title, "description": desc, "url": url,
          "mainEntityOfPage": url, "datePublished": date, "dateModified": date,
          "author": {"@type": "Organization", "name": "Bondline", "url": "https://bondline.site/"},
          "publisher": {"@type": "Organization", "name": "Bondline", "logo": {"@type": "ImageObject", "url": "https://bondline.site/icons/icon-512.png"}},
          "image": "https://bondline.site/og-image.png", "inLanguage": "en", "about": about}]}
    t = f"{title} | Bondline"
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(t)}</title>
<meta name="description" content="{E(desc)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Bondline">
<meta property="og:title" content="{E(t)}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="https://bondline.site/og-image.png">
<meta property="og:image:alt" content="Bondline, the free organic chemistry notebook">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{E(t)}">
<meta name="twitter:description" content="{E(desc)}">
<meta name="theme-color" content="#0a0f17">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="stylesheet" href="/assets/site.css">
{extra}<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body>
'''


def guide_page(path, title, desc, h1, lede, meta, body, aside, crumb=('Guides', '/guides/'), extra_head="", scripts="", about="Chemistry"):
    url = f"https://bondline.site{path}"
    out = head(url, title, desc, about=about, extra=extra_head)
    out += f'''<header class="top">
{NAV}
  <p class="crumb"><a href="/?about">Bondline</a> / <a href="{crumb[1]}">{crumb[0]}</a></p>
  <h1>{h1}</h1>
  <p class="lede">{lede}</p>
  <p class="meta">{meta}</p>
</header>
<main class="wrap">
  <article>
{body}
  </article>
  <aside class="side">{aside}</aside>
</main>
{FOOTER}
<script src="/assets/track.js" defer></script>
{scripts}</body>
</html>
'''
    import os
    os.makedirs(f"{ROOT}{path}", exist_ok=True)
    open(f"{ROOT}{path}index.html", "w", encoding="utf-8").write(out)
    return url


def mol_svg(smi, w=260, h=200, hl=None, hl_color=(0.12, 0.37, 0.82), label="", bw=2.0, font=17, zwit=False):
    m = Chem.MolFromSmiles(smi)
    rdDepictor.SetPreferCoordGen(True)
    rdDepictor.Compute2DCoords(m)
    d = rdMolDraw2D.MolDraw2DSVG(w, h)
    o = d.drawOptions()
    o.clearBackground = False
    o.bondLineWidth = bw
    o.minFontSize = font; o.maxFontSize = font
    o.padding = 0.12
    o.useBWAtomPalette()
    o.setHighlightColour((*hl_color, 0.28)) if hl else None
    o.highlightBondWidthMultiplier = 12
    o.fixedBondLength = 34
    o.addStereoAnnotation = False
    if hl:
        bonds = [b.GetIdx() for b in m.GetBonds() if b.GetBeginAtomIdx() in hl and b.GetEndAtomIdx() in hl]
        cols = {a: (*hl_color, 0.28) for a in hl}
        bcols = {b: (*hl_color, 0.28) for b in bonds}
        d.DrawMolecule(m, highlightAtoms=list(hl), highlightBonds=bonds, highlightAtomColors=cols, highlightBondColors=bcols, highlightAtomRadii={a: 0.42 for a in hl})
    else:
        d.DrawMolecule(m)
    d.FinishDrawing()
    s = d.GetDrawingText()
    s = s[s.index('<svg'):]
    s = re.sub(r"<\?xml[^>]*>", "", s)
    s = s.replace("<svg ", f'<svg role="img" aria-label="{E(label)}" style="max-width:100%;height:auto" ', 1)
    s = re.sub(r"<rect style='opacity:1.0;fill:#FFFFFF[^>]*>\s*</rect>", "", s)
    s = s.replace("#000000", "#121a24")
    s = re.sub(r">\s+<", "><", s)
    return s

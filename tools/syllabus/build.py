"""Build syllabus checklists: PDFs (tickable) and syllabus-data.js for the app."""
import json, os, re, sys
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

D = os.path.dirname(os.path.abspath(__file__))  # run from tools/syllabus; outputs go to ../../syllabus and ../../syllabus-data.js
F = "/usr/share/fonts/truetype/dejavu/"
pdfmetrics.registerFont(TTFont("DV", F + "DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DVB", F + "DejaVuSans-Bold.ttf"))
ORDER = ["icho", "cie", "stpm", "ap", "ib", "jee", "neet"]

def parse(path):
    c = {"parts": []}
    part = sec = None
    for ln in open(path, encoding="utf-8"):
        ln = ln.rstrip("\n")
        if not ln.strip(): continue
        if ln.startswith("@part "):
            part = {"h": ln[6:], "secs": []}; c["parts"].append(part)
        elif ln.startswith("@"):
            k, v = ln[1:].split(" ", 1); c[k] = v
        elif ln.startswith("# "):
            sec = {"h": ln[2:], "items": []}; part["secs"].append(sec)
        else:
            code, txt = [x.strip() for x in ln.split("|", 1)]
            sec["items"].append([code, txt])
    return c

def wrap(text, font, size, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if pdfmetrics.stringWidth(t, font, size) > width and cur:
            lines.append(cur); cur = w
        else: cur = t
    lines.append(cur); return lines

INK, MUT, ACC, RULE = HexColor("#1b2230"), HexColor("#6b7385"), HexColor("#0f8a7e"), HexColor("#d9dde5")

def pdf(cid, c, out):
    W, H = A4; M = 48
    cv = canvas.Canvas(out, pagesize=A4)
    cv.setTitle(c["title"] + " syllabus checklist"); cv.setAuthor("Bondline")
    n_items = sum(len(s["items"]) for p in c["parts"] for s in p["secs"])
    page = [1]; y = [H - M]
    def foot():
        cv.setFont("DV", 8); cv.setFillColor(MUT)
        cv.drawString(M, 28, "Bondline · bondline.site · " + c["title"] + " checklist")
        cv.drawRightString(W - M, 28, f"Page {page[0]}")
    def newpage():
        foot(); cv.showPage(); page[0] += 1; y[0] = H - M
    def need(h):
        if y[0] - h < 50: newpage()
    # cover block
    cv.setFillColor(ACC); cv.setFont("DVB", 9); cv.drawString(M, y[0], "SYLLABUS CHECKLIST"); y[0] -= 26
    for l in wrap(c["title"], "DVB", 20, W - 2 * M):
        cv.setFillColor(INK); cv.setFont("DVB", 20); cv.drawString(M, y[0], l); y[0] -= 25
    cv.setFont("DV", 10); cv.setFillColor(MUT)
    for l in wrap(c.get("exams", "") + f" · {n_items} items", "DV", 10, W - 2 * M):
        cv.drawString(M, y[0], l); y[0] -= 14
    for l in wrap("Source: " + c.get("src", ""), "DV", 8.5, W - 2 * M):
        cv.setFont("DV", 8.5); cv.drawString(M, y[0], l); y[0] -= 12
    y[0] -= 2
    for l in wrap("Tick each box when you can explain the point without notes. Item wording is shortened from the official document; check the original for exact wording. Not affiliated with or endorsed by the exam board.", "DV", 8.5, W - 2 * M):
        cv.drawString(M, y[0], l); y[0] -= 12
    y[0] -= 10
    form = cv.acroForm; k = 0
    for p in c["parts"]:
        need(60)
        cv.setFillColor(ACC); cv.rect(M, y[0] - 6, W - 2 * M, 22, fill=1, stroke=0)
        cv.setFillColor(HexColor("#ffffff")); cv.setFont("DVB", 11); cv.drawString(M + 8, y[0] + 1, p["h"]); y[0] -= 32
        for s in p["secs"]:
            need(44)
            cv.setFillColor(INK); cv.setFont("DVB", 11.5); cv.drawString(M, y[0], s["h"]); y[0] -= 6
            cv.setStrokeColor(RULE); cv.setLineWidth(0.6); cv.line(M, y[0], W - M, y[0]); y[0] -= 15
            for code, txt in s["items"]:
                lines = wrap(txt, "DV", 9.5, W - 2 * M - 70)
                need(13 * len(lines) + 4)
                k += 1
                form.checkbox(name=f"c{k}", x=M, y=y[0] - 3, size=10, buttonStyle="check", borderColor=MUT, fillColor=HexColor("#ffffff"), textColor=ACC, borderWidth=0.8, forceBorder=True)
                cv.setFont("DVB", 8); cv.setFillColor(MUT); cv.drawString(M + 16, y[0], code)
                cv.setFont("DV", 9.5); cv.setFillColor(INK)
                for i, l in enumerate(lines):
                    cv.drawString(M + 64, y[0], l); y[0] -= 13
                y[0] -= 3
            y[0] -= 8
    foot(); cv.save()

def main():
    allc = {}
    for cid in ORDER:
        p = os.path.join(D, "data", cid + ".txt")
        if not os.path.exists(p): continue
        c = parse(p); allc[cid] = c
        os.makedirs(os.path.join(D, "pdf"), exist_ok=True)
        pdf(cid, c, os.path.join(D, "pdf", f"Bondline_{cid.upper()}_Syllabus_Checklist.pdf"))
        print(cid, sum(len(s["items"]) for p_ in c["parts"] for s in p_["secs"]))
    js = "/* Bondline: official syllabus checklists, one per course. Built by tools from the exam boards' published syllabuses.\n   parts > secs > items [code, text]. Item ids for ticks are '<course>:<code>'. */\nwindow.BL_SYL=" + json.dumps(allc, ensure_ascii=False, separators=(",", ":")) + ";\n"
    open(os.path.join(D, "syllabus-data.js"), "w", encoding="utf-8").write(js)
    print("js bytes", len(js.encode()))

main()

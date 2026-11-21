import os
import json
from blsite import guide_page, E

D = json.load(open('os.path.join(os.path.dirname(os.path.abspath(__file__)), '')courses.json'))
SLUG = {'icho': 'icho-organic-chemistry', 'cie': 'a-level-chemistry-9701', 'stpm': 'stpm-chemistry-962', 'ap': 'ap-chemistry', 'ib': 'ib-chemistry', 'jee': 'jee-chemistry', 'neet': 'neet-chemistry'}
TITLE = {'icho': 'IChO organic and biological chemistry: course and syllabus', 'cie': 'Cambridge A Level Chemistry 9701: free notes and syllabus by topic',
         'stpm': 'STPM Chemistry 962: notes and syllabus checklist by topic', 'ap': 'AP Chemistry: all 9 units, notes and practice',
         'ib': 'IB Chemistry (2025 syllabus): notes for SL and HL', 'jee': 'JEE Main chemistry: notes and practice by chapter', 'neet': 'NEET chemistry: notes and practice by chapter'}
pages = []
for c in D:
    slug = SLUG[c['id']]; n = len(c['units'])
    nq = sum(u['nq'] for u in c['units'])
    groups = c['groups'] or ['Units']
    body = f'<p>{E(c["lede"])}</p>'
    if c.get('note'):
        body += f'<div class="cond"><b>{E(c["note"][0])}</b> {E(c["note"][1])}</div>'
    body += f'<p><b>{n} units · about {nq} practice questions.</b> The first three units are free in full, and every unit has free questions to try. <a href="/pricing/">Bondline Pro</a> unlocks the rest.</p>'
    body += f'<div class="cta"><p><b>Start the course</b>Lessons, quizzes and a syllabus checklist that tracks your progress. Free to start, no account needed.</p><a href="/?course={c["id"]}">Open {E(c["short"])} in Bondline</a></div>'
    for gi, gname in enumerate(groups):
        us = [u for u in c['units'] if u['grp'] == gi] if c['groups'] else c['units']
        if not us:
            continue
        body += f'<h2>{E(gname)}</h2>'
        for u in us:
            syl = ''.join(f'<li>{E(s)}</li>' for s in u['syl'])
            secs = ', '.join(E(s) for s in u['secs'][:8]) + ('…' if len(u['secs']) > 8 else '')
            prev = ''.join(f'<p>{E(p)}</p>' for p in u['prev'])
            badge = '<span class="aa-ess" style="background:#e3f6ec;color:#11683f">free</span>' if u['free'] else ''
            body += f'''<section class="cu" id="{E(u['id'])}"><h3>Unit {u['n']}: {E(u['title'])} {badge}</h3>
<p class="meta" style="color:var(--mut);margin:-6px 0 6px;font-size:14px">{E(u['ref'])}{' · ' if u['ref'] else ''}{u['nq']} questions</p>
<p>{E(u['lede'])}</p>{prev}
{f'<details><summary>Syllabus points ({len(u["syl"])})</summary><ul>{syl}</ul></details>' if syl else ''}
<p style="font-size:14.5px"><b>Lessons:</b> {secs}</p>
<p><a href="/?course={c['id']}&amp;unit={E(u['id'])}">Open this unit →</a></p></section>'''
    pdf = {'icho': 'ICHO', 'cie': 'CIE', 'ap': 'AP', 'ib': 'IB', 'jee': 'JEE', 'neet': 'NEET'}.get(c['id'])
    if pdf:
        body += f'<p><a href="/syllabus/Bondline_{pdf}_Syllabus_Checklist.pdf">Download the printable syllabus checklist (PDF)</a></p>'
    if c.get('src'):
        body += f'<p class="aa-small" style="color:var(--mut);font-size:13.5px">{E(c["src"])}</p>'
    aside = '<h2>Courses</h2><ul>' + ''.join(f'<li><a href="/courses/{SLUG[x["id"]]}/">{E(x["name"])}</a></li>' for x in D) + '</ul><h2>Learn interactively</h2><ul><li><a href="/learn/spectroscopy/">Spectroscopy lesson</a></li><li><a href="/learn/stereochemistry/">Stereochemistry lesson</a></li><li><a href="/learn/biochemistry/">Biochemistry lesson</a></li><li><a href="/lab/nmr/">Virtual NMR lab</a></li></ul><h2>Tools</h2><ul><li><a href="/past-papers/">Past paper finder</a></li></ul>'
    desc = f'{c["h1"]}: {n} units with lessons, syllabus points and practice questions. ' + c['lede'][:110].rsplit(' ', 1)[0] + '…'
    guide_page(f'/courses/{slug}/', TITLE[c['id']], desc[:300], E(c['h1']), E(c['sub']) + '. Notes, syllabus points and practice questions for every unit.', f'Course · {n} units · Updated 21 November 2026', body, aside, crumb=('Courses', '/courses/'), extra_head='<link rel="stylesheet" href="/assets/learn.css">\n<style>.cu{border-top:1px solid var(--line);padding-top:6px;margin-top:18px}.cu h3{margin:10px 0 8px}.cu details{margin:6px 0}.cu summary{cursor:pointer;font-weight:600}</style>\n', about='Chemistry')
    pages.append(f'/courses/{slug}/')

idx = '<div class="lxi">' + ''.join(f'<a class="lxi-card" href="/courses/{SLUG[c["id"]]}/" style="--c:#ff9e8f"><b>{E(c["name"])}</b><span>{E(c["sub"])} · {len(c["units"])} units</span></a>' for c in D) + '</div><p>Every course has lessons written from the official syllabus, exam-style questions with worked answers and a quiz for each unit. The first three units of each are free.</p><div class="cta"><p><b>New: interactive lessons</b>Scroll-through lessons on spectroscopy, stereochemistry, biochemistry and mechanisms.</p><a href="/learn/">See the lessons</a></div>'
guide_page('/courses/', 'Chemistry courses: A Level, STPM, AP, IB, JEE, NEET and IChO', 'Free chemistry courses that follow the A Level 9701, STPM 962, AP, IB, JEE, NEET and IChO syllabuses, with lessons and practice questions for every unit.',
  'Chemistry courses', 'Notes and practice that follow your exam’s syllabus, unit by unit.', 'Courses · Updated 21 November 2026', idx, '<h2>More</h2><ul><li><a href="/guides/">Guides</a></li><li><a href="/learn/">Interactive lessons</a></li><li><a href="/reactions/">Reaction library</a></li></ul>', crumb=('Courses', '/courses/'), extra_head='<link rel="stylesheet" href="/assets/learn.css">\n')
pages.append('/courses/')
json.dump(pages, open('os.path.join(os.path.dirname(os.path.abspath(__file__)), '')course_pages.json', 'w'))
print(pages)

#!/usr/bin/env python3
"""Write kids/lessons/<date>.json for a week from tools/<module> (EN + KO dicts), make print-size photos.
Usage: python3 kids/tools/build_week.py week1   (module week1_en.py + week1_ko.py)"""
import datetime, importlib, json, os, sys
from PIL import Image
KIDS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(KIDS, 'tools'))
name = sys.argv[1]
EN = importlib.import_module(f'{name}_en').EN
_ko = importlib.import_module(f'{name}_ko')
KO = _ko.KO
WRITE = getattr(_ko, 'WRITE', {})
WD = '월화수목금토일'
lessons_dir = os.path.join(KIDS, 'lessons')
existing = sorted(f[:10] for f in os.listdir(lessons_dir) if f[:4].isdigit() and f.endswith('.json'))
for date in sorted(EN):
    prev = [d for d in existing if d < date]
    day = len(prev) + 1
    d = datetime.date.fromisoformat(date)
    # a photo that could not be downloaded yet falls back to the hero illustration
    for U in (EN[date], KO[date]):
        h = U.get('hero') or {}
        if h.get('photo') and not os.path.exists(os.path.join(KIDS, h['photo']['src'])):
            if h.get('scene'): h.pop('photo'); print('  photo missing -> illustration:', date)
        for p in U['passage']:
            if p.get('photo') and not os.path.exists(os.path.join(KIDS, p['photo']['src'])): p.pop('photo')
    out = {"version": 2, "date": date, "day": day, "weekday": WD[d.weekday()], "en": EN[date], "ko": KO[date]}
    if date in WRITE: out["write"] = WRITE[date]
    json.dump(out, open(os.path.join(lessons_dir, f'{date}.json'), 'w'), ensure_ascii=False, indent=1)
    if date not in existing: existing.append(date); existing.sort()
    print('lesson', date, 'DAY', day)
# print-size copies (keeps the weekly PDF small)
pdir = os.path.join(KIDS, 'photos'); os.makedirs(os.path.join(pdir, 'print'), exist_ok=True)
for f in os.listdir(pdir):
    if f.endswith('.jpg'):
        dst = os.path.join(pdir, 'print', f)
        if True:  # always refresh (cheap)
            im = Image.open(os.path.join(pdir, f)).convert('RGB')
            if im.width > 600: im = im.resize((600, round(im.height * 600 / im.width)))
            im.save(dst, 'JPEG', quality=64, optimize=True, progressive=True)

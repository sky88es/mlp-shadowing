#!/usr/bin/env python3
"""Merge our researched sector items with 부동산플래닛 '간추린 뉴스' headlines into data['digest'].

  python3 cre-briefing/merge_digest.py data/YYYY-MM-DD.json /tmp/cre/bdsplanet.json
Our items (with one-line summaries) come first; curated headlines follow. Duplicates (same URL) are dropped.
Residential / start-up / local-issue sections are skipped (commercial focus).
"""
import json
import sys

ORDER = [
    ("Office", "오피스", "🏢"), ("Hotel", "호텔", "🏨"), ("Retail", "리테일", "🛍️"),
    ("Data Center", "데이터센터", "🖥️"), ("Logistics", "물류", "📦"),
    ("Development", "개발 · 리츠 · 펀드", "🏗️"), ("Global", "해외", "🌏"), ("Macro", "금리 · 경제", "📈"),
]
OURS = {"Office": "Office", "Hotel": "Hotel", "Retail": "Retail", "Data Center": "Data Center",
        "Logistics": "Logistics", "REITs": "Development", "Development": "Development"}


def bdsp_cat(section):
    head, _, sub = section.partition("\n")
    head = head.strip().lower()
    if head.startswith("office"):
        return "Office"
    if head.startswith("retail"):
        return "Retail"
    if head.startswith("development"):
        return "Development"
    if head.startswith("global"):
        return "Global"
    if head.startswith("economic"):
        return "Macro"
    if head.startswith("real estate trend"):
        for k, c in [("물류", "Logistics"), ("호텔", "Hotel"), ("데이터", "Data Center"), ("오피스", "Office"),
                     ("리테일", "Retail"), ("상가", "Retail")]:
            if k in sub:
                return c
        return "Development"
    return None  # housing, start-up, local issues -> skip


def main():
    path, bpath = sys.argv[1], sys.argv[2]
    d = json.load(open(path, encoding="utf-8"))
    b = json.load(open(bpath, encoding="utf-8"))
    seen = {x.get("url") for x in d.get("deals", [])}
    seen.add(d["brief"]["url"])
    cats = {c: [] for c, _, _ in ORDER}
    for g in d.get("sectors", []):
        c = OURS.get(g["tag"])
        for it in g["items"]:
            if c and it.get("url") not in seen:
                seen.add(it.get("url"))
                cats[c].append({**it, "media": it.get("src", ""), "own": True})
    for s in b.get("sections", []):
        c = bdsp_cat(s["section"])
        if not c:
            continue
        for it in s["items"]:
            if it["url"] in seen:
                continue
            seen.add(it["url"])
            cats[c].append({"title": it["title"], "media": it["media"], "url": it["url"]})
    d["digest"] = [{"tag": c, "name": n, "icon": ic, "items": cats[c]} for c, n, ic in ORDER if cats[c]]
    d["digest_via"] = {"name": "부동산플래닛 간추린 뉴스", "date": b.get("date", ""),
                       "url": "https://inside.bdsplanet.com/news"}
    json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print({x["tag"]: len(x["items"]) for x in d["digest"]})


if __name__ == "__main__":
    main()

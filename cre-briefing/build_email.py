#!/usr/bin/env python3
"""CRE Radar – clean list-style daily briefing (email-safe HTML, A4 width) + A4 print page.

  python3 cre-briefing/build_email.py data.json            > email.html
  python3 cre-briefing/build_email.py data.json --print [chart.png chart2.png] > print.html
  python3 cre-briefing/build_email.py data.json --plain    > email.txt
  python3 cre-briefing/build_email.py data.json --chart|--chart2 > chart.svg
"""
import json
import sys
from html import escape as e

INK, TEXT, MUTE, LINE, BG = "#1f2328", "#2b2f36", "#9aa0a8", "#e9ebef", "#f3f4f6"
FONT = "'Pretendard','Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',Arial,sans-serif"
W = 794
IMG, IMG2 = "cid:att1", "cid:att2"

# section accents (icon, color)
SEC = {
    "brief": ("🗞️", "#2563eb"), "market": ("📊", "#0891b2"), "deals": ("🤝", "#7c3aed"),
    "research": ("🔎", "#0d9488"), "regulation": ("⚖️", "#475569"), "insight": ("💡", "#2563eb"),
    "Office": ("🏢", "#ef4444"), "Hotel": ("🏨", "#8b5cf6"), "Retail": ("🛍️", "#ec4899"),
    "Data Center": ("🖥️", "#0284c7"), "Logistics": ("📦", "#ca8a04"), "Development": ("🏗️", "#ea580c"),
    "Global": ("🌏", "#65a30d"), "Macro": ("💲", "#f97316"),
}
STATUS = {"시행": "#16a34a", "시행 예정": "#d97706", "공포": "#d97706", "입법예고": "#2563eb", "검토": "#6b7280", "추진": "#6b7280"}


# ------------------------------------------------------------------ primitives
def link(text, url, color=TEXT, weight=400):
    if not url:
        return f'<span style="color:{color};font-weight:{weight}">{e(text)}</span>'
    return f'<a href="{e(url)}" style="color:{color};font-weight:{weight};text-decoration:none">{e(text)}</a>'


def media(name, url=None):
    if not name:
        return ""
    return f'<span style="font-size:12px;color:{MUTE};white-space:nowrap">&nbsp;·&nbsp;{link(name, url, MUTE)}</span>'


def bullet(inner, sub=""):
    sub_html = f'<div style="font-size:12.5px;color:#6b7280;line-height:1.6;margin-top:2px">{sub}</div>' if sub else ""
    return (f'<tr><td style="padding:6px 0;vertical-align:top;width:14px;color:#c4c8ce;font-size:14px;line-height:1.6">•</td>'
            f'<td style="padding:6px 0;font-size:14.5px;line-height:1.6;color:{TEXT}">{inner}{sub_html}</td></tr>')


def card(key, title, subtitle, body):
    ic, col = SEC.get(key, ("•", "#2563eb"))
    return (f'<tr><td style="padding:0 0 14px"><div class="card" style="background:#ffffff;border:1px solid {LINE};border-radius:18px;padding:22px 26px 16px">'
            f'<div style="margin-bottom:10px"><span style="font-size:20px;vertical-align:middle">{ic}</span>'
            f'<span style="font-size:20px;font-weight:800;color:{col};margin-left:8px;vertical-align:middle;letter-spacing:-0.3px">{e(title)}</span>'
            f'<span style="font-size:14px;color:{MUTE};margin-left:8px;vertical-align:middle">{e(subtitle)}</span></div>'
            f'{body}</div></td></tr>')


def rows(items):
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + "".join(items) + '</table>'


def accent(text, col):
    return f'<span style="color:{col};font-weight:600">{e(text)}</span>'


def ref_tag(it):
    return '<span style="font-size:11.5px;color:#c2410c">&nbsp;(참고)</span>' if it.get("ref") else ""


def img_block(src_, alt):
    return (f'<div style="margin:6px 0 10px"><img src="{src_}" width="100%" alt="{e(alt)}" '
            f'style="display:block;width:100%;max-width:740px;height:auto;border:0"></div>')


# ------------------------------------------------------------------ chart (svg -> png)
def chart_svg(c):
    W_, L, R, T, RH = 700, 190, 120, 34, 34
    vmax, bars = c["max"], c["bars"]
    H = T + RH * len(bars) + 30
    x = lambda v: L + (W_ - L - R) * v / vmax
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W_}" height="{H}" viewBox="0 0 {W_} {H}" font-family="Pretendard, sans-serif">',
         f'<rect width="{W_}" height="{H}" fill="#ffffff"/>']
    for t in range(0, int(vmax) + 1):
        o.append(f'<line x1="{x(t):.1f}" y1="{T-6}" x2="{x(t):.1f}" y2="{H-26}" stroke="#f0f1f4"/>')
        o.append(f'<text x="{x(t):.1f}" y="{H-10}" font-size="11" fill="{MUTE}" text-anchor="middle">{t}%</text>')
    for i, b in enumerate(bars):
        y = T + i * RH
        col = "#2563eb" if b.get("hl") else "#bfd3fb"
        w = x(b["value"]) - L
        o.append(f'<text x="{L-12}" y="{y+15}" font-size="12.5" fill="#4b5563" text-anchor="end">{e(b["name"])}</text>')
        o.append(f'<path d="M{L},{y+4} h{w-4:.1f} a4,4 0 0 1 4,4 v8 a4,4 0 0 1 -4,4 h-{w-4:.1f} z" fill="{col}"/>')
        o.append(f'<text x="{x(b["value"])+8:.1f}" y="{y+15}" font-size="13" font-weight="700" fill="{INK}">{b["value"]:.2f}%</text>')
        if b.get("note"):
            o.append(f'<text x="{x(b["value"])+62:.1f}" y="{y+15}" font-size="11" fill="{MUTE}">{e(b["note"])}</text>')
    r = c.get("ref")
    if r:
        rx = x(r["value"])
        o.append(f'<line x1="{rx:.1f}" y1="{T-4}" x2="{rx:.1f}" y2="{H-26}" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 3"/>')
        o.append(f'<text x="{rx:.1f}" y="{T-12}" font-size="12" font-weight="700" fill="#ef4444" text-anchor="middle">{e(r["name"])} {r["value"]:.1f}%</text>')
    o.append("</svg>")
    return "".join(o)


# ------------------------------------------------------------------ sections
def header(d):
    return (f'<tr><td style="padding:0 0 14px"><div class="card" style="background:#ffffff;border:1px solid {LINE};border-radius:18px;padding:22px 26px">'
            f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>'
            f'<td style="width:46px;font-size:30px;vertical-align:middle">📰</td>'
            f'<td style="vertical-align:middle"><div><span style="font-size:22px;font-weight:800;color:{INK};letter-spacing:-0.4px">{e(d["date"])} ({e(d["weekday"])}) CRE Radar</span>'
            f'<span style="display:inline-block;margin-left:10px;background:#eaf2ff;color:#2563eb;font-size:13px;font-weight:700;padding:3px 10px;border-radius:8px;vertical-align:middle">VOL.{e(str(d.get("issue", 1)))}</span></div>'
            f'<div style="font-size:13.5px;color:#6b7280;margin-top:4px">매일 아침 상업용 부동산 시장을 정리해 드립니다 · 오피스 · 호텔 · 리테일 · 데이터센터 · 물류 · 개발</div></td>'
            f'</tr></table></div></td></tr>')


def brief(d):
    b = d["brief"]
    col = SEC["brief"][1]
    items = [bullet(f'{accent("TOP", col)}&nbsp; {link(b["headline"], b["url"], INK, 700)}{media(b["src"], b["url"])}', e(b["lead"]))]
    for p in b["points"]:
        items.append(bullet(f'<span style="color:{MUTE};font-size:12.5px">[{e(p["tag"])}]</span> {e(p["text"])}'))
    return card("brief", "Today's Brief", "오늘의 핵심", rows(items))


def market(d):
    ind = d["indicators"]
    items = []
    for t in ind["rates"]:
        chg_col = {"up": "#dc2626", "dn": "#2563eb"}.get(t.get("dir"), MUTE)
        arrow = {"up": "▲ ", "dn": "▼ "}.get(t.get("dir"), "")
        items.append(bullet(f'{e(t["name"])} <b style="color:{INK}">{e(t["value"])}</b> '
                            f'<span style="font-size:13px;color:{chg_col}">{arrow}{e(t.get("chg", ""))}</span>'
                            f'{media(t["asof"] + " " + t["src"], t.get("url"))}'))
    for v in ind.get("valuation", []):
        items.append(bullet(f'{e(v["name"])} <b style="color:{INK}">{e(v["value"])}</b>{media(v["note"], v.get("url"))}'))
    note = f'<div style="font-size:12px;color:{MUTE};margin:4px 0 2px">{e(ind.get("note", ""))}</div>' if ind.get("note") else ""
    c = ind.get("chart")
    chart = (f'<div style="font-size:14px;font-weight:700;color:{INK};margin-top:12px">{e(c["title"])}</div>'
             f'<div style="font-size:12px;color:{MUTE}">{e(c["sub"])}</div>' + img_block(IMG, c["title"])) if c else ""
    return card("market", "Market Indicators", "금리 · 조달 · 밸류에이션", rows(items) + note + chart)


def deals(d):
    col = SEC["deals"][1]
    items = []
    for x in d["deals"]:
        rate = ("금리 " + x["rate"]) if x.get("rate") not in (None, "", "-") else ""
        facts = " · ".join(v for v in [x.get("amount"), rate, x.get("stage")] if v and v != "-")
        items.append(bullet(f'{link(x["asset"], x.get("url"), INK, 600)} {accent("— " + facts, col) if facts else ""}{media(x["src"], x.get("url"))}',
                            e(x.get("detail", ""))))
    lv = " &nbsp;|&nbsp; ".join(f'{e(l["asset"])} <b style="color:{col}">{e(l["level"])}</b>' for l in d.get("levels", []))
    foot = (f'<div style="background:#f7f5ff;border-radius:12px;padding:10px 14px;margin-top:8px;font-size:13px;color:{TEXT};line-height:1.7">'
            f'<span style="color:{MUTE};font-size:12px">현재 선순위 조달 수준(실제 딜 기준)</span><br>{lv}</div>') if lv else ""
    return card("deals", "Deals & Financing", "주요 거래 · 실제 조달 금리", rows(items) + foot)


def research(d):
    rs = d.get("research")
    if not rs:
        return ""
    col = SEC["research"][1]
    body = ""
    c = rs.get("chart")
    if c:
        body += (f'<div style="font-size:14px;font-weight:700;color:{INK}">{e(c["title"])}</div>'
                 f'<div style="font-size:12px;color:{MUTE}">{e(c["sub"])}</div>' + img_block(IMG2, c["title"]))
    items = []
    for r in rs["reports"]:
        facts = " · ".join(f'{m[0]} {m[1]}' for m in r.get("metrics", []))
        items.append(bullet(f'{accent("[" + r["house"] + " · " + r.get("period", "") + "]", col)} '
                            f'{link(r["title"], r.get("url"), INK, 600)}{ref_tag(r)}{media(r["src"], r.get("url"))}',
                            e(facts) + ((" — " + e(r["note"])) if r.get("note") else "")))
    return card("research", "Research Desk", "자문사 · 리서치 · 증권사 · 상장리츠", body + rows(items))


def digest(d):
    out = []
    for g in d.get("digest", []):
        items = []
        for it in g["items"]:
            w = 600 if it.get("own") else 400
            items.append(bullet(f'{link(it["title"], it.get("url"), TEXT, w)}{ref_tag(it)}{media(it.get("media", ""), it.get("url"))}',
                                e(it["text"]) if it.get("own") and it.get("text") else ""))
        out.append(card(g["tag"], g["tag"], g["name"], rows(items)))
    if d.get("digest_via"):
        v = d["digest_via"]
        out.append(f'<tr><td style="padding:0 6px 14px;font-size:12px;color:{MUTE}">섹터 뉴스 일부 큐레이션 · '
                   f'{link(v["name"], v.get("url"), MUTE)} {e(v.get("date", ""))} · 굵은 제목은 CRE Radar 요약 포함</td></tr>')
    return "".join(out)


def regulation(d):
    items = []
    for g in d.get("regulation", []):
        items.append(f'<tr><td colspan="2" style="padding:10px 0 2px;font-size:13px;font-weight:700;color:#475569">{e(g["tag"])} · {e(g["name"])}</td></tr>')
        for it in g["items"]:
            st = it.get("status", "")
            items.append(bullet(f'<span style="font-size:12.5px;color:{STATUS.get(st, MUTE)};font-weight:700">[{e(st)}]</span> '
                                f'{link(it["title"], it.get("url"), INK, 600)}{media(it["src"], it.get("url"))}', e(it.get("text", ""))))
    return card("regulation", "Regulation", "자본시장법 · 리츠 · 금융규제 · 부동산 법령", rows(items))


def insight(d):
    items = [bullet(f'<b style="color:{INK}">{e(x["title"])}</b>', e(x["text"])) for x in d.get("insights", [])]
    return card("insight", "Insight", "투자자 관점 코멘트", rows(items))


def footer():
    return (f'<tr><td style="padding:4px 8px 0;font-size:11.5px;color:{MUTE};line-height:1.7">'
            f'본 자료는 공개 보도와 리서치 발표를 바탕으로 정리한 자동 생성 브리핑이며 투자 권유가 아닙니다. '
            f'(참고)는 오늘 이전 보도입니다. 수치는 원문으로 확인하시기 바랍니다. 인쇄용 A4 PDF를 함께 첨부합니다.</td></tr>')


def build(d, for_print=False):
    body = (header(d) + brief(d) + market(d) + deals(d) + research(d) + digest(d) +
            regulation(d) + insight(d) + footer())
    inner = (f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
             f'style="max-width:{W}px;margin:0 auto;border-collapse:collapse"><tbody>{body}</tbody></table>')
    if not for_print:
        return f'<div style="background:{BG};padding:22px 12px;font-family:{FONT};color:{TEXT}">{inner}</div>'
    return ('<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:10mm}'
            f'html,body{{margin:0;background:{BG}}}.card{{break-inside:avoid}}</style></head>'
            f'<body style="font-family:{FONT};color:{TEXT};background:{BG};padding:8px">{inner}</body></html>')


def plain(d):
    b = d["brief"]
    out = [f'CRE Radar {d["date"]} ({d["weekday"]})', "", f'TOP: {b["headline"]} ({b["src"]})']
    out += [f'- [{p["tag"]}] {p["text"]}' for p in b["points"]]
    out += ["", " / ".join(f'{r["name"]} {r["value"]}' for r in d["indicators"]["rates"]), "",
            "HTML 보기 또는 첨부 A4 PDF로 전체 브리핑을 확인하세요."]
    return "\n".join(out)


if __name__ == "__main__":
    data = json.load(open(sys.argv[1], encoding="utf-8"))
    mode = sys.argv[2] if len(sys.argv) > 2 else ""
    if mode == "--chart":
        print(chart_svg(data["indicators"]["chart"]))
    elif mode == "--chart2":
        print(chart_svg(data["research"]["chart"]) if data.get("research", {}).get("chart") else "")
    elif mode == "--plain":
        print(plain(data))
    else:
        if mode == "--print":
            IMG = sys.argv[3] if len(sys.argv) > 3 else "chart.png"
            IMG2 = sys.argv[4] if len(sys.argv) > 4 else "chart2.png"
        print(build(data, for_print=(mode == "--print")))

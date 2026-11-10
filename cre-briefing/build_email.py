#!/usr/bin/env python3
"""CRE Radar – A4-width daily briefing (email-safe HTML + printable A4 PDF).

  python3 cre-briefing/build_email.py data.json            > email.html   (email body)
  python3 cre-briefing/build_email.py data.json --print    > print.html   (A4 print page)
  python3 cre-briefing/build_email.py data.json --plain    > email.txt
  node    cre-briefing/make_pdf.js print.html out.pdf

Schema: see cre-briefing/README.md and data/2026-11-10.json.
"""
import json
import sys
from html import escape as e

INK, SUB, MUTE, LINE = "#16161d", "#55555f", "#8d8d98", "#e4e4ea"
BRAND, BRAND_SOFT, PAGE = "#2b2690", "#eeebfd", "#ffffff"
UP, DN = "#c2410c", "#1d4ed8"
FONT = "'Pretendard','Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',Arial,sans-serif"
W = 794  # A4 width @96dpi
IMG = "cid:att1"  # email: inline attachment #1 (PDF is #0)
IMG2 = "cid:att2"  # second chart (research comparison)

STATUS = {"시행": ("#e7f6ec", "#1a7f37"), "시행 예정": ("#fff4e5", "#a75500"),
          "공포": ("#fff4e5", "#a75500"), "입법예고": ("#eaf1ff", "#1d4ed8"),
          "검토": ("#f1f1f4", "#55555f"), "추진": ("#f1f1f4", "#55555f")}


def pill(t, bg=BRAND_SOFT, fg=BRAND):
    return (f'<span style="display:inline-block;background:{bg};color:{fg};font-size:11px;'
            f'font-weight:700;padding:2px 8px;border-radius:5px;white-space:nowrap;line-height:18px">{e(t)}</span>')


def a(text, url, color=INK, weight=600):
    if not url:
        return f'<span style="color:{color};font-weight:{weight}">{e(text)}</span>'
    return f'<a href="{e(url)}" style="color:{color};font-weight:{weight};text-decoration:none">{e(text)}</a>'


def src(name, url):
    return (f'<span style="font-size:11px;color:{MUTE};white-space:nowrap">Source · '
            f'{a(name, url, BRAND, 600)}</span>')


def head(num, title, sub):
    return f'<tr class="sec"><td>{head_div(num, title, sub)}</td></tr>'


def head_div(num, title, sub):
    return (f'<div style="padding:44px 0 14px">'
            f'<table role="presentation" cellpadding="0" cellspacing="0"><tr>'
            f'<td style="font-size:34px;font-weight:900;color:{BRAND};letter-spacing:-1px;line-height:1;padding-right:12px">{num}</td>'
            f'<td style="border-left:2px solid {BRAND};padding-left:12px">'
            f'<div style="font-size:20px;font-weight:800;color:{INK};letter-spacing:-0.4px;line-height:1.15">{e(title)}</div>'
            f'<div style="font-size:12px;color:{MUTE};margin-top:2px">{e(sub)}</div></td>'
            f'</tr></table></div>')


def box(inner, pad="6px 20px"):
    return (f'<tr><td class="box" style="border:1px solid {LINE};border-radius:12px;padding:{pad};'
            f'background:#ffffff">{inner}</td></tr>')


def rows_table(rows):
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + "".join(rows) + '</table>'


def sep(i):
    return "" if i == 0 else f"border-top:1px solid {LINE};"


# ------------------------------------------------------------------ sections
def masthead(d):
    return (f'<tr><td style="padding:0 0 14px;border-bottom:3px solid {INK}">'
            f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>'
            f'<td style="vertical-align:bottom">'
            f'<div style="font-size:11px;color:{MUTE};letter-spacing:1.5px;font-weight:600">KOREA COMMERCIAL REAL ESTATE DAILY</div>'
            f'<div style="font-size:38px;font-weight:900;letter-spacing:-1.5px;line-height:1.05;margin-top:4px">'
            f'CRE <span style="color:{BRAND}">Radar</span></div></td>'
            f'<td style="vertical-align:bottom;text-align:right;font-size:12px;color:{SUB};line-height:1.6">'
            f'<div style="font-size:15px;font-weight:800;color:{INK}">{e(d["date"])} ({e(d["weekday"])})</div>'
            f'<div>No. {e(str(d.get("issue", 1)))} · 오피스 · 호텔 · 리테일 · 데이터센터 · 물류 · 개발</div></td>'
            f'</tr></table></td></tr>')


def brief(d):
    b = d["brief"]
    pts = "".join(
        f'<tr><td style="{sep(i)}padding:9px 0;width:26px;vertical-align:top;font-size:13px;font-weight:800;color:{BRAND}">{i+1}</td>'
        f'<td style="{sep(i)}padding:9px 0;width:92px;vertical-align:top">{pill(p["tag"])}</td>'
        f'<td style="{sep(i)}padding:9px 0;font-size:13.5px;line-height:1.55;color:{INK}">{e(p["text"])}</td>'
        f'<td style="{sep(i)}padding:9px 0 9px 10px;vertical-align:top;text-align:right;font-size:11px;color:{MUTE};white-space:nowrap">→ {e(p["ref"])}</td></tr>'
        for i, p in enumerate(b["points"]))
    hero = (f'<div style="background:{BRAND};border-radius:12px;padding:20px 22px;color:#ffffff">'
            f'<div style="font-size:11px;font-weight:700;letter-spacing:1px;opacity:.8">TOP STORY · {e(b["tag"])}</div>'
            f'<div style="font-size:21px;font-weight:800;line-height:1.35;margin:6px 0 6px;letter-spacing:-0.4px">{e(b["headline"])}</div>'
            f'<div style="font-size:13.5px;line-height:1.6;opacity:.92">{e(b["lead"])}</div>'
            f'<div style="font-size:11px;margin-top:10px;opacity:.85">Source · '
            f'<a href="{e(b["url"])}" style="color:#ffffff;font-weight:700;text-decoration:underline">{e(b["src"])}</a></div></div>')
    return (head("01", "Today's Brief", "오늘 꼭 알아야 할 것") +
            f'<tr><td>{hero}</td></tr>' +
            f'<tr><td style="padding-top:8px">{rows_table([pts])}</td></tr>')


def chart_svg(c):
    """Single-series horizontal bars + one reference line (cap rate). Direct labels, no legend."""
    W_, L, R, T, RH = 700, 190, 120, 34, 34
    vmax = c["max"]
    bars = c["bars"]
    H = T + RH * len(bars) + 30
    x = lambda v: L + (W_ - L - R) * v / vmax
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W_}" height="{H}" viewBox="0 0 {W_} {H}" '
         f'font-family="Pretendard, sans-serif">', f'<rect width="{W_}" height="{H}" fill="#ffffff"/>']
    for t in range(0, int(vmax) + 1):
        o.append(f'<line x1="{x(t):.1f}" y1="{T-6}" x2="{x(t):.1f}" y2="{H-26}" stroke="#eeeef2"/>')
        o.append(f'<text x="{x(t):.1f}" y="{H-10}" font-size="11" fill="{MUTE}" text-anchor="middle">{t}%</text>')
    for i, b in enumerate(bars):
        y = T + i * RH
        col = BRAND if b.get("hl") else "#c9c6ee"
        o.append(f'<text x="{L-12}" y="{y+15}" font-size="12.5" fill="{SUB}" text-anchor="end">{e(b["name"])}</text>')
        w = x(b["value"]) - L
        o.append(f'<path d="M{L},{y+4} h{w-4:.1f} a4,4 0 0 1 4,4 v8 a4,4 0 0 1 -4,4 h-{w-4:.1f} z" fill="{col}"/>')
        o.append(f'<text x="{x(b["value"])+8:.1f}" y="{y+15}" font-size="13" font-weight="800" fill="{INK}">{b["value"]:.2f}%</text>')
        if b.get("note"):
            o.append(f'<text x="{x(b["value"])+62:.1f}" y="{y+15}" font-size="11" fill="{MUTE}">{e(b["note"])}</text>')
    r = c.get("ref")
    if not r:
        o.append('</svg>')
        return "".join(o)
    rx = x(r["value"])
    o.append(f'<line x1="{rx:.1f}" y1="{T-4}" x2="{rx:.1f}" y2="{H-26}" stroke="#c2410c" stroke-width="2" stroke-dasharray="4 3"/>')
    o.append(f'<text x="{rx:.1f}" y="{T-12}" font-size="12" font-weight="800" fill="#c2410c" text-anchor="middle">'
             f'{e(r["name"])} {r["value"]:.1f}%</text>')
    o.append('</svg>')
    return "".join(o)


def chart(c, img_src):
    return (f'<div style="font-size:13px;font-weight:800;color:{INK}">{e(c["title"])}</div>'
            f'<div style="font-size:11px;color:{MUTE};margin:2px 0 6px;line-height:1.5">{e(c["sub"])}</div>'
            f'<img src="{img_src}" width="100%" alt="{e(c["title"])}" style="display:block;width:100%;max-width:700px;height:auto;border:0">')


def indicators(d):
    ind = d["indicators"]
    tiles = ind["rates"]
    cells = []
    for t in tiles:
        col = {"up": UP, "dn": DN}.get(t.get("dir"), MUTE)
        arrow = {"up": "▲", "dn": "▼"}.get(t.get("dir"), "–")
        cells.append(
            f'<td width="{100//len(tiles)}%" style="padding:10px 8px;vertical-align:top;border-left:1px solid {LINE}">'
            f'<div style="font-size:11px;color:{SUB};white-space:nowrap">{e(t["name"])}</div>'
            f'<div style="font-size:19px;font-weight:900;letter-spacing:-0.5px;margin-top:2px">{e(t["value"])}</div>'
            f'<div style="font-size:11px;color:{col};white-space:nowrap">{arrow} {e(t.get("chg", ""))}</div>'
            f'<div style="font-size:10px;color:{MUTE};margin-top:3px;white-space:nowrap">{a(t["asof"] + " " + t["src"], t.get("url"), MUTE, 400)}</div></td>')
    tile_row = (f'<tr><td class="box" style="border:1px solid {LINE};border-radius:12px;padding:0">'
                f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>'
                + "".join(cells).replace(f'border-left:1px solid {LINE}', '', 1) + '</tr></table></td></tr>')
    val = "".join(
        f'<td width="33%" style="padding:0 6px 0 0;vertical-align:top"><div style="background:{BRAND_SOFT};border-radius:10px;padding:10px 12px">'
        f'<div style="font-size:11px;color:{SUB}">{e(v["name"])}</div>'
        f'<div style="font-size:18px;font-weight:900;color:{BRAND}">{e(v["value"])}</div>'
        f'<div style="font-size:10.5px;color:{MUTE}">{a(v["note"], v.get("url"), MUTE, 400)}</div></div></td>'
        for v in ind["valuation"])
    note = f'<div style="font-size:10.5px;color:{MUTE};margin-top:6px">{e(ind.get("note", ""))}</div>'
    return (head("02", "Market Indicators", "금리 · 조달 · 밸류에이션") + tile_row +
            f'<tr><td style="padding-top:8px">{note}</td></tr>' +
            f'<tr><td style="padding-top:12px">' +
            f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="box" style="border:1px solid {LINE};border-radius:12px;padding:14px 18px">'
            f'{chart(ind["chart"], IMG)}</td></tr></table></td></tr>' +
            f'<tr><td style="padding-top:10px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>{val}</tr></table></td></tr>')


def deals(d):
    hdr = (f'<tr>' + "".join(
        f'<td style="font-size:10.5px;color:{MUTE};font-weight:700;padding:8px 6px 6px 0;border-bottom:1px solid {INK};{al}">{h}</td>'
        for h, al in [("유형", ""), ("자산 · 거래", ""), ("규모", "text-align:right;"), ("금리", "text-align:right;"), ("단계", "text-align:right;")]) + '</tr>')
    rows = []
    for i, x in enumerate(d["deals"]):
        rows.append(
            f'<tr><td style="padding:10px 6px 10px 0;vertical-align:top;width:78px;border-bottom:1px solid {LINE}">{pill(x["type"])}</td>'
            f'<td style="padding:10px 6px 10px 0;border-bottom:1px solid {LINE}">'
            f'<div style="font-size:13.5px;font-weight:700;color:{INK}">{a(x["asset"], x.get("url"))}</div>'
            f'<div style="font-size:12px;color:{SUB};margin-top:2px;line-height:1.5">{e(x["detail"])}</div>'
            f'<div style="margin-top:3px">{src(x["src"], x.get("url"))}</div></td>'
            f'<td style="padding:10px 6px 10px 0;text-align:right;vertical-align:top;font-size:12.5px;font-weight:700;white-space:nowrap;border-bottom:1px solid {LINE}">{e(x["amount"])}</td>'
            f'<td style="padding:10px 6px 10px 0;text-align:right;vertical-align:top;font-size:14px;font-weight:900;color:{BRAND};white-space:nowrap;border-bottom:1px solid {LINE}">{e(x["rate"])}</td>'
            f'<td style="padding:10px 0;text-align:right;vertical-align:top;font-size:11px;color:{SUB};white-space:nowrap;border-bottom:1px solid {LINE}">{e(x["stage"])}</td></tr>')
    lv = "".join(
        f'<tr><td style="padding:5px 0;font-size:12px;color:{SUB};width:80px">{e(x["asset"])}</td>'
        f'<td style="padding:5px 0;font-size:13px;font-weight:800;color:{BRAND};width:170px">{e(x["level"])}</td>'
        f'<td style="padding:5px 0;font-size:11px;color:{MUTE}">{e(x["basis"])}</td></tr>' for x in d["levels"])
    return (f'<tr class="pb-before blk"><td>{head_div("03", "Deals & Financing", "주요 거래와 실제 조달 금리")}{rows_table([hdr] + rows)}</td></tr>' +
            f'<tr><td style="padding-top:10px"><div style="background:#f7f7fa;border-radius:10px;padding:8px 14px">'
            f'<div style="font-size:11px;font-weight:800;color:{INK};margin:2px 0 2px">현재 선순위 조달 수준 (실제 딜 기준)</div>'
            f'{rows_table([lv])}</div></td></tr>')


def item_rows(items, status=False):
    rows = []
    for i, it in enumerate(items):
        badge = ""
        if status:
            bg, fg = STATUS.get(it.get("status", ""), ("#f1f1f4", SUB))
            badge = pill(it["status"], bg, fg) + "&nbsp;"
        ref = f'&nbsp;<span style="font-size:10.5px;color:#c2410c;font-weight:700;white-space:nowrap">참고</span>' if it.get("ref") else ""
        text = (f'<div style="font-size:12px;color:{SUB};margin-top:2px;line-height:1.5">{e(it["text"])}</div>'
                if it.get("text") else "")
        rows.append(
            f'<tr><td style="{sep(i)}padding:8px 0">'
            f'<div style="font-size:13px;line-height:1.45">{badge}{a(it["title"], it.get("url"), INK, 700)}{ref}</div>'
            f'{text}<div style="margin-top:3px">{src(it["src"], it.get("url"))}</div></td>'
            f'<td style="{sep(i)}padding:9px 0 9px 10px;width:40px;text-align:right;vertical-align:top;font-size:11px;color:{MUTE};white-space:nowrap">{e(it.get("date", ""))}</td></tr>')
    return rows_table(rows)


def card(g, status):
    items = g["items"] or [{"title": "특이사항 없음", "src": "-", "date": ""}]
    return (f'<div class="box" style="border:1px solid {LINE};border-radius:12px;padding:10px 16px 2px;background:#ffffff">'
            f'<div style="padding-bottom:6px;border-bottom:1px solid {LINE}">{pill(g["tag"])}'
            f'<span style="font-size:14.5px;font-weight:800;margin-left:8px;vertical-align:middle">{e(g["name"])}</span></div>'
            f'{item_rows(items, status)}</div>')


def grouped(groups, status=False, title=""):
    out = []
    for k in range(0, len(groups), 2):
        pair = groups[k:k + 2]
        tds = [f'<td width="50%" style="vertical-align:top;padding:0 {6 if j == 0 else 0}px 10px {0 if j == 0 else 6}px">{card(g, status)}</td>'
               for j, g in enumerate(pair)]
        if len(tds) == 1:
            tds.append('<td width="50%"></td>')
        lead = title if k == 0 else ""
        out.append(f'<tr class="blk"><td>{lead}<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>{"".join(tds)}</tr></table></td></tr>')
    return "".join(out)


def digest_card(g):
    rows = []
    for i, it in enumerate(g["items"]):
        top = "" if i == 0 else f"border-top:1px dashed {LINE};"
        ref = f'&nbsp;<span style="font-size:10.5px;color:#c2410c;font-weight:700;white-space:nowrap">참고</span>' if it.get("ref") else ""
        media = (f'<span style="font-size:11.5px;color:{MUTE};white-space:nowrap">&nbsp;·&nbsp;{a(it.get("media", ""), it.get("url"), MUTE, 500)}</span>'
                 if it.get("media") else "")
        if it.get("own"):
            body = (f'<div style="font-size:13.5px;line-height:1.5"><span style="color:{BRAND};font-weight:900">■</span>&nbsp;'
                    f'{a(it["title"], it.get("url"), INK, 800)}{ref}{media}</div>'
                    + (f'<div style="font-size:12.5px;color:{SUB};line-height:1.55;margin:3px 0 0 16px">{e(it["text"])}</div>' if it.get("text") else ""))
        else:
            body = (f'<div style="font-size:13.5px;line-height:1.5"><span style="color:{MUTE}">•</span>&nbsp;'
                    f'{a(it["title"], it.get("url"), INK, 500)}{media}</div>')
        rows.append(f'<tr><td style="{top}padding:7px 0">{body}</td>'
                    f'<td style="{top}padding:7px 0 7px 8px;width:40px;text-align:right;vertical-align:top;font-size:11px;color:{MUTE};white-space:nowrap">{e(it.get("date", ""))}</td></tr>')
    return (f'<tr class="blk"><td style="padding:0 0 12px"><div class="box" style="border:1px solid {LINE};border-radius:14px;background:#ffffff;overflow:hidden">'
            f'<div style="background:#f7f6fe;padding:11px 18px;border-bottom:1px solid {LINE}">'
            f'<table role="presentation" cellpadding="0" cellspacing="0"><tr>'
            f'<td style="width:34px;height:34px;background:#ffffff;border:1px solid {LINE};border-radius:17px;text-align:center;font-size:17px;line-height:34px">{g["icon"]}</td>'
            f'<td style="padding-left:10px"><span style="font-size:17px;font-weight:900;color:{BRAND};letter-spacing:-0.3px">{e(g["tag"])}</span>'
            f'<span style="font-size:13px;color:{SUB};font-weight:600;margin-left:8px">{e(g["name"])}</span>'
            f'<span style="font-size:11px;color:{MUTE};margin-left:8px">{len(g["items"])}건</span></td></tr></table></div>'
            f'<div style="padding:4px 18px 6px">{rows_table(rows)}</div></div></td></tr>')


def sectors(d):
    if not d.get("digest"):
        return grouped(d["sectors"], title=head_div("05", "Sector Briefing", "섹터별 주요 사항"))
    via = d.get("digest_via", {})
    legend = (f'<div style="font-size:11.5px;color:{MUTE};margin:-4px 0 12px">'
              f'<span style="color:{BRAND};font-weight:900">■</span> CRE Radar 리서치(요약 포함) &nbsp; '
              f'<span>•</span> 큐레이션 헤드라인 — {a(via.get("name", ""), via.get("url"), BRAND, 600)} {e(via.get("date", ""))} · 각 기사 매체명을 누르면 원문</div>')
    first = d["digest"][0]
    out = [f'<tr class="sec"><td>{head_div("05", "News Digest", "상업용 부동산 섹터별 뉴스")}{legend}</td></tr>']
    out += [digest_card(g) for g in d["digest"]]
    return "".join(out)


def research(d, num):
    rs = d.get("research")
    if not rs:
        return ""
    cmp_ = ""
    if rs.get("chart"):
        c = rs["chart"]
        cmp_ = (f'<tr><td style="padding-bottom:12px"><div class="box" style="border:1px solid {LINE};border-radius:12px;padding:14px 18px">'
                f'<div style="font-size:13px;font-weight:800;color:{INK}">{e(c["title"])}</div>'
                f'<div style="font-size:11px;color:{MUTE};margin:2px 0 6px;line-height:1.5">{e(c["sub"])}</div>'
                f'<img src="{IMG2}" width="100%" alt="{e(c["title"])}" style="display:block;width:100%;max-width:700px;height:auto;border:0"></div></td></tr>')
    cards = []
    for k in range(0, len(rs["reports"]), 2):
        tds = []
        for j, r in enumerate(rs["reports"][k:k + 2]):
            kp = "".join(
                f'<tr><td style="padding:3px 0;font-size:11.5px;color:{SUB};width:46%">{e(m[0])}</td>'
                f'<td style="padding:3px 0;font-size:13px;font-weight:800;color:{BRAND};text-align:right">{e(m[1])}</td></tr>'
                for m in r.get("metrics", []))
            ref = f'&nbsp;<span style="font-size:10.5px;color:#c2410c;font-weight:700;white-space:nowrap">참고</span>' if r.get("ref") else ""
            tds.append(
                f'<td width="50%" style="vertical-align:top;padding:0 {6 if j == 0 else 0}px 10px {0 if j == 0 else 6}px">'
                f'<div class="box" style="border:1px solid {LINE};border-radius:12px;padding:12px 16px;background:#ffffff">'
                f'<div>{pill(r["house"])}<span style="font-size:11px;color:{MUTE};margin-left:6px">{e(r.get("kind", ""))} · {e(r.get("period", ""))}</span>{ref}</div>'
                f'<div style="font-size:13.5px;font-weight:800;line-height:1.45;margin:6px 0 4px">{a(r["title"], r.get("url"), INK, 800)}</div>'
                f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid {LINE};margin-top:4px">{kp}</table>'
                + (f'<div style="font-size:12px;color:{SUB};line-height:1.55;margin-top:6px">{e(r["note"])}</div>' if r.get("note") else "")
                + f'<div style="margin-top:6px">{src(r["src"], r.get("url"))}</div></div></td>')
        if len(tds) == 1:
            tds.append('<td width="50%"></td>')
        cards.append(f'<tr class="blk"><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>{"".join(tds)}</tr></table></td></tr>')
    intro = f'<div style="font-size:11.5px;color:{MUTE};margin:-4px 0 12px">{e(rs.get("intro", ""))}</div>'
    return (f'<tr class="sec"><td>{head_div(num, "Research Desk", "자문사 · 리서치 · 증권사 · 상장리츠 리포트")}{intro}</td></tr>'
            + cmp_ + "".join(cards))


def regulation(d):
    return grouped(d["regulation"], status=True, title=head_div("06", "Regulation", "법령 · 규제 · 제도 변화"))


def insight(d):
    items = "".join(
        f'<tr><td style="{sep(i)}padding:11px 0;width:28px;vertical-align:top;font-size:16px;font-weight:900;color:{BRAND}">{i+1}</td>'
        f'<td style="{sep(i)}padding:11px 0"><div style="font-size:14px;font-weight:800;color:{INK}">{e(x["title"])}</div>'
        f'<div style="font-size:12.5px;color:{SUB};line-height:1.6;margin-top:2px">{e(x["text"])}</div></td></tr>'
        for i, x in enumerate(d["insights"]))
    return (f'<tr class="blk"><td>{head_div("07", "Insight", "투자자 관점 분석 코멘트")}'
            f'<div class="box" style="border:1px solid {LINE};border-radius:12px;padding:4px 20px">{rows_table([items])}</div></td></tr>')


def footer(d):
    return (f'<tr><td style="padding:22px 0 0;border-top:1px solid {LINE};margin-top:20px;font-size:10.5px;color:{MUTE};line-height:1.6">'
            f'본 자료는 공개 보도 기반 자동 생성 브리핑이며 투자 권유가 아닙니다. '
            f'<span style="color:#c2410c;font-weight:700">참고</span> 표시는 오늘 이전 보도이며, 수치는 원문으로 확인하시기 바랍니다. '
            f'모든 항목의 Source를 누르면 원문으로 이동합니다. 인쇄용 A4 PDF를 함께 첨부합니다.</td></tr>')


def pdf_note(d):
    return (f'<tr><td style="padding-top:22px"><div style="border:2px solid {BRAND};border-radius:12px;padding:14px 18px">'
            f'<div style="font-size:14px;font-weight:800;color:{BRAND}">📎 전체 브리핑은 첨부 PDF(A4)에서 보실 수 있습니다</div>'
            f'<div style="font-size:12.5px;color:{SUB};margin-top:4px;line-height:1.6">03 Deals &amp; Financing · 04 Sector Briefing · '
            f'05 Regulation · 06 Insight는 첨부 파일 <b>CRE_Radar_{e(d["date"].replace(".", "-"))}.pdf</b>에 있습니다. PDF의 Source를 누르면 원문으로 이동합니다.</div>'
            f'</div></td></tr>')


def build(d, for_print=False, short=False):
    if short:
        body = masthead(d) + brief(d) + indicators(d) + pdf_note(d) + footer(d)
        return _wrap(body, False)
    body = (masthead(d) + brief(d) + indicators(d) + deals(d) +
            research(d, "04") + sectors(d) + regulation(d) + insight(d) + footer(d))
    return _wrap(body, for_print)


def _wrap(body, for_print):
    pad = "0" if for_print else "28px 36px"
    inner = (f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
             f'style="max-width:{W}px;margin:0 auto;border-collapse:collapse;background:{PAGE}"><tbody>'
             f'<tr><td style="padding:{pad}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tbody>'
             f'{body}</tbody></table></td></tr></tbody></table>')
    wrap = f'<div style="background:#eeeef2;padding:16px 0;font-family:{FONT};color:{INK}">{inner}</div>'
    if not for_print:
        return wrap
    return ('<!doctype html><html><head><meta charset="utf-8"><style>'
            '@page{size:A4;margin:12mm 11mm}html,body{margin:0;background:#fff}'
            '.box,.blk,.sec{break-inside:avoid}.sec{break-after:avoid}.pb-before{break-before:page}'
            f'</style></head><body style="font-family:{FONT};color:{INK}">' + inner + '</body></html>')


def plain(d):
    b = d["brief"]
    out = [f'CRE Radar {d["date"]} ({d["weekday"]})', "", f'TOP: {b["headline"]} ({b["src"]})']
    out += [f'{i+1}. [{p["tag"]}] {p["text"]}' for i, p in enumerate(b["points"])]
    out += ["", " / ".join(f'{r["name"]} {r["value"]}' for r in d["indicators"]["rates"]), "",
            "HTML 보기 또는 첨부된 A4 PDF로 전체 브리핑을 확인하세요."]
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
        print(build(data, for_print=(mode == "--print"), short=(mode == "--short")))

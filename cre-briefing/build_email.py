#!/usr/bin/env python3
"""Build the Korea CRE daily briefing email (email-safe HTML, inline styles).

Usage: python3 cre-briefing/build_email.py <data.json> > out.html
See cre-briefing/README.md for the JSON schema.
"""
import json
import sys
from html import escape as e

INK = "#16161d"
SUB = "#6b6b76"
MUTE = "#9a9aa5"
LINE = "#e6e6ec"
BRAND = "#2b2690"
PILL_BG = "#eeebfd"
PAGE = "#f4f4f6"
UP = "#d4380d"
DN = "#1d5fd1"
FONT = "'Pretendard','Apple SD Gothic Neo','Malgun Gothic',Arial,sans-serif"


def pill(text):
    return (f'<span style="display:inline-block;background:{PILL_BG};color:{BRAND};'
            f'font-size:12px;font-weight:600;padding:4px 10px;border-radius:6px;'
            f'white-space:nowrap">{e(text)}</span>')


def link(text, url, color=INK, weight="400"):
    if not url:
        return f'<span style="color:{color};font-weight:{weight}">{e(text)}</span>'
    return (f'<a href="{e(url)}" style="color:{color};font-weight:{weight};'
            f'text-decoration:none">{e(text)}</a>')


def src_line(src, url):
    return (f'<div style="font-size:11.5px;color:{MUTE};margin-top:5px">Source · '
            f'{link(src, url, BRAND, "600")}{" ↗" if url else ""}</div>')


def section_head(num, title, sub):
    return (f'<tr><td style="padding:34px 0 12px">'
            f'<span style="font-size:13px;color:{MUTE};margin-right:10px">{e(num)}</span>'
            f'<span style="font-size:24px;font-weight:800;color:{INK};letter-spacing:-0.5px">{e(title)}</span>'
            f'<span style="font-size:13px;color:{SUB};margin-left:10px">{e(sub)}</span>'
            f'</td></tr>')


def card(inner, pad="8px 24px"):
    return (f'<tr><td style="background:#ffffff;border:1px solid {BRAND};border-radius:16px;'
            f'padding:{pad}">{inner}</td></tr>')


def build(d):
    out = []
    w = out.append
    w(f'<div style="background:{PAGE};padding:24px 0;font-family:{FONT};color:{INK}">')
    w('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
      'style="max-width:720px;margin:0 auto;border-collapse:collapse"><tbody>')

    # ---------- masthead ----------
    w(f'<tr><td style="padding:0 4px">'
      f'<div style="font-size:12px;color:{MUTE};letter-spacing:1px">KOREA COMMERCIAL REAL ESTATE · DAILY</div>'
      f'<div style="font-size:40px;font-weight:900;letter-spacing:-1.5px;line-height:1.15;margin-top:6px">'
      f'CRE <span style="color:{BRAND}">Radar</span></div>'
      f'<div style="font-size:14px;color:{SUB};margin-top:6px">{e(d["date"])} ({e(d["weekday"])}) · '
      f'{e(d.get("tagline", "시장의 핵심 움직임과 금리를 한 번에"))}</div>'
      f'</td></tr>')

    # ---------- hero (top story) ----------
    h = d.get("hero")
    if h:
        w(f'<tr><td style="padding-top:20px">'
          f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
          f'style="background:#ffffff;border-radius:16px;border:1px solid {LINE}"><tr>'
          f'<td style="padding:26px 28px">'
          f'<div style="font-size:14px;font-weight:700;color:{BRAND}">{e(h["tag"])}</div>'
          f'<div style="font-size:24px;font-weight:800;line-height:1.35;margin:8px 0 8px;letter-spacing:-0.5px">'
          f'{e(h["title"])}</div>'
          f'<div style="font-size:15px;color:{SUB};line-height:1.6">{e(h["text"])}</div>'
          f'<div style="margin-top:18px">'
          f'<a href="{e(h["url"])}" style="display:inline-block;background:{BRAND};color:#ffffff;'
          f'font-weight:700;font-size:14px;padding:11px 20px;border-radius:8px;text-decoration:none">'
          f'원문 보기 →</a></div></td></tr></table></td></tr>')

    # ---------- 01 summary ----------
    w(section_head("01", "Summary", "오늘의 핵심"))
    rows = []
    for i, s in enumerate(d["summary"], 1):
        top = "" if i == 1 else f"border-top:1px solid {LINE};"
        rows.append(
            f'<tr><td style="{top}padding:16px 0;vertical-align:top;width:44px">'
            f'<span style="font-size:15px;font-weight:800;color:{BRAND}">{i:02d}</span></td>'
            f'<td style="{top}padding:16px 0">'
            f'<div style="margin-bottom:6px">{pill(s["tag"])}</div>'
            f'<div style="font-size:16px;font-weight:700;line-height:1.45">{e(s["title"])}</div>'
            f'<div style="font-size:14px;color:{SUB};line-height:1.6;margin-top:4px">{e(s["text"])} '
            f'</div>{src_line(s["src"], s.get("url"))}</td></tr>')
    w(card('<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
           + "".join(rows) + '</table>'))

    # ---------- 02 rates ----------
    w(section_head("02", "Rates", "금리 · 조달 지표"))
    tiles = d["rates"]
    trs = []
    for r in range(0, len(tiles), 4):
        tds = []
        for t in tiles[r:r + 4]:
            col = {"up": UP, "dn": DN}.get(t.get("dir"), MUTE)
            arrow = {"up": "▲ ", "dn": "▼ "}.get(t.get("dir"), "")
            tds.append(
                f'<td width="25%" style="padding:6px;vertical-align:top">'
                f'<div style="background:#ffffff;border:1px solid {LINE};border-radius:12px;padding:14px 14px 12px">'
                f'<div style="font-size:12px;color:{SUB};white-space:nowrap">{e(t["name"])}</div>'
                f'<div style="font-size:22px;font-weight:800;margin-top:4px;letter-spacing:-0.5px">{e(t["value"])}</div>'
                f'<div style="font-size:12px;color:{col};margin-top:2px">{arrow}{e(t.get("chg", ""))}</div>'
                f'<div style="font-size:11px;color:{MUTE};margin-top:6px">{link(t.get("asof", "") + " · " + t.get("src", ""), t.get("url"), MUTE)}</div>'
                f'</div></td>')
        while len(tds) < 4:
            tds.append('<td width="25%"></td>')
        trs.append("<tr>" + "".join(tds) + "</tr>")
    w('<tr><td style="padding:0 0 4px"><table role="presentation" width="100%" cellpadding="0" '
      'cellspacing="0" style="margin:0 -6px">' + "".join(trs) + '</table></td></tr>')
    if d.get("rates_note"):
        w(f'<tr><td style="font-size:12px;color:{MUTE};padding:4px 2px 0">{e(d["rates_note"])}</td></tr>')

    # ---------- 03 financing (real deals) ----------
    fin = d.get("financing")
    if fin:
        w(section_head("03", "Financing", "실제 딜 조달 금리"))
        rows = []
        for i, f in enumerate(fin["deals"]):
            top = "" if i == 0 else f"border-top:1px solid {LINE};"
            rows.append(
                f'<tr><td style="{top}padding:14px 0;vertical-align:top;width:96px">{pill(f["type"])}</td>'
                f'<td style="{top}padding:14px 0 14px 10px">'
                f'<div style="font-size:15px;font-weight:700">{link(f["deal"], f.get("url"))}</div>'
                f'<div style="font-size:13px;color:{SUB};margin-top:3px;line-height:1.55">{e(f["terms"])}</div>'
                f'{src_line(f["src"], f.get("url"))}</td>'
                f'<td style="{top}padding:14px 0;vertical-align:top;text-align:right;white-space:nowrap">'
                f'<div style="font-size:18px;font-weight:800;color:{BRAND}">{e(f["rate"])}</div>'
                f'<div style="font-size:12px;color:{MUTE}">{e(f["size"])} · {e(f["when"])}</div></td></tr>')
        lv = "".join(
            f'<tr><td style="padding:6px 0;font-size:13px;color:{SUB};width:96px">{e(x["asset"])}</td>'
            f'<td style="padding:6px 0;font-size:14px;font-weight:700">{e(x["level"])}</td>'
            f'<td style="padding:6px 0;font-size:12px;color:{MUTE};text-align:right">{e(x["basis"])}</td></tr>'
            for x in fin["levels"])
        w(card('<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + "".join(rows)
               + '</table>'
               + f'<div style="background:{PILL_BG};border-radius:10px;padding:10px 14px;margin:6px 0 16px">'
               f'<div style="font-size:12px;font-weight:700;color:{BRAND};margin-bottom:2px">자산별 현재 선순위 수준</div>'
               '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + lv + '</table></div>'))

    # ---------- 04 sector radar ----------
    w(section_head("04", "Sector Radar", "섹터별 주요 사항"))
    for sec in d["sectors"]:
        rows = []
        items = sec["items"] or [{"title": "특이사항 없음", "date": "", "url": None}]
        for i, it in enumerate(items):
            top = "" if i == 0 else f"border-top:1px solid {LINE};"
            ref = (f'<span style="font-size:11px;color:#e8833a;font-weight:700;margin-left:6px">참고</span>'
                   if it.get("ref") else "")
            sub = (f'<div style="font-size:13px;color:{SUB};margin-top:3px;line-height:1.55">{e(it["text"])}</div>'
                   if it.get("text") else "")
            if it.get("src"):
                sub += src_line(it["src"], it.get("url"))
            rows.append(
                f'<tr><td style="{top}padding:13px 0">'
                f'<div style="font-size:15px;line-height:1.45">{link(it["title"], it.get("url"))}{ref}</div>{sub}</td>'
                f'<td style="{top}padding:13px 0 13px 12px;font-size:12px;color:{MUTE};text-align:right;'
                f'vertical-align:top;white-space:nowrap">{e(it.get("date", ""))}</td></tr>')
        w(f'<tr><td style="padding:0 0 12px">'
          f'<div style="background:#ffffff;border:1px solid {BRAND};border-radius:16px;padding:16px 24px 8px">'
          f'<div style="border-bottom:1px solid {LINE};padding-bottom:10px">'
          f'{pill(sec["tag"])}<span style="font-size:18px;font-weight:800;margin-left:10px;vertical-align:middle">'
          f'{e(sec["name"])}</span>'
          f'<span style="font-size:13px;color:{SUB};margin-left:8px;vertical-align:middle">{e(sec.get("sub", ""))}</span></div>'
          f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0">{"".join(rows)}</table>'
          f'</div></td></tr>')

    # ---------- 05 valuation ----------
    if d.get("valuation"):
        w(section_head("05", "Valuation", "캡레이트 · 공실률"))
        cells = "".join(
            f'<td style="padding:6px;vertical-align:top" width="{100 // len(d["valuation"])}%">'
            f'<div style="background:#ffffff;border:1px solid {LINE};border-radius:12px;padding:14px">'
            f'<div style="font-size:12px;color:{SUB}">{e(v["name"])}</div>'
            f'<div style="font-size:22px;font-weight:800;margin-top:4px">{e(v["value"])}</div>'
            f'<div style="font-size:12px;color:{MUTE};margin-top:4px">{link(v["note"], v.get("url"), MUTE)}</div>'
            f'</div></td>' for v in d["valuation"])
        w(f'<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
          f'style="margin:0 -6px"><tr>{cells}</tr></table></td></tr>')

    # ---------- 06 insight ----------
    if d.get("insights"):
        w(section_head("06", "Insight", "투자자 관점 코멘트 · 분석"))
        items = "".join(
            f'<div style="padding:12px 0;{"" if i == 0 else f"border-top:1px solid {LINE};"}">'
            f'<div style="font-size:15px;font-weight:700;color:{BRAND}">{e(x["title"])}</div>'
            f'<div style="font-size:14px;color:{SUB};line-height:1.6;margin-top:3px">{e(x["text"])}</div></div>'
            for i, x in enumerate(d["insights"]))
        w(card(items, "6px 24px"))

    # ---------- footer ----------
    w(f'<tr><td style="padding:28px 4px 8px;font-size:11.5px;color:{MUTE};line-height:1.6">'
      f'본 자료는 공개 보도 기반 자동 생성 브리핑이며 투자 권유가 아닙니다. '
      f'<span style="color:#e8833a;font-weight:700">참고</span> 표시는 오늘 이전 보도입니다. '
      f'수치는 원문으로 확인하시기 바랍니다.{(" " + e(d["footnote"])) if d.get("footnote") else ""}</td></tr>')
    w('</tbody></table></div>')
    return "".join(out)


def plain(d):
    lines = [f'CRE Radar {d["date"]} ({d["weekday"]})', ""]
    for i, s in enumerate(d["summary"], 1):
        lines.append(f'{i}. [{s["tag"]}] {s["title"]} - {s["text"]}')
    lines.append("")
    lines.append(" / ".join(f'{r["name"]} {r["value"]}' for r in d["rates"]))
    lines.append("")
    lines.append("HTML 보기를 지원하는 메일 클라이언트에서 전체 브리핑을 확인하세요.")
    return "\n".join(lines)


if __name__ == "__main__":
    data = json.load(open(sys.argv[1], encoding="utf-8"))
    if len(sys.argv) > 2 and sys.argv[2] == "--plain":
        print(plain(data))
    else:
        print(build(data))

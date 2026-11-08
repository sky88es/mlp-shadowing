"""Small (~50KB) printable PDF, sent as the email attachment.
Usage: python3 -I daily-reading/make_pdf_lite.py <lesson.json> <out.pdf>
English uses the standard Times/Helvetica fonts (not embedded); Korean and IPA (WenQuanYi)
are embedded as glyph subsets, which keeps the file small."""
import json, re, sys
from reportlab import rl_config; rl_config.useA85 = 0; rl_config.invariant = 1
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont('KO', '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', subfontIndex=0))
KO = 'KO'
d = json.load(open(sys.argv[1]))
NAVY, RED, SUB, SOFT, LINE = colors.HexColor('#0b3d91'), colors.HexColor('#c8102e'), colors.HexColor('#5d6678'), colors.HexColor('#f5f7fb'), colors.HexColor('#dfe3ec')

def esc(s): return str(s or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
EMOJI = re.compile('[\U0001F300-\U0001FAFF☀-➿️]')
def clean(s): return EMOJI.sub('', str(s or '')).strip()
HANGUL = re.compile(r'([ᄀ-ᇿ㄰-㆏가-힣①-⓿←-⇿≈~·…“”‘’]+(?:[ \d,.()?!:;%\-/]*[ᄀ-ᇿ㄰-㆏가-힣]+)*)')
def mix(s, bold_md=True):
    """Escape, apply **bold**, and wrap Korean runs in the CID font."""
    s = esc(clean(s))
    if bold_md: s = re.sub(r'\*\*(.+?)\*\*', r'<b><u>\1</u></b>', s)
    return HANGUL.sub(lambda m: f'<font name="{KO}">{m.group(1)}</font>', s)
def chunk(s): return mix(s).replace(' / ', ' <font color="#c8102e"><b>/</b></font> ')

def st(name, **kw):
    base = dict(fontName='Times-Roman', fontSize=10.5, leading=14.5, textColor=colors.HexColor('#1d2433'))
    base.update(kw); return ParagraphStyle(name, **base)
EN = st('en'); KOS = st('ko', fontName=KO, fontSize=8.8, leading=12, textColor=SUB)
H2 = st('h2', fontName=KO, fontSize=12, leading=16, textColor=NAVY, spaceBefore=10, spaceAfter=5)
BODY = st('body', fontName=KO, fontSize=9.2, leading=13.5)
SMALL = st('small', fontName=KO, fontSize=7.8, leading=10.5, textColor=SUB)
CELL = st('cell', fontSize=9.5, leading=12.5); CELLK = st('cellk', fontName=KO, fontSize=8.8, leading=12)
WHITE = st('w', fontName=KO, fontSize=8.5, leading=11, textColor=colors.white)

def h2(n, t): return Paragraph(f'<font color="#c8102e">{n}</font>  {mix(t, False)}', H2)
def box(flow, bg=SOFT, border=None):
    t = Table([[flow]], colWidths=[180*mm])
    sty = [('BACKGROUND', (0,0), (-1,-1), bg), ('LEFTPADDING', (0,0), (-1,-1), 8), ('RIGHTPADDING', (0,0), (-1,-1), 8),
           ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6)]
    if border: sty.append(('BOX', (0,0), (-1,-1), 1, border))
    t.setStyle(TableStyle(sty)); return t
def grid(rows, widths, head):
    t = Table([[Paragraph(f'<font name="{KO}">{h}</font>', WHITE) for h in head]] + rows, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), NAVY), ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LINEBELOW', (0,1), (-1,-1), 0.4, LINE), ('TOPPADDING', (0,0), (-1,-1), 3), ('BOTTOMPADDING', (0,0), (-1,-1), 3)]))
    return t

s = []
# Cover
cover = [Paragraph(f'<font color="#ffffff" size="8">DAY {d.get("day","")}  |  {esc(d["category"])}  |  {esc(d["level"])}</font>', st('c0', fontName='Helvetica-Bold')),
         Paragraph(f'<font color="#ffffff">{esc(d["title"])}</font>', st('c1', fontName='Times-Bold', fontSize=19, leading=23, spaceBefore=4)),
         Paragraph(f'<font color="#ffffff">{esc(d["title_ko"])}</font>', st('c2', fontName=KO, fontSize=10.5, leading=14)),
         Paragraph(f'<font color="#c9d4ec">{esc(d["date"])}  ·  Based on {esc(d["source"]["outlet"])}</font>', st('c3', fontName=KO, fontSize=7.5, leading=10, spaceBefore=4))]
s.append(box(cover, bg=NAVY)); s.append(Spacer(1, 6))
routine = [('STEP 1', '2분', '① 배경 지식 읽고 질문에 답 생각해 보기'), ('STEP 2', '4분', '② 본문을 해석 없이 끝까지 읽기 (모르는 단어 표시)'),
           ('STEP 3', '6분', '③ 한 줄씩 끊어 읽기 → 해석과 비교'), ('STEP 4', '5분', '④⑤ 단어·숙어: 뜻 가리고 예문 소리 내어 읽기'),
           ('STEP 5', '3분', '⑥ 핵심 문장 3번씩 따라 말하기'), ('STEP 6', '5분', '⑦⑧⑨ 문제 → 정답 확인 → 말하기·쓰기')]
rt = Table([[Paragraph(f'<font name="{KO}" color="#0b3d91"><b>오늘의 학습 루틴 (약 25분)</b></font>', BODY), '', '', '']] +
           [[Paragraph(f'<font name="{KO}">□</font>', BODY), Paragraph(f'<b>{a}</b>', st('r', fontName='Helvetica-Bold', fontSize=8, textColor=NAVY)), Paragraph(mix(b, False), BODY), Paragraph(mix(c, False), BODY)] for a, b, c in routine],
           colWidths=[6*mm, 16*mm, 12*mm, 146*mm])
rt.setStyle(TableStyle([('SPAN', (0,0), (-1,0)), ('BOX', (0,0), (-1,-1), 1, NAVY), ('TOPPADDING', (0,0), (-1,-1), 1.5), ('BOTTOMPADDING', (0,0), (-1,-1), 1.5), ('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
s += [rt, h2('1', 'Warm-up · 배경 지식'), box([Paragraph(mix(d['background_ko'], False), BODY), Spacer(1, 3), Paragraph(f'<font color="#0b3d91"><b>{mix("읽기 전 질문", False)}</b></font>  ' + mix(d['warmup_q'], False), BODY)])]
s += [h2('2', 'Reading · 본문'), Paragraph(' '.join(mix(l['en'].replace(' / ', ' ')) for l in d['lines']), st('full', fontSize=11, leading=17, alignment=4))]
# Line by line
s += [PageBreak(), h2('3', 'Line by Line · 끊어 읽기 & 해석'), Paragraph(mix('빨간 / 는 의미 단위입니다. 쉐도잉할 때 여기서 짧게 쉬세요.', False), SMALL), Spacer(1, 3)]
rows = [[Paragraph(f'<font color="#c8102e"><b>{i+1:02d}</b></font>', st('n', fontName='Helvetica', fontSize=8.5)), [Paragraph(chunk(l['en']), EN), Paragraph(mix(l['ko'], False), KOS)]] for i, l in enumerate(d['lines'])]
t = Table(rows, colWidths=[9*mm, 171*mm]); t.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('LINEBELOW', (0,0), (-1,-1), 0.4, LINE), ('TOPPADDING', (0,0), (-1,-1), 3.5), ('BOTTOMPADDING', (0,0), (-1,-1), 3.5)]))
s.append(t)
# Vocab / idioms / key sentences
s += [PageBreak(), h2('4', 'Vocabulary · 주요 단어')]
s.append(grid([[ [Paragraph(f'<b>{esc(w["word"])}</b>', st('ww', fontName='Times-Bold', fontSize=10.5)), Paragraph(f'{esc(w["ipa"])}  {esc(w["pos"])}', st('ipa', fontName=KO, fontSize=7, textColor=SUB))],
                 [Paragraph(mix(w['meaning'], False), CELLK)] + ([Paragraph(f'= {esc(w["synonym"])}', st('syn', fontName='Helvetica', fontSize=7, textColor=SUB))] if w.get('synonym') else []),
                 Paragraph(f'<i>{mix(w["example"])}</i>', CELL)] for w in d['words']], [38*mm, 42*mm, 100*mm], ['Word', '뜻', 'Example']))
s += [h2('5', 'Expressions · 숙어 & 표현'),
      grid([[Paragraph(f'<b>{esc(i["phrase"])}</b>', st('ip', fontName='Times-Bold', fontSize=10)), Paragraph(mix(i['meaning'], False), CELLK), Paragraph(f'<i>{mix(i["example"])}</i>', CELL)] for i in d['idioms']], [42*mm, 46*mm, 92*mm], ['Expression', '뜻', 'Example'])]
s.append(h2('6', 'Key Sentences · 핵심 문장 & 문법'))
for k in d['key_sentences']:
    s += [box([Paragraph(mix(k['en']), st('ks', fontName='Times-Bold', fontSize=10.5, leading=14)), Paragraph(mix(k['note'], False), KOS)], bg=colors.HexColor('#fff5f6')), Spacer(1, 4)]
# Check-up
s += [PageBreak(), h2('7', 'Check-up · 확인 문제')]
for i, q in enumerate(d['questions']):
    p = [Paragraph(f'{i+1}. {mix(q["q"])}', EN)]
    if q.get('options'): p += [Paragraph('&nbsp;&nbsp;&nbsp;' + '&nbsp;&nbsp;&nbsp;&nbsp;'.join(f'{"abcd"[j]}) {mix(o)}' for j, o in enumerate(q['options'])), st('op', fontSize=9.5, leading=13))]
    s += [KeepTogether(p), Spacer(1, 5)]
s += [h2('8', 'Fill in the Blanks · 빈칸 채우기'), box(Paragraph(mix('보기: ', False) + ' · '.join(esc(b['answer']) for b in sorted(d['blanks'], key=lambda b: b['answer'])), BODY))]
s += [Paragraph(f'{i+1}. {esc(b["sentence"])}', st('bl', fontSize=10.5, leading=17)) for i, b in enumerate(d['blanks'])]
s += [h2('9', 'Speak & Write · 말하기 · 쓰기'), box([Paragraph(mix(x, False), BODY) for x in clean(d['output_task']).split('\n')])]
ans = [Paragraph(f'<font color="#0b3d91"><b>{mix("정답", False)}</b></font>', BODY)] + \
      [Paragraph(f'{i+1}. ' + mix(q['answer'], False), SMALL) for i, q in enumerate(d['questions'])] + \
      [Paragraph(mix('빈칸: ', False) + ' / '.join(f'{i+1}. {esc(b["answer"])}' for i, b in enumerate(d['blanks'])), SMALL)]
s += [Spacer(1, 8), box(ans, border=LINE), Spacer(1, 6),
      Paragraph(f'Source: {esc(d["source"]["outlet"])}, "{esc(d["source"]["title"])}" {esc(d["source"]["url"])}', st('src', fontName='Helvetica', fontSize=6.5, leading=8.5, textColor=SUB))]

def footer(c, doc):
    c.saveState(); c.setFont('Helvetica', 7); c.setFillColor(SUB)
    c.drawCentredString(A4[0]/2, 10*mm, f'Daily English Reading  ·  {d["date"]}  ·  {doc.page}'); c.restoreState()
SimpleDocTemplate(sys.argv[2], pagesize=A4, leftMargin=15*mm, rightMargin=15*mm, topMargin=14*mm, bottomMargin=16*mm,
                  title=d['title'], author='Daily English').build(s, onFirstPage=footer, onLaterPages=footer)
print('PDF written:', sys.argv[2])

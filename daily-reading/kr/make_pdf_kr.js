// Usage: node daily-reading/kr/make_pdf_kr.js <kr-lesson.json> <out.pdf>
// Literary-magazine style layout: masthead + text (p1), commentary (p2), questions + 원고지 필사 (p3).
const fs = require('fs');
const { chromium } = require('playwright');
const [, , inPath, outPath] = process.argv;
const d = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hl = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<em>$1</em>');
const paras = s => String(s ?? '').split(/\n{2,}/).map(p => `<p>${hl(p).replace(/\n/g, '<br>')}</p>`).join('');
const no = String(d.day).padStart(3, '0');

// 원고지: 20칸 x rows. The quote is pre-printed faintly in the first rows for tracing.
const COLS = 20;
const quoteCells = [...String(d.quote || '')];
const traceRows = Math.max(1, Math.ceil(quoteCells.length / COLS));
const totalRows = traceRows * 2 + 4;
let grid = '';
for (let r = 0; r < totalRows; r++) {
  let row = '';
  for (let c = 0; c < COLS; c++) {
    const i = r * COLS + c;
    const ch = r < traceRows ? (quoteCells[i] ?? '') : '';
    row += `<span class="cell${r < traceRows ? ' trace' : ''}">${esc(ch === ' ' ? '' : ch)}</span>`;
  }
  grid += `<div class="grow">${row}</div>`;
}

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&family=Noto+Sans+KR:wght@300;400;500;700&family=Cormorant+Garamond:ital,wght@0,500;1,500&display=swap" rel="stylesheet">
<style>
:root{--ink:#1f1d1a;--sub:#7a7368;--acc:#8c2f1b;--leaf:#2f4f3e;--paper:#fbf8f1;--line:#d9d1c2;--grid:#c9a27a}
@page{size:A4;margin:0}
*{box-sizing:border-box}
html,body{margin:0;background:var(--paper)}
body{font-family:'Noto Sans KR',sans-serif;color:var(--ink);font-size:9.5pt;line-height:1.75;-webkit-print-color-adjust:exact}
.sheet{width:210mm;height:297mm;padding:18mm 20mm 16mm;position:relative;page-break-after:always;overflow:hidden}
.sheet:last-child{page-break-after:auto}
.folio{position:absolute;bottom:9mm;left:20mm;right:20mm;display:flex;justify-content:space-between;font-size:7pt;letter-spacing:.18em;color:var(--sub)}
.serif{font-family:'Nanum Myeongjo',serif}
em{font-style:normal;color:var(--acc);font-weight:700}

/* masthead */
.mast{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2.5px solid var(--ink);padding-bottom:6px}
.mast .logo{font-family:'Nanum Myeongjo',serif;font-weight:800;font-size:22pt;letter-spacing:-.02em;line-height:1}
.mast .logo small{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;font-size:12pt;color:var(--acc);margin-left:6px}
.mast .issue{text-align:right;font-size:7.5pt;letter-spacing:.14em;color:var(--sub);line-height:1.5}
.mast .issue b{display:block;font-family:'Cormorant Garamond',serif;font-size:20pt;letter-spacing:0;color:var(--ink);font-weight:500}
.rule2{border-bottom:.6px solid var(--ink);margin-top:2px}
.kicker{margin-top:18mm;font-size:8pt;letter-spacing:.35em;color:var(--acc);font-weight:700}
h1{font-family:'Nanum Myeongjo',serif;font-weight:800;font-size:28pt;line-height:1.25;letter-spacing:-.02em;margin:8px 0 6px}
.work{font-family:'Nanum Myeongjo',serif;font-size:11pt;color:var(--sub)}
.intro{margin-top:10mm;display:grid;grid-template-columns:14mm 1fr;gap:0 4mm;font-size:9.5pt;color:#3b3833}
.intro .mark{font-family:'Cormorant Garamond',serif;font-size:34pt;line-height:.8;color:var(--acc)}

/* text */
.poemwrap{margin:12mm 0 0 14mm;padding-left:10mm;border-left:1px solid var(--line)}
.poem{font-family:'Nanum Myeongjo',serif;font-size:14.5pt;line-height:2.15;white-space:pre-line;letter-spacing:.01em}
.prose{font-family:'Nanum Myeongjo',serif;font-size:11pt;line-height:2;margin-top:10mm;text-align:justify}
.prose p{margin:0 0 4mm;text-indent:1em}
.src{margin-top:6mm;font-size:7.5pt;color:var(--sub)}
.orn{text-align:center;color:var(--grid);letter-spacing:1em;margin:6mm 0 0;font-size:10pt}

/* section heads */
.sec{display:flex;align-items:baseline;gap:10px;border-bottom:.6px solid var(--ink);padding-bottom:4px;margin:0 0 6mm}
.sec .num{font-family:'Cormorant Garamond',serif;font-size:22pt;color:var(--acc);line-height:1}
.sec .t{font-family:'Nanum Myeongjo',serif;font-weight:800;font-size:13pt}
.sec .en{margin-left:auto;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:10pt;color:var(--sub)}

/* commentary */
.cols{column-count:2;column-gap:9mm;column-rule:.5px solid var(--line);font-family:'Nanum Myeongjo',serif;font-size:10pt;line-height:1.95;text-align:justify}
.cols p{margin:0 0 3.5mm}
.cols p:first-child::first-letter{float:left;font-size:30pt;line-height:1;margin:2px 6px 0 0;color:var(--acc);font-weight:800}
.gloss{margin-top:8mm;background:#f3eee3;border-radius:2px;padding:5mm 6mm;display:grid;grid-template-columns:1fr 1fr;gap:2.5mm 8mm}
.gloss .h{grid-column:1/-1;font-size:7.5pt;letter-spacing:.3em;color:var(--leaf);font-weight:700}
.gloss div b{font-family:'Nanum Myeongjo',serif;font-size:10.5pt;margin-right:6px}
.gloss div span{font-size:8.5pt;color:#4a463f}

/* pull quote */
.pull{position:absolute;left:20mm;right:20mm;bottom:26mm;text-align:center;border-top:.6px solid var(--ink);border-bottom:.6px solid var(--ink);padding:10mm 8mm}
.pq{font-family:'Nanum Myeongjo',serif;font-weight:800;font-size:19pt;line-height:1.5;letter-spacing:-.01em}
.pw{margin-top:3mm;font-family:'Nanum Myeongjo',serif;font-size:9pt;color:var(--sub)}
/* questions */
.q{display:grid;grid-template-columns:12mm 1fr;margin-bottom:5mm}
.q .n{font-family:'Cormorant Garamond',serif;font-size:24pt;color:var(--acc);line-height:1}
.q .txt{font-family:'Nanum Myeongjo',serif;font-size:10.5pt;line-height:1.7}
.q .ln{border-bottom:.6px dotted #b9b0a0;height:8.5mm}

/* manuscript grid */
.quote{font-family:'Nanum Myeongjo',serif;font-size:13pt;text-align:center;margin:0 0 4mm;color:var(--ink)}
.quote:before,.quote:after{content:'“';font-family:'Cormorant Garamond',serif;color:var(--acc);font-size:18pt;vertical-align:-3px;margin:0 4px}
.quote:after{content:'”'}
.wgrid{border:1.2px solid var(--grid);padding:1.5mm;background:#fffdf7}
.grow{display:grid;grid-template-columns:repeat(${COLS},1fr);margin-bottom:2.2mm}
.grow:last-child{margin-bottom:0}
.cell{height:8.15mm;border:.5px solid var(--grid);border-left:none;display:flex;align-items:center;justify-content:center;font-family:'Nanum Myeongjo',serif;font-size:13pt}
.cell:first-child{border-left:.5px solid var(--grid)}
.cell.trace{color:#d7cdbd}
.sign{display:flex;justify-content:flex-end;gap:10mm;margin-top:4mm;font-size:8pt;color:var(--sub)}
.sign span{border-bottom:.6px solid var(--sub);min-width:32mm;display:inline-block}
</style></head><body>

<section class="sheet">
  <div class="mast"><div class="logo">매일의 문장<small>Daily Reading</small></div>
  <div class="issue"><b>No. ${no}</b>${esc(d.date)}</div></div><div class="rule2"></div>
  <div class="kicker">${esc(d.category)}</div>
  <h1>${esc(d.title)}</h1>
  <div class="work">${esc(d.work)}</div>
  <div class="intro"><div class="mark">“</div><div>${hl(d.intro)}</div></div>
  ${d.text_type === 'poem'
    ? `<div class="poemwrap"><div class="poem">${esc(d.text)}</div></div>`
    : `<div class="prose">${paras(d.text)}</div>`}
  <div class="orn">· · ·</div>
  <div class="src">${esc(d.text_source)}${d.full_text_url ? `<br>전문 읽기: ${esc(d.full_text_label || '')} ${esc(d.full_text_url)}` : ''}</div>
  <div class="folio"><span>매일의 문장 · No. ${no}</span><span>I</span></div>
</section>

<section class="sheet">
  <div class="sec"><span class="num">I</span><span class="t">함께 읽기</span><span class="en">Commentary</span></div>
  <div class="cols">${paras(d.notes)}</div>
  ${d.words?.length ? `<div class="gloss"><div class="h">낱말 풀이</div>${d.words.map(w => `<div><b>${esc(w.word)}</b><span>${esc(w.meaning)}</span></div>`).join('')}</div>` : ''}
  <div class="pull"><div class="pq">${esc(d.quote)}</div><div class="pw">— ${esc(d.work)}</div></div>
  <div class="folio"><span>매일의 문장 · No. ${no}</span><span>II</span></div>
</section>

<section class="sheet">
  <div class="sec"><span class="num">II</span><span class="t">생각해 볼 질문</span><span class="en">Reflection</span></div>
  ${d.questions.map((q, i) => `<div class="q"><div class="n">${i + 1}</div><div><div class="txt">${hl(q)}</div><div class="ln"></div><div class="ln"></div></div></div>`).join('')}
  <div class="sec" style="margin-top:6mm"><span class="num">III</span><span class="t">오늘의 한 문장 · 필사</span><span class="en">Transcription</span></div>
  <div class="quote">${esc(d.quote)}</div>
  <div class="wgrid">${grid}</div>
  <div class="sign">날짜 <span></span> 이름 <span></span></div>
  <div class="folio"><span>매일의 문장 · No. ${no}</span><span>III</span></div>
</section>
</body></html>`;

(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: outPath, preferCSSPageSize: true, printBackground: true });
  await b.close(); console.log('PDF written:', outPath);
})();

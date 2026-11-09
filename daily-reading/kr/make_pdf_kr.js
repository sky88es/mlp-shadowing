// Usage: node daily-reading/kr/make_pdf_kr.js <kr-lesson.json> <out.pdf>
const fs = require('fs');
const { chromium } = require('playwright');
const [, , inPath, outPath] = process.argv;
const d = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hl = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>');
const paras = s => String(s ?? '').split(/\n{2,}/).map(p => `<p>${hl(p).replace(/\n/g, '<br>')}</p>`).join('');
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Noto+Serif+KR:wght@400;600;700&display=swap" rel="stylesheet">
<style>
:root{--ink:#22252b;--sub:#686e7a;--acc:#2f6b4f;--acc2:#b5651d;--line:#e4e2dc;--soft:#f6f4ef;--mk:#f3e3b5}
body{font-family:'Noto Sans KR','WenQuanYi Zen Hei',sans-serif;color:var(--ink);font-size:10pt;line-height:1.7;margin:0}
.serif{font-family:'Noto Serif KR',serif}
mark{background:linear-gradient(transparent 60%,var(--mk) 60%);color:inherit}
.cover{background:var(--acc);color:#fff;padding:18px 22px;border-radius:10px}
.badge{display:inline-block;font-size:8pt;font-weight:700;background:rgba(255,255,255,.2);padding:3px 9px;border-radius:20px;margin-right:6px}
.cover h1{font-family:'Noto Serif KR',serif;font-size:20pt;line-height:1.3;margin:10px 0 4px}
.cover .meta{font-size:9pt;opacity:.85}
h2{font-size:12pt;margin:18px 0 8px;color:var(--acc);break-after:avoid}
h2 .n{color:var(--acc2);margin-right:6px}
.box{background:var(--soft);border-radius:8px;padding:12px 14px;font-size:9.5pt}
.text{font-family:'Noto Serif KR',serif;font-size:11pt;line-height:1.95}
.text p{margin:0 0 10px}
.poem{font-family:'Noto Serif KR',serif;font-size:12.5pt;line-height:2.1;padding:16px 26px;border-left:3px solid var(--acc2);background:#fffdf8;white-space:pre-line}
.src{font-size:8pt;color:var(--sub);margin-top:6px}
table{border-collapse:collapse;width:100%;font-size:9.5pt}
td{border-bottom:1px solid var(--line);padding:5px 8px;vertical-align:top}
td.w{font-weight:700;white-space:nowrap;width:22%}
ol.q li{margin-bottom:22px}
.line{border-bottom:1px solid var(--line);height:24px}
.copy{font-family:'Noto Serif KR',serif;font-size:12pt;text-align:center;padding:14px;border:1.5px dashed var(--acc2);border-radius:8px}
.page{break-before:page}
</style></head><body>
<div class="cover"><span class="badge">국문 DAY ${esc(d.day)}</span><span class="badge">${esc(d.category)}</span>
<h1>${esc(d.title)}</h1><div class="meta">${esc(d.date)} · ${esc(d.work)}</div></div>
<h2><span class="n">1</span>읽기 전에</h2><div class="box">${hl(d.intro)}</div>
<h2><span class="n">2</span>${esc(d.text_heading || '오늘의 글')}</h2>
${d.text_type === 'poem' ? `<div class="poem">${esc(d.text)}</div>` : `<div class="text">${paras(d.text)}</div>`}
<div class="src">${esc(d.text_source)}</div>
<h2${d.page_break_before_notes ? ' class="page"' : ''}><span class="n">3</span>함께 읽기 · 해설</h2><div class="text" style="font-size:10.5pt">${paras(d.notes)}</div>
${d.words?.length ? `<h2><span class="n">4</span>낱말 풀이</h2><table>${d.words.map(w => `<tr><td class="w">${esc(w.word)}</td><td>${esc(w.meaning)}</td></tr>`).join('')}</table>` : ''}
<h2 class="page"><span class="n">5</span>생각해 볼 질문</h2>
<ol class="q">${d.questions.map(q => `<li>${hl(q)}<div class="line"></div><div class="line"></div></li>`).join('')}</ol>
<h2><span class="n">6</span>오늘의 한 문장 · 필사</h2>
<div class="copy">${esc(d.quote)}</div>
<div class="line" style="margin-top:14px"></div><div class="line"></div><div class="line"></div>
</body></html>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: outPath, format: 'A4', printBackground: true, margin: { top: '16mm', bottom: '18mm', left: '17mm', right: '17mm' },
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: `<div style="font-size:7pt;color:#999;width:100%;text-align:center">Daily 국문 읽기 · ${esc(d.date)} · <span class="pageNumber"></span>/<span class="totalPages"></span></div>` });
  await b.close(); console.log('PDF written:', outPath);
})();

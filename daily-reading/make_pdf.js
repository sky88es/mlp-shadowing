// Usage: node daily-reading/make_pdf.js <lesson.json> <out.pdf>
// lesson.json: { date, title, topic, level, lines:[{en,ko}], words:[{word,pos,meaning,example}],
//                idioms:[{phrase,meaning,example}], grammar:[{point,explain}], questions:[{q,answer}] }
const fs = require('fs');
const { chromium } = require('playwright');
const [, , inPath, outPath] = process.argv;
const d = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
<style>
body{font-family:'Noto Sans KR','WenQuanYi Zen Hei',sans-serif;color:#222;font-size:11pt;line-height:1.55;margin:0}
h1{font-family:Merriweather,serif;font-size:20pt;margin:0 0 4px}
.meta{color:#777;font-size:9pt;margin-bottom:14px}
h2{font-size:13pt;border-bottom:2px solid #3b6fd8;padding-bottom:3px;margin:20px 0 8px;color:#2b4fa0}
.en{font-family:Merriweather,serif;font-size:11.5pt}
ol.script li{margin-bottom:6px}
ol.trans li{margin-bottom:4px;color:#333}
table{border-collapse:collapse;width:100%;font-size:10pt}
th,td{border:1px solid #ccc;padding:5px 7px;vertical-align:top;text-align:left}
th{background:#eef3fc}
.ex{color:#555;font-style:italic}
.q li{margin-bottom:10px}
.ans{page-break-before:always}
</style></head><body>
<h1>${esc(d.title)}</h1>
<div class="meta">${esc(d.date)} · ${esc(d.topic)} · ${esc(d.level || '')}</div>
<h2>📖 Reading Script</h2>
<ol class="script en">${d.lines.map(l => `<li>${esc(l.en)}</li>`).join('')}</ol>
<h2>🇰🇷 해석</h2>
<ol class="trans">${d.lines.map(l => `<li>${esc(l.ko)}</li>`).join('')}</ol>
<h2>📝 주요 단어</h2>
<table><tr><th>단어</th><th>품사</th><th>뜻</th><th>예문</th></tr>
${d.words.map(w => `<tr><td><b>${esc(w.word)}</b></td><td>${esc(w.pos)}</td><td>${esc(w.meaning)}</td><td class="ex">${esc(w.example)}</td></tr>`).join('')}</table>
<h2>💬 주요 숙어 · 표현</h2>
<table><tr><th>표현</th><th>뜻</th><th>예문</th></tr>
${d.idioms.map(i => `<tr><td><b>${esc(i.phrase)}</b></td><td>${esc(i.meaning)}</td><td class="ex">${esc(i.example)}</td></tr>`).join('')}</table>
${d.grammar?.length ? `<h2>🔍 문법 포인트</h2><ul>${d.grammar.map(g => `<li><b>${esc(g.point)}</b> — ${esc(g.explain)}</li>`).join('')}</ul>` : ''}
<h2>✅ 확인 문제</h2>
<ol class="q en">${d.questions.map(q => `<li>${esc(q.q)}</li>`).join('')}</ol>
<div class="ans"><h2>정답 및 해설</h2>
<ol>${d.questions.map(q => `<li>${esc(q.answer)}</li>`).join('')}</ol></div>
</body></html>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: outPath, format: 'A4', margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' }, printBackground: true });
  await b.close();
  console.log('PDF written:', outPath);
})();

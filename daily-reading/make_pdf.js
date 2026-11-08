// Usage: node daily-reading/make_pdf.js <lesson.json> <out.pdf>
// Schema: see daily-reading/README.md
const fs = require('fs');
const { chromium } = require('playwright');
const [, , inPath, outPath] = process.argv;
const d = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// **word** -> highlighted
const hl = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>');
const chunk = s => hl(s).replace(/ \/ /g, ' <span class="sl">/</span> ');

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
<style>
:root{--ink:#1d2433;--sub:#5d6678;--acc:#c8102e;--acc2:#0b3d91;--line:#e3e6ee;--soft:#f5f7fb;--mk:#fff1a8}
*{box-sizing:border-box}
body{font-family:'Noto Sans KR','WenQuanYi Zen Hei',sans-serif;color:var(--ink);font-size:10pt;line-height:1.6;margin:0}
.serif{font-family:'Source Serif 4',Georgia,serif}
mark{background:linear-gradient(transparent 55%,var(--mk) 55%);color:inherit;font-weight:600}
.cover{background:var(--acc2);color:#fff;padding:20px 22px 18px;border-radius:10px;position:relative;overflow:hidden}
.cover:after{content:"";position:absolute;right:-40px;top:-40px;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,.07)}
.badge{display:inline-block;font-size:8pt;font-weight:700;letter-spacing:.08em;background:var(--acc);padding:3px 9px;border-radius:20px;margin-right:6px}
.badge.o{background:rgba(255,255,255,.18)}
.cover h1{font-family:'Source Serif 4',serif;font-size:22pt;line-height:1.2;margin:12px 0 6px}
.cover .ko{font-size:11pt;opacity:.9}
.cover .src{font-size:8pt;opacity:.75;margin-top:10px}
h2{font-size:12pt;margin:16px 0 8px;display:flex;align-items:center;gap:8px;break-after:avoid}
h2 .n{background:var(--acc);color:#fff;font-size:9pt;width:22px;height:22px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center}
.box{background:var(--soft);border-radius:8px;padding:12px 14px;font-size:9.5pt}
.box b{color:var(--acc2)}
.script{counter-reset:l;margin:0;padding:0;list-style:none}
.script li{counter-increment:l;display:grid;grid-template-columns:24px 1fr;gap:2px 8px;padding:5px 0;border-bottom:1px dashed var(--line);break-inside:avoid}
.script li:before{content:counter(l,decimal-leading-zero);color:var(--acc);font-weight:700;font-size:8.5pt;padding-top:2px}
.script .en{font-family:'Source Serif 4',serif;font-size:11pt;line-height:1.55}
.script .ko{grid-column:2;color:var(--sub);font-size:9pt}
.sl{color:var(--acc);font-weight:700}
.full{font-family:'Source Serif 4',serif;font-size:11pt;line-height:1.75;text-align:justify}
table{border-collapse:collapse;width:100%;font-size:9pt}
th{background:var(--acc2);color:#fff;font-weight:500;text-align:left;padding:6px 8px}
td{border-bottom:1px solid var(--line);padding:4px 8px;vertical-align:top}
tr{break-inside:avoid}
td.w{font-family:'Source Serif 4',serif;font-weight:700;font-size:10.5pt;white-space:nowrap}
.ipa{display:block;font-family:'Noto Sans KR',sans-serif;font-weight:400;font-size:8pt;color:var(--sub)}
.ex{font-family:'Source Serif 4',serif;font-style:italic;color:#333}
.syn{font-size:8pt;color:var(--sub)}
.key{border-left:4px solid var(--acc);padding:8px 12px;margin-bottom:10px;background:#fff7f8;break-inside:avoid}
.key .en{font-family:'Source Serif 4',serif;font-size:11pt;font-weight:600}
.key .note{font-size:9pt;color:var(--sub);margin-top:3px}
ol.q{padding-left:20px}ol.q li{margin-bottom:8px;break-inside:avoid}
.opt{font-family:'Source Serif 4',serif;margin-left:4px}
.blank{font-family:'Source Serif 4',serif;font-size:10.5pt}
.page{break-before:page}
.ans li{margin-bottom:6px}
.foot{margin-top:10px;font-size:8pt;color:var(--sub);border-top:1px solid var(--line);padding-top:8px}
.pre{white-space:pre-line}
.routine{border:1.5px solid var(--acc2);border-radius:8px;padding:10px 14px;margin-top:14px;font-size:9pt}
.routine b{color:var(--acc2)}
.routine table td{border:none;padding:3px 6px}
.ck{width:14px;height:14px;border:1.5px solid var(--sub);border-radius:3px;display:inline-block}
.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
</style></head><body>

<div class="cover">
  <span class="badge">DAY ${esc(d.day || '')}</span><span class="badge o">${esc(d.category)}</span><span class="badge o">${esc(d.level)}</span>
  <h1>${esc(d.title)}</h1>
  <div class="ko">${esc(d.title_ko)}</div>
  <div class="src">${esc(d.date)} · Based on ${esc(d.source.outlet)} — “${esc(d.source.title)}”</div>
</div>


<div class="routine"><b>⏱ 오늘의 학습 루틴 (약 25분)</b> — 순서대로 하고 체크하세요.
<table>
<tr><td><span class="ck"></span></td><td><b>STEP 1</b> 2분</td><td>① 배경 지식 읽고 질문에 답 생각해 보기</td></tr>
<tr><td><span class="ck"></span></td><td><b>STEP 2</b> 4분</td><td>② 본문을 해석 없이 처음부터 끝까지 읽기 (모르는 단어는 표시만)</td></tr>
<tr><td><span class="ck"></span></td><td><b>STEP 3</b> 6분</td><td>③ 한 줄씩 끊어 읽기 → 해석과 비교, 내가 틀린 부분 체크</td></tr>
<tr><td><span class="ck"></span></td><td><b>STEP 4</b> 5분</td><td>④⑤ 단어·숙어 암기 (뜻 가리고 예문 소리 내어 읽기)</td></tr>
<tr><td><span class="ck"></span></td><td><b>STEP 5</b> 3분</td><td>⑥ 핵심 문장 문법 이해 후 3번씩 따라 말하기</td></tr>
<tr><td><span class="ck"></span></td><td><b>STEP 6</b> 5분</td><td>⑦⑧ 문제 풀고 마지막 장 정답 확인 → ⑨ 말하기·쓰기</td></tr>
</table>
<div style="margin-top:4px;color:var(--sub)">💡 다음 날 아침, 어제 단어 표를 1분 동안 다시 보고 시작하세요. 주말에는 한 주 동안 받은 5개 본문을 소리 내어 다시 읽어 보세요.</div></div>

<h2><span class="n">1</span>Warm-up · 배경 지식</h2>
<div class="box">${esc(d.background_ko)}<br><br><b>읽기 전 질문</b> ${esc(d.warmup_q)}</div>

<h2><span class="n">2</span>Reading · 본문</h2>
<div class="full">${d.lines.map(l => hl(l.en.replace(/ \/ /g, ' '))).join(' ')}</div>

<h2 class="page"><span class="n">3</span>Line by Line · 끊어 읽기 & 해석</h2>
<div class="box" style="margin-bottom:8px"><span class="sl">/</span> 표시는 의미 단위(청크)입니다. 쉐도잉할 때 이 지점에서 짧게 쉬어 주세요.</div>
<ol class="script">${d.lines.map(l => `<li><div class="en">${chunk(l.en)}</div><div class="ko">${esc(l.ko)}</div></li>`).join('')}</ol>

<h2 class="page"><span class="n">4</span>Vocabulary · 주요 단어</h2>
<table><tr><th style="width:24%">Word</th><th style="width:22%">뜻</th><th>Example</th></tr>
${d.words.map(w => `<tr><td class="w">${esc(w.word)}<span class="ipa">${esc(w.ipa)} · ${esc(w.pos)}</span></td><td>${esc(w.meaning)}${w.synonym ? `<div class="syn">≒ ${esc(w.synonym)}</div>` : ''}</td><td class="ex">${hl(w.example)}</td></tr>`).join('')}</table>

<h2><span class="n">5</span>Expressions · 숙어 & 표현</h2>
<table><tr><th style="width:28%">Expression</th><th style="width:22%">뜻</th><th>Example</th></tr>
${d.idioms.map(i => `<tr><td class="w">${esc(i.phrase)}</td><td>${esc(i.meaning)}</td><td class="ex">${hl(i.example)}</td></tr>`).join('')}</table>

<h2><span class="n">6</span>Key Sentences · 핵심 문장 & 문법</h2>
${d.key_sentences.map(k => `<div class="key"><div class="en">${hl(k.en)}</div><div class="note">${esc(k.note)}</div></div>`).join('')}

<h2 class="page"><span class="n">7</span>Check-up · 확인 문제</h2>
<ol class="q">${d.questions.map(q => `<li class="serif">${esc(q.q)}${q.options ? `<div>${q.options.map((o, i) => `<div class="opt">${'ⓐⓑⓒⓓ'[i]} ${esc(o)}</div>`).join('')}</div>` : ''}</li>`).join('')}</ol>

<h2><span class="n">8</span>Fill in the Blanks · 빈칸 채우기</h2>
<div class="box" style="margin-bottom:8px">보기: ${d.blanks.map(b => b.answer).sort().map(esc).join(' · ')}</div>
<ol class="q">${d.blanks.map(b => `<li class="blank">${esc(b.sentence)}</li>`).join('')}</ol>

<h2><span class="n">9</span>Speak & Write · 말하기 · 쓰기</h2>
<div class="box pre">${esc(d.output_task)}</div>

<h2><span class="n">✓</span>Answer Key · 정답</h2>
<div class="two"><div><b>확인 문제</b><ol class="ans">${d.questions.map(q => `<li>${esc(q.answer)}</li>`).join('')}</ol></div>
<div><b>빈칸 채우기</b><ol class="ans">${d.blanks.map(b => `<li>${esc(b.answer)}</li>`).join('')}</ol></div></div>

<div class="foot">Source: ${esc(d.source.outlet)}, “${esc(d.source.title)}” — ${esc(d.source.url)} · 원문 기사를 바탕으로 학습용으로 새로 쓴 글입니다.</div>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({
    path: outPath, format: 'A4', printBackground: true,
    margin: { top: '16mm', bottom: '18mm', left: '15mm', right: '15mm' },
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: `<div style="font-size:7pt;color:#999;width:100%;text-align:center">Daily English Reading · ${esc(d.date)} · <span class="pageNumber"></span>/<span class="totalPages"></span></div>`,
  });
  await b.close();
  console.log('PDF written:', outPath);
})();

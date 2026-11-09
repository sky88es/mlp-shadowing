// Usage: node kids/make_pdf.js kids/lessons/YYYY-MM-DD.json kids/pdf/YYYY-MM-DD.pdf
// 2쪽 인쇄용: 1쪽 English, 2쪽 국어 (A4)
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { sceneHTML, SCENE_CSS } = require('./scene.js');
const [, , inPath, outPath] = process.argv;
const d = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const E = d.en, K = d.ko;
const site = `https://sky88es.github.io/mlp-shadowing/kids/#${d.date}`;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Dodum&family=Baloo+2:wght@500;700&display=swap" rel="stylesheet">
<style>${SCENE_CSS}
@page{size:A4;margin:11mm}
*{box-sizing:border-box}
body{margin:0;font-family:'Gowun Dodum','WenQuanYi Zen Hei',sans-serif;color:#2b2a33}
.pg{height:271mm;overflow:hidden;display:flex;flex-direction:column;break-after:page}
.pg:last-child{break-after:auto}
.hd{display:flex;align-items:center;gap:10px;border-radius:16px;padding:8px 14px;color:#fff}
.en .hd{background:#2f7de1}.ko .hd{background:#ff7a45}
.hd .t{font-family:'Jua';font-size:22pt;flex:1}
.hd .t small{font-family:'Gowun Dodum';font-size:10pt;opacity:.9;margin-left:6px}
.hd .m{font-size:9pt;text-align:right;opacity:.95}
.plan{font-size:8.5pt;color:#7b7686;margin:5px 2px 6px}
.book{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px}
.pp{border:2px solid #f0e6d6;border-radius:14px;padding:4px 4px 5px;break-inside:avoid}
.pp .scene{border-radius:10px}.ko .pp .scene{aspect-ratio:3/2}
.pp .tx{text-align:center;font-size:12.5pt;line-height:1.3;margin-top:4px;word-break:keep-all;min-height:2.6em;display:flex;align-items:center;justify-content:center;flex-direction:column}
.en .pp .tx{font-family:'Baloo 2';font-weight:700;font-size:15pt}
.en .pp .tx small{font-family:'Gowun Dodum';font-weight:400;font-size:8.5pt;color:#7b7686}
.ko .pp .tx{font-family:'Jua';font-size:12pt}
.pp .n{font-family:'Jua';font-size:8pt;color:#c9b8ad}
h3{font-family:'Jua';font-size:12.5pt;margin:6px 2px 3px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.wds{display:flex;flex-wrap:wrap;gap:5px}
.wd{border:2px solid #f0e6d6;border-radius:12px;padding:3px 8px;font-size:10pt;display:flex;align-items:center;gap:5px}
.wd .e{font-size:18pt;font-family:'Noto Color Emoji'}
.wd b{font-family:'Baloo 2';font-size:12pt}.ko .wd b{font-family:'Jua';font-weight:400}
.q{font-size:10pt;margin:2px 0}
.q .c{display:inline-block;border:1.5px solid #ddd;border-radius:8px;padding:0 7px;margin:0 3px}
.line{border-bottom:1.5px dashed #d8cfc2;height:24px;margin:3px 0}
.trace{font-family:'Jua';font-size:18pt;color:#d6cfc7;letter-spacing:3px;border:2px dashed #ffcfb4;border-radius:12px;padding:5px 10px;text-align:center}
.box{border:2px dashed #d8cfc2;border-radius:12px;flex:1;min-height:30mm;padding:6px 10px;font-size:9.5pt;color:#7b7686}
.dict{display:flex;gap:6px}.dict div{flex:1;border:2px solid #f0e6d6;border-radius:10px;height:15mm;font-family:'Jua';font-size:9pt;color:#c9b8ad;padding:3px 6px}
.chant{font-family:'Baloo 2';font-weight:700;font-size:12pt;background:#eef6ff;border-radius:12px;padding:6px 12px}
.ft{font-size:8pt;color:#9a93a3;margin-top:auto;padding-top:4px}
.ans{font-size:7.5pt;color:#b0a8b8;transform:rotate(180deg);text-align:right;flex:none}
</style></head><body>

<section class="pg en">
  <div class="hd"><div class="t">🔤 ${esc(E.title)}<small>${esc(E.title_ko)}</small></div><div class="m">DAY ${d.day} · ${d.date} (${d.weekday})<br>${esc(E.theme)}</div></div>
  <div class="plan">⏱ English 10분: 🎧 듣기 3분 → 🗣 따라 읽기 3분 → 🃏 단어·소리 2분 → ⭐ 퀴즈 2분 &nbsp;|&nbsp; 🔊 소리 듣기: 사이트</div>
  <div class="book">${E.pages.map((p, i) => `<div class="pp">${sceneHTML(p.scene)}<div class="tx">${esc(p.en)}<small>${esc(p.ko)}</small></div></div>`).join('')}</div>
  <h3>🃏 Words</h3>
  <div class="wds">${E.words.map(w => `<div class="wd"><span class="e">${w.emoji}</span><b>${esc(w.word)}</b> ${esc(w.ko)}</div>`).join('')}</div>
  <div class="row">
    <div><h3>🔡 소리 ${esc(E.phonics.sound)} = '${esc(E.phonics.say)}'</h3><div class="wds">${E.phonics.words.map(([w, e]) => `<div class="wd"><span class="e">${e}</span><b>${esc(w)}</b></div>`).join('')}</div></div>
    <div><h3>🎵 Chant</h3><div class="chant">${E.chant.map(esc).join('<br>')}</div></div>
  </div>
  <h3>⭐ Quiz <small style="font-family:'Gowun Dodum';font-size:9pt">○ 하세요</small></h3>
  ${E.quiz.map((q, i) => `<div class="q">${i + 1}. <b>${esc(q.q)}</b> <span style="color:#7b7686">(${esc(q.q_ko)})</span> &nbsp; ${q.choices.map(c => `<span class="c">${esc(c)}</span>`).join('')}</div>`).join('')}
  <h3>✍️ 따라 쓰기</h3><div class="trace" style="font-family:'Baloo 2'">${esc(E.pages[2].en)}</div><div class="line"></div>
  <div class="ft"><span>👪 ${esc(E.parent_tip_ko)}</span></div>
  <div class="ans">정답: ${E.quiz.map((q, i) => `${i + 1}) ${esc(q.choices[q.answer])}`).join('  ')}</div>
</section>

<section class="pg ko">
  <div class="hd"><div class="t">📖 ${esc(K.title)}<small>${esc(K.theme)}</small></div><div class="m">DAY ${d.day} · ${d.date} (${d.weekday})</div></div>
  <div class="plan">⏱ 국어 10분: 🎧 듣기 3분 → 📢 소리 내어 읽기 3분 → 🃏 낱말·퀴즈 2분 → ✏️ 받아쓰기·그리기 2분</div>
  <div class="book">${K.pages.map((p, i) => `<div class="pp">${sceneHTML(p.scene)}<div class="tx">${esc(p.text)}</div></div>`).join('')}</div>
  <div class="row">
    <div><h3>🃏 새 낱말</h3><div class="wds">${K.words.map(w => `<div class="wd"><span class="e">${w.emoji}</span><b>${esc(w.word)}</b> ${esc(w.meaning)}</div>`).join('')}</div></div>
    <div><h3>🐾 흉내 내는 말</h3><div class="wds">${K.sound_words.map(w => `<div class="wd"><span class="e">${w.emoji}</span><b>${esc(w.word)}</b></div>`).join('')}</div></div>
  </div>
  <h3>⭐ 퀴즈 <small style="font-size:9pt">○ 하세요</small></h3>
  ${K.quiz.map((q, i) => `<div class="q">${i + 1}. [${q.level}] <b>${esc(q.q)}</b> &nbsp;${q.choices.map(c => `<span class="c">${esc(c)}</span>`).join('')}</div>`).join('')}
  <div class="row">
    <div><h3>✏️ 받아쓰기 <small style="font-size:9pt">(불러 주세요)</small></h3><div class="dict">${K.dictation.map((_, i) => `<div>${i + 1}</div>`).join('')}</div>
      <h3>✍️ 따라 쓰기</h3><div class="trace">${esc(K.copy_sentence)}</div></div>
    <div style="display:flex;flex-direction:column"><h3>🖍 그림 그리기</h3><div class="box">${esc(K.draw)}</div></div>
  </div>
  <h3>💬 이야기 나누기</h3><div style="font-size:9.5pt">${esc(K.talk)}</div><div class="line"></div><div class="row">
  </div>
  <div class="ft"><span>👪 ${esc(K.parent_tip_ko)}</span></div>
  <div class="ans">정답: ${K.quiz.map((q, i) => `${i + 1}) ${esc(q.choices[q.answer])}`).join('  ')} · 받아쓰기: ${K.dictation.map(esc).join(', ')}</div>
</section>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: outPath, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close();
  console.log('wrote', outPath);
})();

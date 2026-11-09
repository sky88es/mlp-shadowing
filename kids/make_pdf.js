// Usage: node kids/make_pdf.js kids/lessons/YYYY-MM-DD.json kids/pdf/YYYY-MM-DD.pdf
// 2쪽 인쇄용: 1쪽 English, 2쪽 국어 (A4)
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { sceneHTML, SCENE_CSS } = require('./scene.js');
const [, , inPath, outPath] = process.argv;
const d = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const E = d.en, K = d.ko;
const base = require('path').resolve(require('path').dirname(inPath), '..');
const pic = (B, i, scene) => sceneHTML(scene);
const banner = B => B.photo ? `<div class="banner" style="background-image:url(data:image/jpeg;base64,${fs.readFileSync(base + '/' + B.photo.src).toString('base64')})"><span class="real">📷 진짜 사진</span><span class="cap">${esc(B.photo.caption || '')} ${esc(B.photo.caption_ko)}</span></div>` : '';
const credit = B => B.photo ? `📷 ${esc(B.photo.credit)} · ${esc(B.photo.license)} · Wikimedia Commons` : '';
const org = o => `<div class="org"><b>🧩 ${esc(o.title)}</b>${o.steps.map(([e, t], i) => `${i ? '<span class="ar">➜</span>' : ''}<span class="st"><span class="e">${e}</span> ${esc(t)}</span>`).join('')}</div>`;
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
.hd.sm .t{font-size:15pt}.hd .t{font-family:'Jua';font-size:22pt;flex:1}
.hd .t small{font-family:'Gowun Dodum';font-size:10pt;opacity:.9;margin-left:6px}
.hd .m{font-size:9pt;text-align:right;opacity:.95}
.plan{font-size:8.5pt;color:#7b7686;margin:5px 2px 6px}
.book{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px}
.pp{border:2px solid #f0e6d6;border-radius:14px;padding:4px 4px 5px;break-inside:avoid}
.pp .scene{border-radius:10px}.pp .scene{aspect-ratio:3/2}
.pp .tx{text-align:center;font-size:12.5pt;line-height:1.3;margin-top:4px;word-break:keep-all;min-height:2.6em;display:flex;align-items:center;justify-content:center;flex-direction:column}
.en .pp .tx{font-family:'Baloo 2';font-weight:700;font-size:12.5pt;line-height:1.2}
.en .pp .tx small{font-family:'Gowun Dodum';font-weight:400;font-size:8.5pt;color:#7b7686}
.ko .pp .tx{font-family:'Jua';font-size:11pt}
.pp .n{font-family:'Jua';font-size:8pt;color:#c9b8ad}
h3{font-family:'Jua';font-size:12.5pt;margin:6px 2px 3px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.wds{display:flex;flex-wrap:wrap;gap:5px}
.wd{border:2px solid #f0e6d6;border-radius:12px;padding:3px 8px;font-size:10pt;display:flex;align-items:center;gap:5px}
.wd .e{font-size:18pt;font-family:'Noto Color Emoji'}
.wd b{font-family:'Baloo 2';font-size:12pt}.ko .wd b{font-family:'Jua';font-weight:400}
.q{font-size:11.5pt;margin:7px 0;line-height:1.9}
.q .c{display:inline-block;border:1.5px solid #ddd;border-radius:8px;padding:0 7px;margin:0 3px}
.line{border-bottom:1.5px dashed #d8cfc2;height:30px;margin:4px 0}
.trace{font-family:'Jua';font-size:17pt;color:#d6cfc7;letter-spacing:3px;border:2px dashed #ffcfb4;border-radius:12px;padding:5px 10px;text-align:center}
.box{border:2px dashed #d8cfc2;border-radius:12px;flex:1;min-height:60mm;padding:6px 10px;font-size:9.5pt;color:#7b7686}
.dict{display:flex;gap:6px}.dict div{flex:1;border:2px solid #f0e6d6;border-radius:10px;height:18mm;font-family:'Jua';font-size:9pt;color:#c9b8ad;padding:3px 6px}
.chant{font-family:'Baloo 2';font-weight:700;font-size:12pt;background:#eef6ff;border-radius:12px;padding:6px 12px}
.banner{position:relative;height:78mm;border-radius:14px;background:center/cover no-repeat;margin-bottom:6px;flex:none}
.banner .cap{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(transparent,rgba(0,0,0,.6));color:#fff;font-size:9pt;padding:14px 12px 6px;border-radius:0 0 14px 14px}
.real{position:absolute;left:6px;top:6px;background:rgba(0,0,0,.55);color:#fff;font-family:'Jua';font-size:7.5pt;border-radius:99px;padding:1px 7px}
.hook{background:#fff3d6;border-radius:10px;padding:4px 10px;font-size:9.5pt;margin-bottom:6px}
.org{display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:#f6f2ff;border-radius:12px;padding:5px 12px;margin-top:8px;font-family:'Jua';font-size:11pt}
.org .e{font-size:16pt;font-family:'Noto Color Emoji'}.org .ar{color:#ffb703}
.lv{font-size:7.5pt;background:#eef6ff;color:#2f7de1;border-radius:99px;padding:1px 6px;font-family:'Jua'}
.ft{font-size:8pt;color:#9a93a3;margin-top:auto;padding-top:4px}
.ans{font-size:7.5pt;color:#b0a8b8;transform:rotate(180deg);text-align:right;flex:none}
</style></head><body>

<section class="pg en">
  <div class="hd"><div class="t">🔤 ${esc(E.title)}<small>${esc(E.title_ko)}</small></div><div class="m">DAY ${d.day} · ${d.date} (${d.weekday})<br>${esc(E.theme)}</div></div>
  <div class="plan">⏱ English 10분: 🎧 듣기 2분 → 🗣 따라 읽기 3분 → 🃏 단어 2분 → ⭐ 문제 3분 &nbsp;|&nbsp; 🔊 발음 듣기는 사이트에서</div>
  ${banner(E)}<div class="hook">${esc(E.hook_ko)}</div>
  <div class="book">${E.pages.map((p, i) => `<div class="pp">${pic(E, i, p.scene)}<div class="tx"><span><span class="n">${i + 1}</span> ${esc(p.en)}</span><small>${esc(p.ko)}</small></div></div>`).join('')}</div>
  <h3>🃏 Words</h3>
  <div class="wds">${E.words.map(w => `<div class="wd"><span class="e">${w.emoji}</span><b>${esc(w.word)}</b> ${esc(w.ko)}</div>`).join('')}</div>
</section>
<section class="pg en">
  <div class="hd sm"><div class="t">🔤 ${esc(E.title)} · Workbook</div><div class="m">DAY ${d.day} · ${d.date}</div></div>
  ${org(E.organizer)}
  <h3>⭐ Check <small style="font-family:'Gowun Dodum';font-size:9pt">○ 하세요</small></h3>
  ${E.quiz.map((q, i) => `<div class="q">${i + 1}. <span class="lv">${esc(q.type)}</span> <b>${esc(q.q)}</b> <span style="color:#7b7686">(${esc(q.q_ko)})</span><br>&nbsp;&nbsp;&nbsp;${q.choices.map((c, j) => `<span class="c">${'ⓐⓑⓒ'[j]} ${esc(c)}</span>`).join('')}</div>`).join('')}
  <h3>🗣 Talk & Write</h3><div style="font-family:'Baloo 2';font-weight:700;font-size:13pt">${esc(E.talk_en)}</div><div class="line"></div><div class="line"></div>
  <h3>✍️ Copy</h3><div class="trace" style="font-family:'Baloo 2'">${esc(E.pages[5].en)}</div><div class="line"></div>
  <div class="ft">👪 ${esc(E.parent_tip_ko)}<br>${credit(E)}</div>
  <div class="ans">정답: ${E.quiz.map((q, i) => `${i + 1}) ${esc(q.choices[q.answer])}`).join('  ')}</div>
</section>

<section class="pg ko">
  <div class="hd"><div class="t">📖 ${esc(K.title)}</div><div class="m">DAY ${d.day} · ${d.date} (${d.weekday})<br>${esc(K.theme)}</div></div>
  <div class="plan">⏱ 국어 10분: 🎧 듣기 2분 → 📢 소리 내어 읽기 3분 → 🃏 낱말 2분 → ⭐ 문제·받아쓰기 3분</div>
  ${banner(K)}<div class="hook">${esc(K.hook_ko)}</div>
  <div class="book">${K.pages.map((p, i) => `<div class="pp">${pic(K, i, p.scene)}<div class="tx"><span><span class="n">${i + 1}</span> ${esc(p.text)}</span></div></div>`).join('')}</div>
</section>
<section class="pg ko">
  <div class="hd sm"><div class="t">📖 ${esc(K.title)} · 활동</div><div class="m">DAY ${d.day} · ${d.date}</div></div>
  <div class="row">
    <div><h3>🃏 새 낱말</h3><div class="wds">${K.words.map(w => `<div class="wd"><span class="e">${w.emoji}</span><b>${esc(w.word)}</b> ${esc(w.meaning)}</div>`).join('')}</div></div>
    <div><h3>🐾 흉내 내는 말</h3><div class="wds">${K.sound_words.map(w => `<div class="wd"><span class="e">${w.emoji}</span><b>${esc(w.word)}</b> ${esc(w.meaning)}</div>`).join('')}</div></div>
  </div>
  ${org(K.organizer)}
  <h3>⭐ 확인 문제 <small style="font-size:9pt">○ 하세요</small></h3>
  ${K.quiz.map((q, i) => `<div class="q">${i + 1}. <span class="lv">${esc(q.level)}</span> <b>${esc(q.q)}</b> &nbsp;${q.choices.map((c, j) => `<span class="c">${'ⓐⓑⓒ'[j]} ${esc(c)}</span>`).join('')}</div>`).join('')}
  <div class="row">
    <div><h3>✏️ 받아쓰기 <small style="font-size:9pt">(불러 주세요)</small></h3><div class="dict">${K.dictation.map((_, i) => `<div>${i + 1}</div>`).join('')}</div></div>
    <div><h3>✍️ 따라 쓰기</h3><div class="trace">${esc(K.copy_sentence)}</div><div class="line"></div></div>
  </div>
  <h3>💌 써 보기</h3><div style="font-size:11pt">${esc(K.talk)}</div><div class="line"></div><div class="line"></div>
  <h3>🖍 그려 보기</h3><div class="box">${esc(K.draw)}</div>
  <div class="ft">👪 ${esc(K.parent_tip_ko)}<br>${credit(K)}</div>
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

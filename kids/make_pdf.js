// Bricks-style printable units.
// Usage: node kids/make_pdf.js <out.pdf> <lesson.json> [lesson.json ...]
//   one lesson  -> 4 pages (English Student Book + Workbook, 국어 본문 + 활동)
//   many lessons -> week pack: cover (plan) + every day + answer key
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { sceneHTML, SCENE_CSS } = require('./scene.js');
const [, , outPath, ...inPaths] = process.argv;
const KIDS = __dirname;
const lessons = inPaths.map(p => JSON.parse(fs.readFileSync(p, 'utf8')));
const credits = (() => { try { return JSON.parse(fs.readFileSync(path.join(KIDS, 'photos/credits.json'), 'utf8')); } catch { return {}; } })();
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hl = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>');
const blank = s => esc(s).replace(/___/g, '<span class="bl"></span>');
const ABC = 'abc';

// photos are embedded as data URIs, using a small copy (photos/print/) when it exists
function img(src) {
  const small = path.join(KIDS, 'photos/print', path.basename(src));
  const file = fs.existsSync(small) ? small : path.join(KIDS, src);
  if (!fs.existsSync(file)) return '';
  return `data:image/jpeg;base64,${fs.readFileSync(file).toString('base64')}`;
}
const credit = p => { const c = credits[p.src]; return c ? `📷 ${esc(c.credit)} · ${esc(c.license)}` : ''; };
function figure(f, cls) {
  if (!f) return '';
  if (f.photo) { const u = img(f.photo.src); if (!u) return ''; return `<figure class="${cls}"><div class="ph" style="background-image:url(${u})"><span class="real">📷 REAL</span></div><figcaption>${esc(f.photo.caption || f.photo.caption_ko)}${f.photo.caption && f.photo.caption_ko ? ` · ${esc(f.photo.caption_ko)}` : ''}</figcaption></figure>`; }
  if (f.scene) return `<figure class="${cls}">${sceneHTML(f.scene)}</figure>`;
  return '';
}
const GENRE = { Fiction: ['📖 Fiction', '#ff6f86'], Nonfiction: ['🔎 Nonfiction', '#2f9ee1'], '이야기': ['📖 이야기', '#ff6f86'], '정보글': ['🔎 정보글', '#2f9ee1'], '기사문': ['📰 기사문', '#8a63d2'], '서평': ['📚 서평', '#2fb26b'] };

function studentPage(d, U, lang) {
  const isEn = lang === 'en';
  const [gl, gc] = GENRE[U.genre] || [U.genre, '#888'];
  const L = isEn ? { start: "Let's Start", words: 'New Words', pop: 'Pop Quiz', know: 'You Know What?' } : { start: '생각 열기', words: '새 낱말', pop: '깜짝 퀴즈', know: '알고 있나요?' };
  const paras = U.passage.map(p => {
    const f = p.photo ? { photo: p.photo } : p.scene ? { scene: p.scene } : null;
    return `${f ? figure(f, 'side') : ''}<p>${hl(p.text)}</p>`;
  }).join('');
  const photos = [U.hero && U.hero.photo, ...U.passage.map(p => p.photo)].filter(Boolean);
  const heroBg = U.hero && U.hero.photo ? `<div class="ph" style="background-image:url(${img(U.hero.photo.src)})"></div>` : U.hero && U.hero.scene ? sceneHTML(U.hero.scene) : '';
  return `<section class="pg ${lang}" style="--g:${gc}">
  <div class="meta"><span class="unit">${isEn ? 'UNIT' : '단원'} ${d.day}</span><span>${gl.replace(/^\S+ /, '')} · ${esc(U.theme)} · ${esc(U.level)}</span><span class="dt">${d.date.slice(5).replace('-', '/')} (${d.weekday})</span></div>
  <div class="hero">${heroBg}<div class="shade"></div><div class="ttl"><h1>${esc(U.title)}</h1>${U.title_ko ? `<div class="sub">${esc(U.title_ko)}</div>` : ''}</div>
    ${U.hero && U.hero.photo ? `<div class="cap">${esc(U.hero.photo.caption || U.hero.photo.caption_ko)}</div>` : ''}</div>
  <div class="body">
    <div class="main">
      <div class="start"><b>${L.start}</b> ${esc(U.lets_start.q)} <span class="opts">${U.lets_start.options.map(o => `<span>☐ ${esc(o)}</span>`).join('')}</span></div>
      <div class="passage">${paras}</div>
    </div>
    <aside>
      <div class="sh">${L.words}</div>
      ${U.new_words.map(w => `<div class="nw"><span class="e">${w.emoji}</span><div><b>${esc(w.word)}</b><i>${esc(w.meaning)}</i></div></div>`).join('')}
      <div class="pop"><div class="sh">${L.pop}</div>${blank(U.pop_quiz.q)}</div>
      <div class="know"><div class="sh">${L.know}</div>${esc(U.you_know.text)}${U.you_know.text_ko ? `<div class="k">${esc(U.you_know.text_ko)}</div>` : ''}</div>
    </aside>
  </div>
  <footer>${photos.map(credit).filter(Boolean).join(' / ')}${U.sources ? ` · ${esc(U.sources)}` : ''}</footer>
</section>`;
}

function workPage(d, U, lang) {
  const isEn = lang === 'en';
  const [, gc] = GENRE[U.genre] || ['', '#888'];
  const L = isEn
    ? { comp: 'Comprehension Zone', a: 'Check the main idea.', b: 'Check the correct answers.', c: 'Choose and write the correct answers.', word: 'Word Zone', wz: 'Circle and write the words.', wrap: 'Story Wrap Up', wrapq: 'Choose and write the letters.', talk: 'Talk! Your Turn' }
    : { comp: '내용 확인', a: '중심 내용에 ✔ 하세요.', b: '알맞은 것에 ✔ 하세요.', c: '알맞은 답의 기호를 쓰세요.', word: '낱말 놀이', wz: '알맞은 낱말에 ○ 하고 빈칸에 써 보세요.', wrap: '내용 정리', wrapq: '알맞은 기호를 쓰세요.', talk: '내 생각 말하기' };
  return `<section class="pg ${lang} wb" style="--g:${gc}">
  <div class="meta"><span class="unit">${isEn ? 'UNIT' : '단원'} ${d.day}</span><span>${esc(U.title)}</span><span class="dt">${isEn ? 'Workbook' : '활동지'}</span></div>
  <h2>${L.comp}</h2>
  <div class="it"><div class="h">A. ${L.a}</div><div>${blank(U.main_idea.q)}</div>${U.main_idea.options.map(o => `<div class="cb">☐ ${esc(o)}</div>`).join('')}</div>
  <div class="it"><div class="h">B. ${L.b}</div><div class="bgrid">${U.check.map((c, i) => `<div><div>${i + 1}. ${esc(c.q)}</div>${c.options.map(([e, t]) => `<div class="pic"><span class="e">${e}</span>☐ ${esc(t)}</div>`).join('')}</div>`).join('')}</div></div>
  <div class="it"><div class="h">C. ${L.c}</div>${U.choose.map((c, i) => `<div class="mc"><div>${i + 1}. ${blank(c.q)}<span class="ans">(&nbsp;&nbsp;&nbsp;&nbsp;)</span></div><div class="ch">${c.choices.map((x, j) => `<span>${ABC[j]}. ${esc(x)}</span>`).join('')}</div></div>`).join('')}</div>
  <h2>${L.word}</h2>
  <div class="it"><div class="h">${L.wz}</div>${U.word_zone.map((w, i) => `<div class="wz"><span class="e">${w.emoji}</span><div>${i + 1}. ${blank(w.sentence)}<div class="wo">${w.options.join('&nbsp;&nbsp;/&nbsp;&nbsp;')}</div></div></div>`).join('')}</div>
  <h2>${L.wrap}</h2>
  <div class="it"><div class="h">${esc(U.wrap_up.title)} — ${L.wrapq}</div>
    <div class="org">${U.wrap_up.heads.map(h => `<div class="col"><div class="hd">${esc(h)}</div><div class="slot"></div></div>`).join('')}</div>
    <div class="chs">${U.wrap_up.choices.map((c, j) => `<span><b>${ABC[j]}.</b> ${esc(c)}</span>`).join('')}</div></div>
  ${isEn ? '' : `<div class="two" style="margin-top:2mm"><div class="it"><div class="h">✏️ 받아쓰기 (불러 주세요)</div><div class="dict">${U.dictation.map((_, i) => `<div>${i + 1}</div>`).join('')}</div></div>
    <div class="it"><div class="h">✍️ 따라 쓰기</div><div class="trace">${esc(U.copy)}</div></div></div>`}
  <h2>${L.talk}</h2>
  <div class="it"><div><b>${esc(U.talk.q)}</b>${U.talk.q_ko ? ` <span class="k">${esc(U.talk.q_ko)}</span>` : ''}</div><div class="fr">${blank(U.talk.frame)}</div><div class="line"></div>${isEn ? '<div class="line"></div>' : ''}</div>
  ${U.parent_tip ? `<footer>👪 ${esc(U.parent_tip)}</footer>` : ''}
</section>`;
}

// 글쓰기: 격자 칸에 한글 따라 쓰기 + 4선에 영어 따라 쓰기
function gridRows(text, traceCls) {
  const N = 11, chars =[...text.replace(/[.!?]$/, '')], rows = [];
  for (let i = 0; i < chars.length; i += N) rows.push(chars.slice(i, i + N));
  const row = (cs, cls) => `<div class="grow">${Array.from({ length: N }, (_, i) => `<div class="gc"><span class="${cls}">${cs[i] && cs[i] !== ' ' ? esc(cs[i]) : ''}</span></div>`).join('')}</div>`;
  return rows.map(r => row(r, traceCls) + row([], '') + row([], '')).join('');
}
function enRow(text) {
  const fs = Math.min(12.6, 178 / (Math.max(text.length, 1) * 0.56)), b = 12, k = fs / 12.6;
  const y = v => (b - v * k).toFixed(2);
  return `<svg class="enrow" viewBox="0 0 190 16"><line x1="0" x2="190" y1="${y(9.3)}" y2="${y(9.3)}" stroke="#bcd3ee" stroke-width=".25"/><line x1="0" x2="190" y1="${y(6.5)}" y2="${y(6.5)}" stroke="#bcd3ee" stroke-width=".25" stroke-dasharray="1.5 1.5"/><line x1="0" x2="190" y1="${b}" y2="${b}" stroke="#e58c8c" stroke-width=".35"/><line x1="0" x2="190" y1="${(b + 3.2 * k).toFixed(2)}" y2="${(b + 3.2 * k).toFixed(2)}" stroke="#bcd3ee" stroke-width=".25"/>${text ? `<text x="3" y="${b}" font-family="Andika" font-size="${fs.toFixed(2)}" fill="#cfcfd6">${esc(text)}</text>` : ''}</svg>`;
}
function writePage(d) {
  const W = d.write; if (!W) return '';
  return `<section class="pg ko wr" style="--g:#8a63d2">
  <div class="meta"><span class="unit">단원 ${d.day}</span><span>글쓰기 · 오늘의 말씀 따라 쓰기</span><span class="dt">${d.date.slice(5).replace('-', '/')} (${d.weekday})</span></div>
  <div class="verse"><div class="vk">${esc(W.ko)}</div><div class="ve">${esc(W.en)}</div><div class="vr">${esc(W.ref_ko)} · ${esc(W.ref)}</div></div>
  <h2>한글 또박또박 <small>흐린 글씨를 따라 쓰고, 아래 칸에 혼자 써요</small></h2>
  ${gridRows(W.ko, 'tr')}
  <h2>낱말 연습</h2>
  ${W.words.map(w => { const cs = [...w]; const line = [...cs, ' ', ...cs].slice(0, 11); return `<div class="grow">${Array.from({ length: 11 }, (_, i) => `<div class="gc"><span class="${i < cs.length ? 'tr dk' : 'tr'}">${line[i] && line[i] !== ' ' ? esc(line[i]) : ''}</span></div>`).join('')}</div>`; }).join('')}
  <h2>English <small>Trace and write.</small></h2>
  ${enRow(W.en)}${enRow(W.en)}${enRow('')}
  <h2>내 생각 한 줄</h2>
  <div class="it"><div>${esc(W.prompt)}</div><div class="line"></div><div class="line"></div></div>
  <footer>영어 구절: World English Bible(공공 영역) · 한국어는 아이 눈높이로 쉽게 풀어 쓴 문장이에요.</footer>
</section>`;
}

function cover(ls) {
  const a = ls[0].date, b = ls[ls.length - 1].date;
  return `<section class="pg cover"><div class="cv-top"><div class="rng">WEEKLY READING PACK</div><h1>아침 리딩</h1><div class="rng2">${a.replace(/-/g, '.')} – ${b.slice(5).replace('-', '.')} · English + 국어 + 글쓰기 · 하루 20~25분</div></div>
  <table class="plan"><tr><th>날짜</th><th>🔤 English</th><th>📖 국어</th><th>✍️ 글쓰기</th><th>⭐</th></tr>
  ${ls.map(d => `<tr><td><b>${d.date.slice(5).replace('-', '/')}</b><br>(${d.weekday})</td><td><div class="pt">${esc(d.en.title)}</div><div class="pm">${esc((GENRE[d.en.genre] || [d.en.genre])[0])} · ${esc(d.en.level)} · ${esc(d.en.theme)}</div></td><td><div class="pt">${esc(d.ko.title)}</div><div class="pm">${esc((GENRE[d.ko.genre] || [d.ko.genre])[0])} · ${esc(d.ko.theme)}</div></td><td>${d.write ? `<div class="pt">${esc(d.write.ko)}</div><div class="pm">${esc(d.write.en)}</div>` : ''}</td><td><div class="stk"></div></td></tr>`).join('')}</table>
  <div class="how"><b>하루 순서</b> ① English 2쪽 → ② 국어 2쪽 → ③ 글쓰기 1쪽 · 요일별로 5장씩 묶어 두면 좋아요 · 다 하면 ⭐ 칸에 스티커!</div></section>`;
}
function answers(ls) {
  const one = U => `Pop: ${esc(U.pop_quiz.answer)} · A ${U.main_idea.answer + 1} · B ${U.check.map(c => c.answer + 1).join(',')} · C ${U.choose.map(c => ABC[c.answer]).join(',')} · Word: ${U.word_zone.map(w => esc(w.options[w.answer])).join(', ')} · Wrap: ${U.wrap_up.answers.map(i => ABC[i]).join('-')}`;
  return `<section class="pg key"><h2>정답 Answer Key</h2>${ls.map(d => `<div class="kd"><b>DAY ${d.day} (${d.date.slice(5).replace('-', '/')})</b><div>🔤 ${one(d.en)}</div><div>📖 ${one(d.ko)} · 받아쓰기: ${d.ko.dictation.map(esc).join(', ')}</div></div>`).join('')}</section>`;
}

const pages = (lessons.length > 1 ? cover(lessons) : '') + lessons.map(d => studentPage(d, d.en, 'en') + workPage(d, d.en, 'en') + studentPage(d, d.ko, 'ko') + workPage(d, d.ko, 'ko') + writePage(d)).join('') + (lessons.length > 1 ? answers(lessons) : '');

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Dodum&family=Fredoka:wght@500;600&family=Andika:wght@400;700&display=swap" rel="stylesheet">
<style>${SCENE_CSS}
.scene .it{filter:none!important;animation:none!important}
@page{size:A4;margin:10mm}
*{box-sizing:border-box}
body{margin:0;font-family:'Gowun Dodum','WenQuanYi Zen Hei',sans-serif;color:#2a2833;font-size:10pt}
.pg{height:277mm;overflow:hidden;display:flex;flex-direction:column;break-after:page}
.pg:last-child{break-after:auto}
.en{--fh:'Fredoka';--fb:'Andika'}.ko{--fh:'Jua';--fb:'Gowun Dodum'}
mark{background:linear-gradient(transparent 58%,#ffe873 58%);color:inherit;font-weight:700}
.meta{display:flex;align-items:center;gap:3mm;font-family:'Fredoka','Jua';font-size:8.5pt;color:#8b8698;letter-spacing:.2mm;margin-bottom:2.5mm}
.meta .unit{background:var(--g);color:#fff;font-weight:600;padding:.8mm 3mm;border-radius:1.2mm;letter-spacing:.4mm}
.meta .dt{margin-left:auto}
.hero{position:relative;height:96mm;border-radius:3mm;overflow:hidden;flex:none}
.hero .ph,.hero .scene{position:absolute;inset:0;width:100%;height:100%;aspect-ratio:auto;border-radius:0;background-size:cover;background-position:center}
.shade{position:absolute;inset:0;background:linear-gradient(transparent 50%,rgba(0,0,0,.55))}
.ttl{position:absolute;left:6mm;right:6mm;bottom:5mm;color:#fff}
.ttl h1{font-family:var(--fh);font-weight:600;font-size:28pt;line-height:1.05;margin:0;text-shadow:0 .4mm 1.5mm rgba(0,0,0,.35)}
.ko .ttl h1{font-weight:400;font-size:25pt}
.ttl .sub{font-size:10.5pt;opacity:.95;margin-top:1mm}
.cap{position:absolute;right:3mm;top:3mm;background:rgba(255,255,255,.85);color:#555;font-size:7pt;border-radius:1mm;padding:.5mm 2mm}
.body{flex:1;display:grid;grid-template-columns:1fr 54mm;gap:6mm;margin-top:5mm;min-height:0}
.main{display:flex;flex-direction:column;min-height:0}
.start{font-family:var(--fb);font-size:9.5pt;color:#555;border-left:1mm solid var(--g);padding:.5mm 0 .5mm 3mm;margin-bottom:4mm;line-height:1.5}
.start b{font-family:var(--fh);font-weight:600;color:var(--g);margin-right:1.5mm}.ko .start b{font-weight:400}
.start .opts span{margin-left:3mm;white-space:nowrap}
.passage{font-family:var(--fb);font-size:15pt;line-height:1.8;overflow:hidden}
.ko .passage{font-size:14.5pt;line-height:1.95}
.passage p{margin:0 0 3mm}
figure{margin:0}
.side{float:right;width:46%;margin:1mm 0 2mm 4mm}
.side .ph,.side .scene{height:38mm;aspect-ratio:auto;border-radius:2mm;background-size:cover;background-position:center}
figcaption{font-size:7pt;color:#9a95a6;margin-top:.6mm;line-height:1.3}
aside{border-left:.3mm solid #e6e3ec;padding-left:5mm;display:flex;flex-direction:column;gap:1.6mm;min-height:0}
.sh{font-family:var(--fh);font-weight:600;font-size:11pt;color:var(--g);margin-bottom:1mm}.ko .sh{font-weight:400}
.nw{display:flex;gap:2.5mm;align-items:center}
.nw .e{width:10mm;height:10mm;border-radius:50%;background:#f5f3f8;display:flex;align-items:center;justify-content:center;font-size:14pt;font-family:'Noto Color Emoji';flex:none}
.nw b{display:block;font-family:var(--fh);font-weight:600;font-size:11pt;line-height:1.1}.ko .nw b{font-weight:400}
.nw i{font-style:normal;font-size:8pt;color:#8b8698}
.pop,.know{margin-top:2.5mm;font-family:var(--fb);font-size:9pt;line-height:1.5}
.pop{border-top:.3mm solid #e6e3ec;padding-top:2.5mm}
.know{background:#fbf8ef;border-radius:2mm;padding:2.5mm 3mm}
.k{font-size:8pt;color:#8b8698;margin-top:.8mm}
.bl{display:inline-block;min-width:18mm;border-bottom:.3mm solid #333;margin:0 1mm}
footer{font-size:6.5pt;color:#aaa5b4;margin-top:auto;padding-top:2mm;line-height:1.3}
/* workbook */
.wb h2{font-family:var(--fh);font-weight:600;font-size:13.5pt;color:var(--g);margin:2.6mm 0 1.2mm;padding-bottom:1mm;border-bottom:.4mm solid var(--g)}
.ko.wb h2{font-weight:400;font-size:13pt;margin:1.6mm 0 .8mm}.ko.wb .it{font-size:10pt;line-height:1.4;margin-bottom:1.2mm}.ko.wb .col .slot{height:9mm}.ko.wb .mc .ch{font-size:9pt}.ko .bgrid .pic{margin-top:.3mm}
.it{font-family:var(--fb);font-size:10.5pt;line-height:1.45;margin-bottom:1.6mm}
.it .h{font-family:var(--fh);font-weight:600;font-size:10pt;color:#555;margin-bottom:1mm}.ko .it .h{font-weight:400}
.cb{margin:.5mm 0 0 3mm}
.bgrid{display:grid;grid-template-columns:1fr 1fr;gap:5mm}
.pic{display:flex;align-items:center;gap:2mm;margin:.6mm 0 0 3mm}.pic .e,.wz .e{font-family:'Noto Color Emoji';font-size:13pt;width:9mm;height:9mm;border-radius:2mm;background:#f5f3f8;display:flex;align-items:center;justify-content:center;flex:none}
.mc{margin:0 0 1.2mm}.mc .ans{float:right;color:#999}.mc .ch{display:flex;gap:6mm;color:#555;padding-left:4mm;font-size:9.5pt;flex-wrap:wrap}
.wz{display:flex;gap:3mm;align-items:center;margin:0 0 1.4mm}.wz .e{width:10mm;height:10mm;font-size:15pt}
.wo{font-size:9.5pt;color:#666;margin-top:.3mm}
.org{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin-top:1mm}
.col .hd{background:var(--g);color:#fff;font-family:var(--fh);font-weight:600;text-align:center;border-radius:1.5mm 1.5mm 0 0;padding:1mm;font-size:9.5pt}.ko .col .hd{font-weight:400}
.col .slot{border:.35mm solid var(--g);border-top:0;border-radius:0 0 1.5mm 1.5mm;height:11mm}
.chs{display:flex;flex-direction:column;gap:.3mm;margin-top:2mm;font-size:9.5pt;color:#444}
.two{display:grid;grid-template-columns:1fr 1fr;gap:6mm}
.dict{display:flex;gap:1.5mm}.dict div{flex:1;border:.3mm solid #ddd;border-radius:1.5mm;height:11mm;font-size:7pt;color:#bbb;padding:.5mm 1mm}
.trace{font-family:'Jua';font-size:13pt;color:#cfc9d9;letter-spacing:.6mm;text-align:center;padding:1mm 0}
.line{border-bottom:.3mm solid #ddd;height:7.5mm}
.fr{margin-top:1.5mm}
/* writing page */
.wr h2{font-family:'Jua';font-weight:400;font-size:13pt;color:var(--g);margin:4mm 0 2mm}.wr h2 small{font-family:'Gowun Dodum';font-size:8.5pt;color:#8b8698}
.verse{background:#f6f2fd;border-radius:3mm;padding:5mm 6mm;text-align:center}
.vk{font-family:'Jua';font-size:22pt}.ve{font-family:'Andika';font-size:14pt;color:#555;margin-top:1mm}.vr{font-size:8.5pt;color:#8b8698;margin-top:1.5mm}
.grow{display:grid;grid-template-columns:repeat(11,16.4mm);justify-content:center;flex:none}
.gc{width:16.4mm;height:16.4mm;border:.35mm solid #9ab7dc;margin:0 -.35mm -.35mm 0;position:relative;display:flex;align-items:center;justify-content:center}
.gc:before,.gc:after{content:"";position:absolute;border:0 dashed #cfdff2}
.gc:before{left:50%;top:0;bottom:0;border-left-width:.25mm}.gc:after{top:50%;left:0;right:0;border-top-width:.25mm}
.gc .tr{font-family:'Gowun Dodum';font-size:11.6mm;line-height:1;color:#d3d3da;position:relative;z-index:1}.gc .tr.dk{color:#b5b5c0}
.enrow{width:100%;height:16mm;display:block;margin-bottom:1.5mm;flex:none;overflow:hidden}
.wr .line{flex:none}
/* cover & key */
.cv-top{border-bottom:.6mm solid #2a2833;padding:14mm 0 8mm;margin-bottom:6mm}
.cv-top h1{font-family:'Jua';font-weight:400;font-size:40pt;margin:2mm 0}
.rng{font-family:'Fredoka';font-weight:600;letter-spacing:1mm;color:#ff6f86;font-size:10pt}.rng2{font-size:11pt;color:#666}
.plan{width:100%;border-collapse:collapse;font-size:10pt}
.plan th{font-family:'Jua';font-weight:400;color:#8b8698;text-align:left;padding:2mm;border-bottom:.3mm solid #ccc}
.plan td{padding:3.2mm 2mm;border-bottom:.3mm solid #eee;vertical-align:middle}.plan td:first-child{font-family:'Jua';width:18mm;text-align:center}
.pt{font-family:'Jua';font-size:11pt}.pm{font-size:7.5pt;color:#8a849c}
.stk{width:10mm;height:10mm;border-radius:50%;border:.4mm solid #ddd;margin:auto}
.how{margin-top:6mm;font-size:10pt;color:#555;line-height:1.6}
.key h2{font-family:'Jua';font-weight:400;font-size:16pt}.kd{font-size:8.5pt;border-bottom:.3mm solid #eee;padding:1.8mm 0;line-height:1.5}
</style></head><body>${pages}</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  // report any page whose content overflows (so the daily job can shorten text)
  const over = await p.evaluate(() => [...document.querySelectorAll('.pg')].map((s, i) => s.scrollHeight > s.clientHeight + 2 ? i + 1 : 0).filter(Boolean));
  if (over.length) console.error('OVERFLOW pages:', over.join(','), await p.evaluate(() => [...document.querySelectorAll('.pg')].map(s => s.scrollHeight - s.clientHeight).filter(x => x > 2).join(',')));
  await p.pdf({ path: outPath, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close();
  console.log('wrote', outPath);
})();

// Usage: node kids/make_email.js kids/lessons/YYYY-MM-DD.json  -> prints HTML email body
const fs = require('fs');
const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const BRANCH = process.env.KIDS_BRANCH || 'claude/nifty-pascal-bnj2dg';
const site = `https://sky88es.github.io/mlp-shadowing/kids/#${d.date}`;
const pdf = `https://raw.githubusercontent.com/sky88es/mlp-shadowing/${BRANCH}/kids/pdf/${d.date}.pdf`;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const E = d.en, K = d.ko;
const btn = (href, bg, t) => `<a href="${href}" style="display:inline-block;background:${bg};color:#fff;padding:12px 20px;border-radius:24px;text-decoration:none;font-weight:bold;margin:4px">${t}</a>`;
console.log(`<div style="font-family:Arial,'Malgun Gothic',sans-serif;max-width:600px;color:#2b2a33;line-height:1.6;background:#fff8ec;padding:16px;border-radius:16px">
<div style="text-align:center;font-size:13px;color:#7b7686">DAY ${d.day} · ${d.date} (${d.weekday}) · 오늘은 20분!</div>
<div style="text-align:center;font-size:56px;line-height:1.2;margin:8px 0">${E.words.slice(0, 3).map(w => w.emoji).join(' ')}</div>
<div style="text-align:center">${btn(site, '#2fb26b', '🔊 그림책 보고 듣기')}${btn(pdf, '#7b6cf6', '🖨 인쇄용 PDF (2쪽)')}</div>
<div style="background:#fff;border-radius:16px;padding:14px 16px;margin-top:14px">
<div style="color:#2f7de1;font-weight:bold;font-size:20px">🔤 ${esc(E.title)}</div><div style="color:#7b7686;font-size:13px">${esc(E.title_ko)} · ${esc(E.theme)} · 10분</div>
<p style="font-size:18px;margin:8px 0">${E.pages.map(p => `<b>${esc(p.en)}</b> <span style="font-size:13px;color:#7b7686">${esc(p.ko)}</span>`).join('<br>')}</p>
<div style="font-size:14px">🃏 ${E.words.map(w => `${w.emoji} ${esc(w.word)}`).join(' · ')}</div></div>
<div style="background:#fff;border-radius:16px;padding:14px 16px;margin-top:12px">
<div style="color:#ff7a45;font-weight:bold;font-size:20px">📖 ${esc(K.title)}</div><div style="color:#7b7686;font-size:13px">${esc(K.theme)} · 10분</div>
<p style="font-size:17px;margin:8px 0">${K.pages.map(p => esc(p.text)).join(' ')}</p>
<div style="font-size:14px">🃏 ${K.words.map(w => `<b>${esc(w.word)}</b>(${esc(w.meaning)})`).join(' · ')}<br>✏️ 받아쓰기: ${K.dictation.map(esc).join(', ')}</div></div>
<p style="font-size:13px;color:#7b7686;margin-top:12px">👪 ${esc(E.parent_tip_ko)}<br>👪 ${esc(K.parent_tip_ko)}</p>
<p style="font-size:12px;color:#9a93a3">${esc(E.source_note)} / ${esc(K.source_note)}</p></div>`);

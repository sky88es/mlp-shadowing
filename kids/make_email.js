// Usage: node kids/make_email.js kids/lessons/YYYY-MM-DD.json  -> prints HTML email body
const fs = require('fs'), path = require('path');
const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const cal = JSON.parse(fs.readFileSync(path.join(__dirname, 'calendar.json'), 'utf8'));
const BRANCH = process.env.KIDS_BRANCH || 'claude/nifty-pascal-bnj2dg';
const raw = p => `https://raw.githubusercontent.com/sky88es/mlp-shadowing/${BRANCH}/kids/${p}`;
const site = `https://sky88es.github.io/mlp-shadowing/kids/#${d.date}`;
const pdf = raw(`pdf/${d.date}.pdf`);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const E = d.en, K = d.ko;
// --attach: PDF attached as att0, photos inline as att1 (en) / att2 (ko) — Gmail send_message attachments order
const ATT = process.argv.includes('--attach');
const imgSrc = (B) => ATT ? (B === d.en ? 'cid:att1' : (d.en.photo ? 'cid:att2' : 'cid:att1')) : raw(B.photo.src);
const WD = ['일', '월', '화', '수', '목', '금', '토'];
const btn = (href, bg, t) => `<a href="${href}" style="display:inline-block;background:${bg};color:#fff;padding:12px 18px;border-radius:24px;text-decoration:none;font-weight:bold;margin:4px">${t}</a>`;
const photo = (B, color) => B.photo ? `<img src="${imgSrc(B)}" alt="" style="width:100%;border-radius:12px;display:block;margin:8px 0 4px"><div style="font-size:12px;color:#7b7686">📷 ${esc(B.photo.caption_ko)} · ${esc(B.photo.credit)}, ${esc(B.photo.license)}</div>` : '';
const next = cal.days.filter(x => x.date > d.date).slice(0, 6);
console.log(`<div style="font-family:Arial,'Malgun Gothic',sans-serif;max-width:600px;color:#2b2a33;line-height:1.6;background:#fff8ec;padding:16px;border-radius:16px">
<div style="text-align:center;font-size:22px;font-weight:bold">🌞 오늘의 아침 리딩</div>
<div style="text-align:center;font-size:13px;color:#7b7686">DAY ${d.day} · ${d.date} (${d.weekday}) · English 10분 + 국어 10분</div>
<div style="text-align:center;margin:10px 0">${btn(site, '#2fb26b', '🔊 사이트에서 보고 듣기')}${ATT ? `<div style="font-size:13px;color:#7b6cf6;font-weight:bold">📎 인쇄용 PDF(4쪽)가 첨부되어 있어요</div>` : btn(pdf, '#7b6cf6', '🖨 인쇄용 PDF (4쪽)')}</div>
<div style="background:#fff;border-radius:16px;padding:14px 16px;margin-top:10px">
<div style="color:#2f7de1;font-weight:bold;font-size:21px">🔤 ${esc(E.title)}</div><div style="color:#7b7686;font-size:13px">${esc(E.title_ko)} · ${esc(E.theme)}</div>
${photo(E)}
<p style="background:#fff3d6;border-radius:10px;padding:6px 10px;font-size:14px">${esc(E.hook_ko)}</p>
<ol style="font-size:17px;padding-left:22px;margin:6px 0">${E.pages.map(p => `<li style="margin-bottom:4px"><b>${esc(p.en)}</b><br><span style="font-size:13px;color:#7b7686">${esc(p.ko)}</span></li>`).join('')}</ol>
<div style="font-size:14px">🃏 ${E.words.map(w => `${w.emoji} <b>${esc(w.word)}</b> ${esc(w.ko)}`).join(' · ')}</div></div>
<div style="background:#fff;border-radius:16px;padding:14px 16px;margin-top:12px">
<div style="color:#ff7a45;font-weight:bold;font-size:21px">📖 ${esc(K.title)}</div><div style="color:#7b7686;font-size:13px">${esc(K.theme)}</div>
${photo(K)}
<p style="background:#fff3d6;border-radius:10px;padding:6px 10px;font-size:14px">${esc(K.hook_ko)}</p>
<ol style="font-size:17px;padding-left:22px;margin:6px 0">${K.pages.map(p => `<li style="margin-bottom:4px">${esc(p.text)}</li>`).join('')}</ol>
<div style="font-size:14px">🃏 ${K.words.map(w => `${w.emoji} <b>${esc(w.word)}</b>: ${esc(w.meaning)}`).join('<br>')}<br>✏️ 받아쓰기: ${K.dictation.map(esc).join(', ')}</div></div>
${next.length ? `<div style="background:#fff;border-radius:16px;padding:12px 16px;margin-top:12px"><div style="font-weight:bold;font-size:16px">📅 다음 주제 미리 보기</div>
<table style="font-size:13px;border-collapse:collapse;width:100%">${next.map(x => { const w = WD[new Date(x.date + 'T12:00:00Z').getUTCDay()]; return `<tr><td style="padding:3px 6px;color:#7b7686;white-space:nowrap">${x.date.slice(5).replace('-', '/')} (${w})</td><td style="padding:3px 6px">🔤 ${esc(x.en)}<br>📖 ${esc(x.ko)}</td></tr>`; }).join('')}</table></div>` : ''}
<p style="font-size:13px;color:#7b7686;margin-top:12px">👪 ${esc(E.parent_tip_ko)}<br>👪 ${esc(K.parent_tip_ko)}</p>
<p style="font-size:11px;color:#9a93a3">${esc(E.source_note)}<br>${esc(K.source_note)}</p></div>`);

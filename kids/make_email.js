// Weekly email body.
// Usage: node kids/make_email.js <pdf name, e.g. week-2026-11-09.pdf> <lesson.json> [lesson.json ...]  -> prints HTML
const fs = require('fs'), path = require('path');
// Usage: node kids/make_email.js <pdf name> <lesson.json>... [--attach]
// --attach: the PDF is attached to the mail (Gmail send_message attachments), so say so and keep the link as a backup
const ATTACH = process.argv.includes('--attach');
const [, , pdfName, ...files] = process.argv.filter(a => a !== '--attach');
const ls = files.map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
const cal = JSON.parse(fs.readFileSync(path.join(__dirname, 'calendar.json'), 'utf8'));
const BRANCH = process.env.KIDS_BRANCH || 'claude/nifty-pascal-bnj2dg';
const raw = p => `https://raw.githubusercontent.com/sky88es/mlp-shadowing/${BRANCH}/kids/${p}`;
// site link is shown only once the site is published (set KIDS_SITE, e.g. https://sky88es.github.io/mlp-shadowing/kids/)
const site = process.env.KIDS_SITE || '';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const G = { Fiction: '📖', Nonfiction: '🔎', '이야기': '📖', '정보글': '🔎', '기사문': '📰', '서평': '📚' };
const WD = ['일', '월', '화', '수', '목', '금', '토'];
const btn = (href, bg, t) => `<a href="${href}" style="display:inline-block;background:${bg};color:#fff;padding:13px 20px;border-radius:26px;text-decoration:none;font-weight:bold;margin:4px;font-size:16px">${t}</a>`;
const a = ls[0].date, b = ls[ls.length - 1].date;
const next = cal.days.filter(x => x.date > b).slice(0, 7);
console.log(`<div style="font-family:Arial,'Malgun Gothic',sans-serif;max-width:620px;color:#262433;line-height:1.55;background:#fff8ec;padding:18px;border-radius:18px">
<div style="background:linear-gradient(135deg,#ffcf6b,#ff8fa3);border-radius:16px;padding:18px;text-align:center;color:#fff">
<div style="font-size:40px">🌞</div><div style="font-size:24px;font-weight:bold">아침 리딩 · 이번 주 Weekly Pack</div>
<div style="font-size:14px">${a.replace(/-/g, '.')} – ${b.slice(5).replace('-', '.')} · English + 국어 + 글쓰기</div></div>
${ATTACH ? `<div style="text-align:center;font-size:16px;font-weight:bold;color:#7b6cf6;margin:14px 0 4px">📎 인쇄용 PDF(${ls.length * (ls[0].write ? 5 : 4) + 2}쪽)가 첨부되어 있어요</div>` : ''}
<div style="text-align:center;margin:${ATTACH ? '4px' : '14px'} 0 14px">${ATTACH ? '' : btn(raw('pdf/' + pdfName), '#7b6cf6', `🖨 인쇄용 PDF 받기 (${ls.length * (ls[0].write ? 5 : 4) + 2}쪽)`)}${site ? btn(site, '#2fb26b', '🔊 사이트에서 듣기') : ''}${ATTACH ? btn(raw('pdf/' + pdfName), '#a79ef5', '첨부가 안 열리면 여기서 받기') : ''}</div>
<div style="font-size:13px;color:#7b7686;text-align:center;margin-bottom:6px">표지(주간 계획표) → 요일마다 English 2쪽 → 국어 2쪽 → 글쓰기 1쪽 → 맨 뒤 정답</div>
<table style="width:100%;border-collapse:separate;border-spacing:0 6px;font-size:14px">
${ls.map(d => `<tr><td style="background:#fff;border-radius:12px 0 0 12px;padding:8px 10px;text-align:center;font-weight:bold;white-space:nowrap">${d.date.slice(5).replace('-', '/')}<br><span style="color:#7b7686;font-weight:normal">(${d.weekday})</span></td>
<td style="background:#fff;padding:8px 6px"><span style="color:#2f9ee1;font-weight:bold">${G[d.en.genre] || ''} ${esc(d.en.title)}</span><br><span style="font-size:12px;color:#7b7686">${esc(d.en.genre)} · ${esc(d.en.level)} · ${esc(d.en.theme)}</span></td>
<td style="background:#fff;border-radius:0 12px 12px 0;padding:8px 10px"><span style="color:#ff7a45;font-weight:bold">${G[d.ko.genre] || ''} ${esc(d.ko.title)}</span><br><span style="font-size:12px;color:#7b7686">${esc(d.ko.genre)} · ${esc(d.ko.theme)}</span>${d.write ? `<br><span style="color:#8a63d2;font-weight:bold">✍️ ${esc(d.write.ko)}</span> <span style="font-size:12px;color:#7b7686">${esc(d.write.en)}</span>` : ''}</td></tr>`).join('')}
</table>
<div style="background:#fff;border-radius:14px;padding:12px 14px;margin-top:10px;font-size:14px"><b>👪 하루 20분 이렇게</b><br>① English 2쪽 → ② 국어 2쪽 → ③ 글쓰기 1쪽(격자 칸 따라 쓰기) → 표지 ⭐칸에 스티커!</div>
${next.length ? `<div style="background:#fff;border-radius:14px;padding:12px 14px;margin-top:10px;font-size:13px"><b>📅 다음 주 미리 보기</b><br>${next.map(x => `${x.date.slice(5).replace('-', '/')} (${WD[new Date(x.date + 'T12:00:00Z').getUTCDay()]}) 🔤 ${esc(x.en)} · 📖 ${esc(x.ko)}`).join('<br>')}</div>` : ''}
<p style="font-size:11px;color:#9a93a3;margin-top:12px">영어는 Bricks Reading 구성(Let's Start → New Words → Passage → Comprehension → Word Zone → Wrap Up → Talk)을 참고해 새로 쓴 글이에요. 국어는 소년한국일보·내친구서울 기사와 공개된 자료를 바탕으로 아이 눈높이에 맞게 새로 썼어요. 사진은 Wikimedia Commons의 무료 라이선스 사진이며 PDF에 작가를 표시했어요.</p></div>`);

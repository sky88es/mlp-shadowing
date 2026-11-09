// Usage: node daily-reading/kr/make_email_kr.js <kr-lesson.json>  -> prints HTML email body
const fs = require('fs');
const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const date = require('path').basename(process.argv[2], '.json');
const pdf = `https://raw.githubusercontent.com/sky88es/mlp-shadowing/ccr-7681b3cb-dx280m/daily-reading/kr/pdf/${date}.pdf`;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hl = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const paras = s => String(s ?? '').split(/\n{2,}/).map(p => `<p style="margin:0 0 12px">${hl(p).replace(/\n/g, '<br>')}</p>`).join('');
console.log(`<div style="font-family:'Malgun Gothic',Arial,sans-serif;max-width:640px;color:#22252b;line-height:1.75">
<div style="background:#2f6b4f;color:#fff;padding:16px 18px;border-radius:8px">
<div style="font-size:12px;opacity:.85">국문 DAY ${d.day} · ${esc(d.category)}</div>
<div style="font-size:21px;font-weight:bold;margin:6px 0">${esc(d.title)}</div>
<div style="font-size:13px">${esc(d.work)}</div></div>
<p style="text-align:center;margin:18px 0"><a href="${pdf}" style="background:#b5651d;color:#fff;padding:10px 22px;border-radius:6px;text-decoration:none;font-weight:bold">📄 오늘의 국문 PDF 받기 (인쇄용 · 필사 칸 포함)</a></p>
<p style="background:#f6f4ef;padding:10px 12px;border-radius:6px;font-size:14px">${hl(d.intro)}</p>
<h3 style="color:#2f6b4f">📖 ${esc(d.text_heading || '오늘의 글')}</h3>
${d.text_type === 'poem' ? `<p style="font-family:serif;font-size:17px;line-height:2;border-left:3px solid #b5651d;padding:8px 18px;background:#fffdf8;white-space:pre-line">${esc(d.text)}</p>` : `<div style="font-family:serif;font-size:15px">${paras(d.text)}</div>`}
<p style="font-size:12px;color:#888">${esc(d.text_source)}</p>
<h3 style="color:#2f6b4f">🔎 함께 읽기 · 해설</h3><div style="font-size:14px">${paras(d.notes)}</div>
${d.words?.length ? `<h3 style="color:#2f6b4f">📝 낱말 풀이</h3><ul style="font-size:14px">${d.words.map(w => `<li><b>${esc(w.word)}</b> — ${esc(w.meaning)}</li>`).join('')}</ul>` : ''}
<h3 style="color:#2f6b4f">💭 생각해 볼 질문</h3><ol style="font-size:14px">${d.questions.map(q => `<li style="margin-bottom:8px">${hl(q)}</li>`).join('')}</ol>
<h3 style="color:#2f6b4f">✍️ 오늘의 한 문장</h3><p style="font-family:serif;font-size:16px;text-align:center;border:1.5px dashed #b5651d;border-radius:8px;padding:12px">${esc(d.quote)}</p>
</div>`);

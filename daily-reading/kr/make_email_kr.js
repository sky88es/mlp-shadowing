// Usage: node daily-reading/kr/make_email_kr.js <kr-lesson.json>  -> prints HTML email body
const fs = require('fs');
const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const date = require('path').basename(process.argv[2], '.json');
const pdf = `https://raw.githubusercontent.com/sky88es/mlp-shadowing/ccr-7681b3cb-dx280m/daily-reading/kr/pdf/${date}.pdf`;
const no = String(d.day).padStart(3, '0');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hl = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b style="color:#8c2f1b">$1</b>');
const SERIF = "'Nanum Myeongjo','Batang','AppleMyungjo',serif";
const paras = s => String(s ?? '').split(/\n{2,}/).map(p => `<p style="margin:0 0 14px">${hl(p).replace(/\n/g, '<br>')}</p>`).join('');
const sec = (n, t, en) => `<table width="100%" style="border-collapse:collapse;margin:30px 0 14px;border-bottom:1px solid #1f1d1a"><tr><td style="font-family:Georgia,serif;font-size:24px;color:#8c2f1b;width:34px;padding-bottom:4px">${n}</td><td style="font-family:${SERIF};font-weight:bold;font-size:17px;padding-bottom:4px">${t}</td><td style="text-align:right;font-family:Georgia,serif;font-style:italic;font-size:13px;color:#7a7368;padding-bottom:4px">${en}</td></tr></table>`;
console.log(`<div style="background:#fbf8f1;padding:28px 22px;max-width:620px;margin:0 auto;color:#1f1d1a;font-family:'Malgun Gothic',Arial,sans-serif;line-height:1.8">
<table width="100%" style="border-collapse:collapse;border-bottom:3px double #1f1d1a"><tr>
<td style="font-family:${SERIF};font-weight:bold;font-size:26px;padding-bottom:6px">매일의 문장 <span style="font-family:Georgia,serif;font-style:italic;font-weight:normal;font-size:14px;color:#8c2f1b">Daily Reading</span></td>
<td style="text-align:right;font-size:11px;color:#7a7368;letter-spacing:2px;padding-bottom:6px"><span style="font-family:Georgia,serif;font-size:22px;color:#1f1d1a;letter-spacing:0">No. ${no}</span><br>${esc(d.date)}</td></tr></table>
<p style="text-align:center;margin:22px 0 4px"><a href="${pdf}" style="background:#8c2f1b;color:#ffffff;padding:12px 26px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold">📄 오늘의 국문 PDF 받기 (인쇄용 · 필사 칸 포함)</a></p>
<div style="margin-top:24px;font-size:11px;letter-spacing:6px;color:#8c2f1b;font-weight:bold">${esc(d.category)}</div>
<div style="font-family:${SERIF};font-weight:bold;font-size:30px;line-height:1.3;margin:8px 0 6px">${esc(d.title)}</div>
<div style="font-family:${SERIF};font-size:15px;color:#7a7368">${esc(d.work)}</div>
<p style="margin:22px 0;font-size:14px;color:#3b3833;border-left:3px solid #8c2f1b;padding-left:14px">${hl(d.intro)}</p>
${d.text_type === 'poem'
  ? `<div style="font-family:${SERIF};font-size:19px;line-height:2.1;white-space:pre-line;padding:10px 0 10px 26px;margin-left:10px;border-left:1px solid #d9d1c2">${esc(d.text)}</div>`
  : `<div style="font-family:${SERIF};font-size:16px;line-height:2">${paras(d.text)}</div>`}
<p style="text-align:center;color:#c9a27a;letter-spacing:12px;margin:18px 0 4px">· · ·</p>
<p style="font-size:11px;color:#7a7368">${esc(d.text_source)}</p>
${d.full_text_url ? `<p style="text-align:center;margin:10px 0"><a href="${esc(d.full_text_url)}" style="color:#8c2f1b;font-size:14px;font-weight:bold">📖 전문 읽기 — ${esc(d.full_text_label || '원문 페이지')}</a></p>` : ''}
${sec('I', '함께 읽기', 'Commentary')}
<div style="font-family:${SERIF};font-size:15px;line-height:1.95">${paras(d.notes)}</div>
${d.words?.length ? `<div style="background:#f3eee3;padding:14px 18px;margin-top:10px"><div style="font-size:11px;letter-spacing:5px;color:#2f4f3e;font-weight:bold;margin-bottom:6px">낱말 풀이</div>${d.words.map(w => `<div style="font-size:13px;margin:3px 0"><b style="font-family:${SERIF};font-size:15px">${esc(w.word)}</b> &nbsp;${esc(w.meaning)}</div>`).join('')}</div>` : ''}
${d.think ? sec('II', '오늘의 생각 거리', 'Thinking') + `<div style="font-family:${SERIF};font-size:15px;line-height:1.95">${paras(d.think)}</div>` : ''}
${d.other_view ? `<div style="border-left:4px solid #2f4f3e;background:#fffdf7;padding:12px 16px;margin-top:6px"><div style="font-size:11px;letter-spacing:5px;color:#2f4f3e;font-weight:bold;margin-bottom:4px">다르게 읽기</div><div style="font-family:${SERIF};font-size:14px">${paras(d.other_view)}</div></div>` : ''}
${sec(d.think ? 'III' : 'II', '생각해 볼 질문', 'Reflection')}
${d.questions.map((q, i) => `<table width="100%" style="border-collapse:collapse;margin-bottom:12px"><tr><td style="font-family:Georgia,serif;font-size:24px;color:#8c2f1b;width:34px;vertical-align:top;line-height:1.2">${i + 1}</td><td style="font-family:${SERIF};font-size:15px">${hl(q)}</td></tr></table>`).join('')}
${d.action ? `<div style="background:#1f1d1a;color:#fbf8f1;padding:14px 18px;margin-top:8px;font-family:${SERIF};font-size:15px"><span style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:4px;color:#e3b48c">오늘 하루 한 가지</span><br>${hl(d.action).replace(/color:#8c2f1b/g, 'color:#f0c9a8')}</div>` : ''}
${sec(d.think ? 'IV' : 'III', '오늘의 한 문장', 'Transcription')}
<div style="text-align:center;font-family:${SERIF};font-weight:bold;font-size:22px;line-height:1.5;border-top:1px solid #1f1d1a;border-bottom:1px solid #1f1d1a;padding:22px 10px">${esc(d.quote)}</div>
<p style="text-align:center;margin:28px 0 6px"><a href="${pdf}" style="background:#1f1d1a;color:#fbf8f1;padding:12px 26px;text-decoration:none;font-size:14px;letter-spacing:1px">📄 인쇄용 PDF 받기 · 원고지 필사 칸 포함</a></p>
</div>`);

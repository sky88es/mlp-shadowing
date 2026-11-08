// Usage: node daily-reading/make_email.js <lesson.json>  -> prints HTML email body
const fs = require('fs');
const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const date = require('path').basename(process.argv[2], '.json');
const pdf = `https://raw.githubusercontent.com/sky88es/mlp-shadowing/ccr-7681b3cb-dx280m/daily-reading/pdf/${date}.pdf`;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hl = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/ \/ /g, ' ');
const td = 'style="padding:4px 8px;border-bottom:1px solid #e3e6ee;vertical-align:top"';
console.log(`<div style="font-family:Arial,'Malgun Gothic',sans-serif;max-width:640px;color:#1d2433;line-height:1.6">
<div style="background:#0b3d91;color:#fff;padding:16px 18px;border-radius:8px">
<div style="font-size:12px;opacity:.85">DAY ${d.day} · ${esc(d.category)} · ${esc(d.level)}</div>
<div style="font-size:21px;font-weight:bold;margin:6px 0">${esc(d.title)}</div>
<div style="font-size:14px">${esc(d.title_ko)}</div></div>
<p style="text-align:center;margin:18px 0"><a href="${pdf}" style="background:#c8102e;color:#fff;padding:10px 22px;border-radius:6px;text-decoration:none;font-weight:bold">📄 오늘의 학습 PDF 받기 (4쪽 · 인쇄용)</a></p>
<p style="background:#f5f7fb;padding:10px 12px;border-radius:6px;font-size:13px">${esc(d.background_ko)}</p>
<h3 style="color:#0b3d91">📖 Today's Reading</h3>
<ol style="padding-left:22px">${d.lines.map(l => `<li style="margin-bottom:6px">${hl(l.en)}<br><span style="color:#5d6678;font-size:13px">${esc(l.ko)}</span></li>`).join('')}</ol>
<h3 style="color:#0b3d91">📝 주요 단어</h3>
<table style="border-collapse:collapse;font-size:13px;width:100%">${d.words.map(w => `<tr><td ${td}><b>${esc(w.word)}</b> <span style="color:#888">${esc(w.ipa)}</span></td><td ${td}>${esc(w.meaning)}</td></tr>`).join('')}</table>
<h3 style="color:#0b3d91">💬 주요 숙어</h3>
<table style="border-collapse:collapse;font-size:13px;width:100%">${d.idioms.map(i => `<tr><td ${td}><b>${esc(i.phrase)}</b></td><td ${td}>${esc(i.meaning)}</td></tr>`).join('')}</table>
<p style="font-size:12px;color:#888;margin-top:20px">Source: ${esc(d.source.outlet)} — <a href="${esc(d.source.url)}">${esc(d.source.title)}</a><br>원문 기사를 바탕으로 학습용으로 새로 쓴 글입니다. 문제·문법·정답은 PDF에 있습니다.</p></div>`);

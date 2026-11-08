// Usage: node daily-reading/make_email.js <lesson.json>  -> prints HTML email body
const fs = require('fs');
const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const date = require('path').basename(process.argv[2], '.json');
const attached = process.argv.includes('--attached');
const pdf = `https://raw.githubusercontent.com/sky88es/mlp-shadowing/ccr-7681b3cb-dx280m/daily-reading/pdf/${date}.pdf`;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hl = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/ \/ /g, ' ');
const td = 'style="padding:4px 8px;border-bottom:1px solid #e3e6ee;vertical-align:top"';
console.log(`<div style="font-family:Arial,'Malgun Gothic',sans-serif;max-width:640px;color:#1d2433;line-height:1.6">
<div style="background:#0b3d91;color:#fff;padding:16px 18px;border-radius:8px">
<div style="font-size:12px;opacity:.85">DAY ${d.day} · ${esc(d.category)} · ${esc(d.level)}</div>
<div style="font-size:21px;font-weight:bold;margin:6px 0">${esc(d.title)}</div>
<div style="font-size:14px">${esc(d.title_ko)}</div></div>
${attached ? `<p style="text-align:center;margin:16px 0;font-weight:bold;color:#c8102e">📎 오늘의 학습 PDF(4쪽 · 인쇄용)가 첨부되어 있습니다.</p>` : `<p style="text-align:center;margin:18px 0"><a href="${pdf}" style="background:#c8102e;color:#fff;padding:10px 22px;border-radius:6px;text-decoration:none;font-weight:bold">📄 오늘의 학습 PDF 받기 (4쪽 · 인쇄용)</a></p>`}
<p style="background:#f5f7fb;padding:10px 12px;border-radius:6px;font-size:13px">${esc(d.background_ko)}</p>
<h3 style="color:#0b3d91">📖 Today's Reading</h3>
<ol style="padding-left:22px">${d.lines.map(l => `<li style="margin-bottom:6px">${hl(l.en)}<br><span style="color:#5d6678;font-size:13px">${esc(l.ko)}</span></li>`).join('')}</ol>
<h3 style="color:#0b3d91">📝 주요 단어</h3>
<table style="border-collapse:collapse;font-size:13px;width:100%">${d.words.map(w => `<tr><td ${td}><b>${esc(w.word)}</b> <span style="color:#888">${esc(w.ipa)}</span></td><td ${td}>${esc(w.meaning)}</td></tr>`).join('')}</table>
<h3 style="color:#0b3d91">💬 주요 숙어</h3>
<table style="border-collapse:collapse;font-size:13px;width:100%">${d.idioms.map(i => `<tr><td ${td}><b>${esc(i.phrase)}</b></td><td ${td}>${esc(i.meaning)}</td></tr>`).join('')}</table>
<h3 style="color:#0b3d91">🔍 핵심 문장 & 문법</h3>
${d.key_sentences.map(k => `<p style="border-left:4px solid #c8102e;padding:4px 10px;margin:8px 0"><b>${hl(k.en)}</b><br><span style="font-size:13px;color:#5d6678">${esc(k.note)}</span></p>`).join('')}
<h3 style="color:#0b3d91">✅ 확인 문제</h3>
<ol style="padding-left:22px">${d.questions.map(q => `<li style="margin-bottom:6px">${esc(q.q)}${q.options ? '<br>' + q.options.map((o, i) => `${'ⓐⓑⓒⓓ'[i]} ${esc(o)}`).join('&nbsp;&nbsp; ') : ''}</li>`).join('')}</ol>
<h3 style="color:#0b3d91">✏️ 빈칸 채우기</h3>
<p style="font-size:13px;color:#5d6678">보기: ${d.blanks.map(b => b.answer).sort().map(esc).join(' · ')}</p>
<ol style="padding-left:22px">${d.blanks.map(b => `<li>${esc(b.sentence)}</li>`).join('')}</ol>
<h3 style="color:#0b3d91">🗣 말하기 · 쓰기</h3>
<p style="font-size:13px;white-space:pre-line">${esc(d.output_task)}</p>
<details><summary style="color:#0b3d91;font-weight:bold;cursor:pointer">정답 보기</summary>
<p style="font-size:13px">${d.questions.map((q, i) => `${i + 1}. ${esc(q.answer)}`).join('<br>')}<br><br>빈칸: ${d.blanks.map((b, i) => `${i + 1}. ${esc(b.answer)}`).join(' / ')}</p></details>
<p style="font-size:12px;color:#888;margin-top:20px">Source: ${esc(d.source.outlet)} — <a href="${esc(d.source.url)}">${esc(d.source.title)}</a><br>원문 기사를 바탕으로 학습용으로 새로 쓴 글입니다. </p></div>`);

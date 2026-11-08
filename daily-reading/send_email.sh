#!/usr/bin/env bash
# Usage: daily-reading/send_email.sh daily-reading/lessons/YYYY-MM-DD.json daily-reading/pdf/YYYY-MM-DD.pdf
# Sends the HTML lesson email with the PDF attached via the Brevo transactional email API.
# The real API key is injected by the session's network proxy; "proxy-injected" is a placeholder.
set -euo pipefail
JSON="$1"; PDF="$2"
DIR="$(cd "$(dirname "$0")" && pwd)"
TO="${DAILY_TO:-sangwon.park@jbam.co.kr}"
FROM="${DAILY_FROM:-sky88es@gmail.com}"
python3 - "$JSON" "$PDF" "$TO" "$FROM" "$DIR" > /tmp/daily_mail.json <<'PY'
import json, base64, subprocess, sys, os
j, pdf, to, frm, d = sys.argv[1:]
lesson = json.load(open(j))
html = subprocess.check_output(['node', os.path.join(d, 'make_email.js'), j, '--attached']).decode()
print(json.dumps({
  "sender": {"name": "Daily English", "email": frm},
  "to": [{"email": to}],
  "subject": f"[Daily English] DAY {lesson['day']} · {lesson['title']}",
  "htmlContent": html,
  "attachment": [{"name": f"DailyEnglish_{os.path.basename(pdf)}", "content": base64.b64encode(open(pdf,'rb').read()).decode()}],
}))
PY
curl -sS --fail-with-body -X POST https://api.brevo.com/v3/smtp/email \
  -H "api-key: proxy-injected" -H "content-type: application/json" \
  --data @/tmp/daily_mail.json
echo

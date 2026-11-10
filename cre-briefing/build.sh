#!/bin/sh
# Usage: sh cre-briefing/build.sh data/YYYY-MM-DD.json <outdir>
# Produces: email.html (cid:att1 = chart), email.txt, chart.png, CRE_Radar_<date>.pdf
set -e
D=$(cd "$(dirname "$0")" && pwd)
J="$1"; O="$2"; mkdir -p "$O"
NAME=$(basename "$J" .json)
sh "$D/setup_fonts.sh"
# 1) curated headlines from 부동산플래닛 간추린 뉴스 -> merged into data.digest
node "$D/read_bdsplanet.js" > "$O/bdsplanet.json" && python3 "$D/merge_digest.py" "$J" "$O/bdsplanet.json" || echo "WARN: bdsplanet read failed, digest uses own items only"
python3 "$D/build_email.py" "$J" --chart > "$O/chart.svg"
node "$D/make_pdf.js" chart "$O/chart.svg" "$O/chart.png"
python3 "$D/build_email.py" "$J" | sed 's#</tr>#</tr>\n#g' > "$O/email_inline.html"
python3 "$D/compact_html.py" "$O/email_inline.html" > "$O/email.html"
python3 "$D/build_email.py" "$J" --plain > "$O/email.txt"
python3 "$D/build_email.py" "$J" --print "$(cd "$O" && pwd)/chart.png" > "$O/print.html"
node "$D/make_pdf.js" pdf "$O/print.html" "$O/CRE_Radar_$NAME.pdf"
pdfinfo "$O/CRE_Radar_$NAME.pdf" | grep Pages

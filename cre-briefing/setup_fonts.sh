#!/bin/sh
# Install Pretendard (OFL) for PDF/chart rendering, once per container.
set -e
DEST="$HOME/.fonts/pretendard"
[ -f "$DEST/Pretendard-Regular.otf" ] && exit 0
TMP=$(mktemp -d)
(cd "$TMP" && npm pack pretendard@1.3.9 --silent >/dev/null && tar xzf pretendard-1.3.9.tgz)
mkdir -p "$DEST"
cp "$TMP"/package/dist/public/static/Pretendard-*.otf "$DEST"/
fc-cache -f >/dev/null 2>&1 || true
rm -rf "$TMP"

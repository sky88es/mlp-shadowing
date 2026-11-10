#!/usr/bin/env python3
"""Shrink the email HTML: repeated inline style="..." strings become CSS classes in a <style> block.
Usage: python3 compact_html.py in.html > out.html  (wraps as a full <html> document)"""
import re
import sys
from collections import Counter

src = open(sys.argv[1], encoding="utf-8").read()
styles = Counter(re.findall(r'style="([^"]*)"', src))
names = {}
for i, (st, n) in enumerate(sorted(styles.items(), key=lambda x: -x[1] * len(x[0]))):
    if n >= 2 and len(st) > 12:
        names[st] = f"c{len(names)}"


def repl(m):
    tag = m.group(0)
    sm = re.search(r'style="([^"]*)"', tag)
    if not sm or sm.group(1) not in names:
        return tag
    cls = names[sm.group(1)]
    tag = tag.replace(sm.group(0), "")
    cm = re.search(r'class="([^"]*)"', tag)
    if cm:
        tag = tag.replace(cm.group(0), f'class="{cm.group(1)} {cls}"')
    else:
        tag = tag[:-1].rstrip() + f' class="{cls}">' if not tag.endswith("/>") else tag[:-2] + f' class="{cls}"/>'
    return re.sub(r"\s+>", ">", tag)


body = re.sub(r"<[a-zA-Z][^>]*>", repl, src)
css = "\n".join(f".{c}{{{st}}}" for st, c in names.items())
sys.stdout.write('<!doctype html><html><head><meta charset="utf-8"><style>\n' + css +
                 '\n</style></head><body style="margin:0">' + body + "</body></html>")

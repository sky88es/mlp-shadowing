#!/usr/bin/env python3
"""Lossless clean-up of a generated PDF so it fits in an email attachment (Gmail tool limit ~3 MB of files).
Usage: python3 kids/tools/shrink_pdf.py <in.pdf> [out.pdf]   (default: overwrite in place)

Do NOT use PyMuPDF's rewrite_images(): it deletes the colour-emoji glyph images and the pictures go blank.
Only deflate/garbage-collect here. Prints the final size and exits 1 if it is over 3.0 MB."""
import os, sys
import pymupdf

src = sys.argv[1]
dst = sys.argv[2] if len(sys.argv) > 2 else src
pymupdf.TOOLS.mupdf_display_errors(False)
doc = pymupdf.open(src)
tmp = dst + '.tmp'
doc.save(tmp, garbage=4, deflate=True, deflate_images=True, deflate_fonts=True)
doc.close()
os.replace(tmp, dst)
mb = os.path.getsize(dst) / 1e6
print(f'{dst}: {mb:.2f} MB')
sys.exit(0 if mb <= 3.0 else 1)

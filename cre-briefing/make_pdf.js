// node cre-briefing/make_pdf.js chart <chart.svg> <chart.png>   -> 2x PNG of the chart
// node cre-briefing/make_pdf.js pdf   <print.html> <out.pdf>    -> A4 PDF
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const [mode, src, out] = process.argv.slice(2);
  const b = await chromium.launch();
  if (mode === 'chart') {
    const svg = fs.readFileSync(src, 'utf8');
    const w = +svg.match(/width="(\d+)"/)[1], h = +svg.match(/height="(\d+)"/)[1];
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await p.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    await p.screenshot({ path: out, clip: { x: 0, y: 0, width: w, height: h } });
  } else {
    const p = await b.newPage();
    await p.goto('file://' + path.resolve(src));
    await p.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true, scale: 0.82 });
  }
  await b.close();
})();

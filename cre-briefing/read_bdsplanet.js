// Reads the public "간추린 뉴스" page of 부동산플래닛 인사이드 in a browser and prints
// today's curated headlines grouped by section, as JSON: [{section, sub, items:[{title, media, url}]}]
// Usage: node cre-briefing/read_bdsplanet.js > /tmp/cre/bdsplanet.json
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto('https://inside.bdsplanet.com/news', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2000);
  const out = await p.evaluate(() => {
    const res = { date: '', sections: [] };
    const h = [...document.querySelectorAll('*')].find(e => /간추린 뉴스$/.test(e.textContent.trim()) && /\d{4}\.\d{2}\.\d{2}/.test(e.textContent) && e.children.length < 4);
    if (h) res.date = (h.textContent.match(/\d{4}\.\d{2}\.\d{2}/) || [''])[0];
    const links = [...document.querySelectorAll('a[href^="http"]')].filter(a => !/bdsplanet|kakao|facebook|naver\.me/.test(a.href));
    let cur = null;
    for (const a of links) {
      // nearest preceding section header text (English + Korean subtitle)
      let box = a.closest('section, article, li')?.parentElement;
      while (box && !box.querySelector('h2,h3,strong,b')) box = box.parentElement;
      const head = box ? (box.querySelector('h2,h3,strong,b')?.innerText || '').trim() : '';
      const t = a.innerText.trim().replace(/\s+/g, ' ');
      if (!t || /367\.co\.kr|apple\.com|google\.com/.test(a.href)) continue;
      // media name is the text of the row that is not part of the link title
      const row = a.closest('li') || a.parentElement;
      let media = row ? row.innerText.replace(a.innerText, '').replace(/[·•\s]+/g, ' ').trim() : '';
      if (!media || media.length > 20) {
        const sib = a.nextElementSibling || a.parentElement.nextElementSibling;
        media = sib ? sib.innerText.replace(/[·\s]+/g, ' ').trim() : media;
      }
      const item = { title: t, media: (media || '').slice(0, 20), url: a.href };
      if (!cur || cur.section !== head) { cur = { section: head, items: [] }; res.sections.push(cur); }
      cur.items.push(item);
    }
    res.sections = res.sections.filter(s => s.items.length && s.section);
    return res;
  });
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();

// Usage: node kids/build_index.js  -> rewrites kids/lessons/index.json from kids/lessons/YYYY-MM-DD.json
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'lessons');
const list = fs.readdirSync(dir).filter(f => /^\d{4}-\d\d-\d\d\.json$/.test(f)).sort().map(f => {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  return { date: d.date, day: d.day, weekday: d.weekday, en_title: d.en.title, ko_title: d.ko.title, cover: d.en.pages[0].scene };
});
fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(list, null, 1) + '\n');
console.log(`index.json: ${list.length} lessons`);

// Shared picture-book illustration renderer (site + PDF).
// scene = { bg, items: [[emoji, x%, y%, size%(of width), flip?], ...] }  x,y = center of the emoji
// bg: day | field | autumn | snow | night | house | kitchen | sea | pitch | stage | space | rain
(function (root) {
  const W = 400, H = 300;
  const cloud = (x, y, s, c = '#fff') => `<g fill="${c}" opacity=".95"><ellipse cx="${x}" cy="${y}" rx="${26 * s}" ry="${12 * s}"/><ellipse cx="${x - 16 * s}" cy="${y + 3 * s}" rx="${16 * s}" ry="${10 * s}"/><ellipse cx="${x + 18 * s}" cy="${y + 4 * s}" rx="${15 * s}" ry="${9 * s}"/><ellipse cx="${x + 2 * s}" cy="${y - 8 * s}" rx="${15 * s}" ry="${11 * s}"/></g>`;
  const hills = (a, b) => `<path d="M0 ${H * .72} C 90 ${H * .58}, 170 ${H * .62}, 240 ${H * .7} S 360 ${H * .64}, ${W} ${H * .66} V ${H} H 0 Z" fill="${a}"/><path d="M0 ${H * .82} C 110 ${H * .74}, 220 ${H * .9}, ${W} ${H * .78} V ${H} H 0 Z" fill="${b}"/>`;
  const dots = (n, color, r, yMax, seed) => { let s = seed, o = ''; for (let i = 0; i < n; i++) { s = (s * 9301 + 49297) % 233280; const x = s / 233280 * W; s = (s * 9301 + 49297) % 233280; const y = s / 233280 * yMax; o += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${color}"/>`; } return o; };
  const sky = (id, a, b) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
  const BG = {
    day: () => sky('d', '#9fd8ff', '#e4f6ff') + `<circle cx="345" cy="52" r="34" fill="#fff6c2" opacity=".7"/><circle cx="345" cy="52" r="22" fill="#ffe27a"/>` + cloud(90, 55, 1) + cloud(230, 38, .7) + hills('#9fdc7c', '#74c55a'),
    field: () => sky('f', '#b8e6ff', '#f0fbff') + cloud(70, 48, .9) + cloud(300, 60, .7) + hills('#b5e48c', '#8ccf6b') + dots(14, '#fff', 2.2, 0, 7).replace(/cy="0\.0"/g, ''),
    autumn: () => sky('a', '#ffd9a8', '#fff2df') + cloud(300, 50, .8, '#fffaf2') + hills('#f4a259', '#e07a3f') + dots(18, '#c8553d', 3, H * .6, 11),
    snow: () => sky('s', '#cfe4ff', '#f4f9ff') + dots(40, '#fff', 2.6, H * .7, 5) + hills('#ffffff', '#e6f0fb'),
    night: () => sky('n', '#1d2257', '#45408f') + dots(30, '#fff7c4', 1.6, H * .55, 3) + `<circle cx="320" cy="56" r="26" fill="#fff3b0"/><circle cx="332" cy="48" r="24" fill="#2a2d6b"/>` + hills('#2f5d50', '#234a3f'),
    house: () => `<rect width="${W}" height="${H}" fill="#fff1dc"/><rect x="40" y="40" width="110" height="90" rx="8" fill="#bfe7ff" stroke="#e8c9a0" stroke-width="8"/><line x1="95" y1="40" x2="95" y2="130" stroke="#e8c9a0" stroke-width="5"/><rect x="250" y="50" width="90" height="60" rx="6" fill="#ffd6e0"/><rect y="${H * .74}" width="${W}" height="${H * .26}" fill="#e2b98f"/>` + Array.from({ length: 8 }, (_, i) => `<line x1="${i * 55}" y1="${H * .74}" x2="${i * 55 - 30}" y2="${H}" stroke="#d3a679" stroke-width="2"/>`).join(''),
    kitchen: () => `<rect width="${W}" height="${H}" fill="#fdf6e9"/>` + Array.from({ length: 30 }, (_, i) => `<rect x="${(i % 10) * 40 + 2}" y="${Math.floor(i / 10) * 30 + 30}" width="36" height="26" rx="4" fill="#e8f3f1"/>`).join('') + `<rect y="${H * .66}" width="${W}" height="14" fill="#c98b5b"/><rect y="${H * .66 + 14}" width="${W}" height="${H}" fill="#f2d3b3"/>`,
    sea: () => sky('se', '#aee3ff', '#e8f8ff') + cloud(110, 50, .9) + `<path d="M0 ${H * .62} Q 50 ${H * .58} 100 ${H * .62} T 200 ${H * .62} T 300 ${H * .62} T 400 ${H * .62} V ${H} H0Z" fill="#4fb3e8"/><path d="M0 ${H * .74} Q 50 ${H * .7} 100 ${H * .74} T 200 ${H * .74} T 300 ${H * .74} T 400 ${H * .74} V ${H} H0Z" fill="#2f8fcf"/>`,
    pitch: () => sky('p', '#a9dcff', '#e9f7ff') + cloud(300, 45, .8) + `<rect y="${H * .55}" width="${W}" height="${H * .45}" fill="#6cc04a"/>` + Array.from({ length: 6 }, (_, i) => `<rect x="${i * 70}" y="${H * .55}" width="35" height="${H * .45}" fill="#62b343"/>`).join('') + `<rect x="300" y="${H * .5}" width="80" height="50" fill="none" stroke="#fff" stroke-width="5"/><path d="M300 ${H * .5} l10 -6 h70 l-10 6" fill="none" stroke="#fff" stroke-width="3"/><ellipse cx="160" cy="${H * .78}" rx="60" ry="14" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>`,
    stage: () => `<rect width="${W}" height="${H}" fill="#3b2a5c"/><path d="M0 0 H${W} V40 Q ${W * .75} 70 ${W / 2} 40 Q ${W * .25} 70 0 40Z" fill="#d64545"/><rect x="0" width="40" height="${H}" fill="#c43c3c"/><rect x="${W - 40}" width="40" height="${H}" fill="#c43c3c"/><ellipse cx="200" cy="${H * .86}" rx="170" ry="30" fill="#ffe08a" opacity=".35"/><rect y="${H * .8}" width="${W}" height="${H * .2}" fill="#a0673f"/>`,
    space: () => `<rect width="${W}" height="${H}" fill="#14163d"/>` + dots(60, '#fff', 1.4, H, 9) + `<circle cx="330" cy="240" r="90" fill="#3d6fd6" opacity=".9"/>`,
    rain: () => sky('r', '#9fb4c8', '#dbe6ef') + cloud(100, 45, 1.2, '#eef3f7') + cloud(290, 55, 1, '#eef3f7') + Array.from({ length: 40 }, (_, i) => `<line x1="${(i * 37) % W}" y1="${(i * 53) % (H * .7) + 70}" x2="${(i * 37) % W - 5}" y2="${(i * 53) % (H * .7) + 82}" stroke="#7fa3c4" stroke-width="2"/>`).join('') + hills('#9ccf86', '#7fbe6c')
  };
  function bgSVG(name) { return `<svg class="bg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${(BG[name] || BG.day)()}</svg>`; }
  function sceneHTML(s, cls) {
    const items = ((s && s.items) || []).map(([e, x, y, size, flip], i) =>
      `<span class="it" style="left:${x}%;top:${y}%;font-size:${size}cqw;animation-delay:${(i * 0.37) % 2}s${flip ? ';--fx:-1' : ''}">${e}</span>`).join('');
    return `<div class="scene ${cls || ''}">${bgSVG(s && s.bg)}${items}</div>`;
  }
  const SCENE_CSS = `
.scene{position:relative;width:100%;aspect-ratio:4/3;border-radius:22px;overflow:hidden;container-type:inline-size;background:#eaf6ff}
.scene .bg{position:absolute;inset:0;width:100%;height:100%}
.scene .it{position:absolute;transform:translate(-50%,-50%) scaleX(var(--fx,1));line-height:1;font-family:'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif;user-select:none;filter:drop-shadow(0 .6cqw .5cqw rgba(0,0,0,.18))}`;
  root.KidsScene = { sceneHTML, SCENE_CSS };
  if (typeof module !== 'undefined') module.exports = root.KidsScene;
})(typeof window !== 'undefined' ? window : globalThis);

// Shared picture renderer (site + PDF).
// scene = { bg: "autumn"|"field"|"snow"|"night"|"day"|"sea"|"house"|"space",
//           items: [[emoji, x%, y%, size%(of width), flip?], ...] }  x,y = center
(function (root) {
  const BG = {
    autumn: ['#ffe2b8', '#ffc98a', '#e9a05a'],
    field:  ['#d9f1ff', '#bfe6ff', '#9ed36f'],
    snow:   ['#e7f0fb', '#d3e2f5', '#ffffff'],
    night:  ['#22285a', '#3a3f86', '#3b5b3a'],
    day:    ['#cfeeff', '#a9ddff', '#8fcf6a'],
    sea:    ['#d6f3ff', '#9fdcf7', '#3fa6d8'],
    house:  ['#fff4dd', '#ffe9c2', '#d9a877'],
    space:  ['#0d1033', '#1d2160', '#1d2160']
  };
  function sceneHTML(s, cls) {
    const c = BG[s && s.bg] || BG.day;
    const items = ((s && s.items) || []).map(([e, x, y, size, flip], i) =>
      `<span class="it" style="left:${x}%;top:${y}%;font-size:${size}cqw;animation-delay:${(i * 0.37) % 2}s${flip ? ';--fx:-1' : ''}">${e}</span>`).join('');
    return `<div class="scene ${cls || ''}" style="background:linear-gradient(${c[0]},${c[1]} 68%,${c[2]} 68%)">${items}</div>`;
  }
  const SCENE_CSS = `
.scene{position:relative;width:100%;aspect-ratio:4/3;border-radius:22px;overflow:hidden;container-type:inline-size;box-shadow:inset 0 -6px 0 rgba(0,0,0,.06)}
.scene .it{position:absolute;transform:translate(-50%,-50%) scaleX(var(--fx,1));line-height:1;font-family:'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif;user-select:none}`;
  root.KidsScene = { sceneHTML, SCENE_CSS };
  if (typeof module !== 'undefined') module.exports = root.KidsScene;
})(typeof window !== 'undefined' ? window : globalThis);

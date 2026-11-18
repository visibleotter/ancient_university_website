// Клиентская часть страницы /map/: шкала времени (SVG) с окнами A и B и глобус globe.gl, синхронные между собой.
// Данные встроены в страницу (<script id="map-data">) — см. src/lib/map.ts.
import type { MapWorld, MapItem, MapArc, When } from '../lib/map';

type Data = { worlds: MapWorld[]; items: MapItem[]; arcs: MapArc[] };
type Win = { c: number; on: boolean };
const SVG = 'http://www.w3.org/2000/svg';

// Шкала с разрывами: глубокая древность и наша эра сжаты.
const SEG = [
  { a: -15000, b: -3500, w: 0.12 },
  { a: -3500, b: 0, w: 0.7 },
  { a: 0, b: 2030, w: 0.18 },
];
const MIN = SEG[0].a, MAX = SEG[SEG.length - 1].b;
const TICKS = [-15000, -10000, -5000, -3000, -2500, -2000, -1500, -1000, -500, 0, 500, 1000, 1500, 2000];
const COLORS = { A: '#d1495b', B: '#2e86de' };
const WORLD_COLORS = ['#8d6e63', '#c08b30', '#b5651d', '#7b1fa2', '#2e7d32', '#1565c0', '#d1495b', '#00838f', '#ad1457', '#5d4037'];

const year = (y: number) => (y < 0 ? `${Math.round(-y)} до н. э.` : `${Math.round(y)}`);
const span = (w?: When) => (w ? `${w.approx ? '≈ ' : ''}${year(w.from)}${w.to !== undefined ? ' — ' + year(w.to) : ''}` : '');
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function start() {
  const data: Data = JSON.parse(document.getElementById('map-data')!.textContent!);
  const svg = document.getElementById('timeline') as unknown as SVGSVGElement;
  const lists = document.getElementById('lists')!;
  const readout = document.getElementById('readout')!;
  const widthSel = document.getElementById('width') as HTMLSelectElement;
  const compare = document.getElementById('compare') as HTMLInputElement;
  const playBtn = document.getElementById('play') as HTMLButtonElement;

  const wins: Record<'A' | 'B', Win> = { A: { c: -600, on: true }, B: { c: -2500, on: false } };
  let width = +widthSel.value;
  let active: 'A' | 'B' = 'A';
  let hot: string | null = null;
  const worldColor = new Map(data.worlds.map((w, i) => [w.id, WORLD_COLORS[i % WORLD_COLORS.length]]));
  const worldTitle = new Map(data.worlds.map((w) => [w.id, w.title]));

  // ---------- шкала ----------
  const LABEL = 150, PAD = 10, LANE = 26, TOP = 22;
  const lanes = [...data.worlds.map((w) => ({ id: w.id, title: w.title, when: w.when })), { id: '', title: 'Наука нового времени', when: undefined as When | undefined }];
  const H = TOP + lanes.length * LANE + 6;
  let W = 900;
  const x = (y: number) => {
    y = Math.max(MIN, Math.min(MAX, y));
    let off = 0;
    for (const s of SEG) {
      if (y <= s.b) return LABEL + (off + ((y - s.a) / (s.b - s.a)) * s.w) * (W - LABEL - PAD);
      off += s.w;
    }
    return W - PAD;
  };
  const yearAt = (px: number) => {
    const f = (px - LABEL) / (W - LABEL - PAD);
    let off = 0;
    for (const s of SEG) {
      if (f <= off + s.w) return s.a + ((f - off) / s.w) * (s.b - s.a);
      off += s.w;
    }
    return MAX;
  };
  const el = (tag: string, attrs: Record<string, string | number>, parent: Element = svg) => {
    const e = document.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    parent.appendChild(e);
    return e;
  };
  const range = (w: Win) => [w.c - width / 2, w.c + width / 2] as const;
  const inWin = (when: When | undefined, w: Win) => {
    if (!when || !w.on) return false;
    const [a, b] = range(w);
    return when.from <= b && (when.to ?? when.from) >= a;
  };
  const winsOf = (when?: When) => (['A', 'B'] as const).filter((k) => inWin(when, wins[k]));

  function drawTimeline() {
    W = Math.max(860, svg.parentElement!.clientWidth);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('height', String(H));
    svg.replaceChildren();
    // разрывы и деления
    let off = 0;
    for (const s of SEG.slice(0, -1)) {
      off += s.w;
      const bx = LABEL + off * (W - LABEL - PAD);
      el('line', { x1: bx, x2: bx, y1: TOP - 6, y2: H, stroke: '#999', 'stroke-dasharray': '2 3' });
    }
    for (const tk of TICKS) {
      el('line', { x1: x(tk), x2: x(tk), y1: TOP - 4, y2: H, stroke: '#eee' });
      el('text', { x: x(tk), y: 12, 'text-anchor': 'middle' }).textContent = tk === 0 ? '0' : tk < 0 ? `${-tk}` : `${tk}`;
    }
    el('text', { x: 4, y: 12 }).textContent = 'до н. э. | н. э.';
    // дорожки
    lanes.forEach((l, i) => {
      const y0 = TOP + i * LANE, cy = y0 + LANE / 2;
      if (i % 2) el('rect', { x: 0, y: y0, width: W, height: LANE, fill: '#fafafa' });
      const t = el('text', { x: 4, y: cy + 4, class: 'lane-label' });
      t.textContent = l.title.length > 22 ? l.title.slice(0, 21) + '…' : l.title;
      const col = worldColor.get(l.id) ?? '#555';
      if (l.when) el('rect', { x: x(l.when.from), y: y0 + 4, width: Math.max(2, x(l.when.to ?? l.when.from) - x(l.when.from)), height: LANE - 8, fill: col, opacity: 0.12, rx: 4 });
      for (const it of data.items.filter((d) => (d.world ?? '') === l.id && d.when)) {
        const w = it.when!, on = winsOf(w).length > 0;
        const cls = `item${on ? '' : ' dim'}${hot === it.id ? ' hot' : ''}`;
        const g = el('a', { href: it.href, class: cls, 'data-id': it.id });
        if (w.to !== undefined && x(w.to) - x(w.from) > 6)
          el('rect', { x: x(w.from), y: cy - 4, width: x(w.to) - x(w.from), height: 8, rx: 4, fill: col, opacity: w.approx ? 0.7 : 1 }, g);
        else el('circle', { cx: x(w.from), cy, r: 4.5, fill: col }, g);
        el('title', {}, g).textContent = `${it.title} — ${span(w)}`;
        g.addEventListener('mouseenter', () => setHot(it.id));
        g.addEventListener('mouseleave', () => setHot(null));
      }
    });
    // окна
    for (const k of ['B', 'A'] as const) {
      const w = wins[k];
      if (!w.on) continue;
      const [a, b] = range(w);
      const r = el('rect', { x: x(a), y: TOP - 6, width: Math.max(6, x(b) - x(a)), height: H - TOP + 6, fill: COLORS[k], 'fill-opacity': 0.13, stroke: COLORS[k], 'stroke-width': active === k ? 2 : 1, class: 'win', 'data-win': k });
      el('title', {}, r).textContent = `Окно ${k}: ${year(a)} — ${year(b)}`;
      el('text', { x: x(a) + 3, y: H - 4, fill: COLORS[k] }).textContent = k;
    }
  }

  // перетаскивание окон и щелчок по шкале
  let drag: { k: 'A' | 'B'; dx: number } | null = null;
  const pxOf = (e: PointerEvent) => {
    const r = svg.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * W;
  };
  svg.addEventListener('pointerdown', (e) => {
    const t = e.target as Element;
    const k = (t.getAttribute('data-win') as 'A' | 'B' | null) ?? null;
    if (t.closest('.item')) return;
    const px = pxOf(e);
    if (px < LABEL) return;
    if (k) {
      active = k;
      drag = { k, dx: px - x(wins[k].c) };
    } else {
      wins[active].c = clampC(yearAt(px));
      drag = { k: active, dx: 0 };
      update();
    }
    svg.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!drag) return;
    wins[drag.k].c = clampC(yearAt(pxOf(e) - drag.dx));
    update();
  });
  const end = () => (drag = null);
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
  const clampC = (c: number) => Math.round(Math.max(MIN + width / 2, Math.min(MAX - width / 2, c)));

  // ---------- списки «что в окне» ----------
  function drawLists() {
    const html: string[] = [];
    for (const k of ['A', 'B'] as const) {
      const w = wins[k];
      if (!w.on) continue;
      const [a, b] = range(w);
      const rows: string[] = [];
      for (const l of lanes) {
        const world = data.worlds.find((d) => d.id === l.id);
        const places = (world?.places ?? []).filter((p) => inWin(p.when, w));
        const items = data.items.filter((d) => (d.world ?? '') === l.id && inWin(d.when, w));
        if (!places.length && !items.length) continue;
        rows.push(`<h4>${esc(l.title)}</h4><ul>` +
          places.map((p) => `<li>📍 ${esc(p.name)} <small>${span(p.when)}</small></li>`).join('') +
          items.map((d) => `<li data-id="${d.id}"${hot === d.id ? ' class="hot"' : ''}><a href="${d.href}">${esc(d.title)}</a> <small>${span(d.when)}</small></li>`).join('') + '</ul>');
      }
      html.push(`<section><h3 style="color:${COLORS[k]}">Окно ${k}: ${year(a)} — ${year(b)}</h3>${rows.join('') || '<p>В нашем каталоге пока ничего.</p>'}</section>`);
    }
    lists.innerHTML = html.join('');
    readout.textContent = (['A', 'B'] as const).filter((k) => wins[k].on).map((k) => `${k}: ${year(range(wins[k])[0])} — ${year(range(wins[k])[1])}`).join(' · ');
  }

  // ---------- глобус ----------
  let globe: any = null;
  type Pt = { id: string; name: string; lat: number; lng: number; color: string; href?: string; label: string; size: number };
  function globePoints(): Pt[] {
    const pts: Pt[] = [];
    const both = wins.B.on;
    for (const w of data.worlds)
      for (const p of w.places) {
        const ks = winsOf(p.when);
        if (!ks.length) continue;
        pts.push({ id: `${w.id}:${p.name}`, name: p.name, lat: p.lat, lng: p.lon, href: w.href, size: 0.5,
          color: both ? (ks.length > 1 ? '#8e44ad' : COLORS[ks[0]]) : worldColor.get(w.id)!,
          label: `<b>${esc(p.name)}</b><br>${esc(w.title)}<br>${span(p.when)}` });
      }
    for (const d of data.items) {
      if (!d.place) continue;
      const ks = winsOf(d.when);
      if (!ks.length) continue;
      pts.push({ id: d.id, name: d.title, lat: d.place.lat, lng: d.place.lon, href: d.href, size: hot === d.id ? 0.9 : 0.35,
        color: both ? (ks.length > 1 ? '#8e44ad' : COLORS[ks[0]]) : worldColor.get(d.world ?? '') ?? '#ddd',
        label: `<b>${esc(d.title)}</b>${d.place.name ? '<br>📍 ' + esc(d.place.name) : ''}<br>${span(d.when)}` });
    }
    return pts;
  }
  function globeArcs() {
    const byId = new Map(data.items.map((d) => [d.id, d]));
    return data.arcs
      .map((a) => ({ a, f: byId.get(a.from)!, t: byId.get(a.to)! }))
      .filter(({ f, t }) => winsOf(f.when).length || winsOf(t.when).length)
      .map(({ a, f, t }) => ({ startLat: f.place!.lat, startLng: f.place!.lon, endLat: t.place!.lat, endLng: t.place!.lon,
        label: `${esc(f.title)} ↔ ${esc(t.title)}${a.note ? '<br>' + esc(a.note) : ''}` }));
  }
  async function initGlobe() {
    const box = document.getElementById('globe')!;
    try {
      const [{ default: Globe }, topo, { feature }] = await Promise.all([
        import('globe.gl'), import('world-atlas/land-110m.json'), import('topojson-client'),
      ]);
      const land = feature((topo as any).default ?? topo, ((topo as any).default ?? topo).objects.land) as any;
      globe = new (Globe as any)(box)
        .width(box.clientWidth).height(box.clientHeight)
        .backgroundColor('#0d1b2a')
        .showAtmosphere(true).atmosphereColor('#9cc9ff').atmosphereAltitude(0.12)
        .polygonsData(land.features).polygonCapColor(() => '#e9dcc0').polygonSideColor(() => 'rgba(0,0,0,0)')
        .polygonStrokeColor(() => '#b9a77f').polygonAltitude(0.004)
        .pointLat('lat').pointLng('lng').pointColor('color').pointAltitude(0.012).pointRadius('size').pointLabel('label')
        .onPointClick((p: Pt) => p.href && (location.href = p.href))
        .onPointHover((p: Pt | null) => { box.style.cursor = p ? 'pointer' : ''; setHot(p && data.items.some((d) => d.id === p.id) ? p.id : null, true); })
        .labelLat('lat').labelLng('lng').labelText('name').labelSize(0.45).labelDotRadius(0).labelColor(() => 'rgba(255,255,255,.85)').labelAltitude(0.013)
        .arcColor(() => ['#ffd166', '#ef476f']).arcStroke(0.5).arcDashLength(0.4).arcDashGap(0.2).arcDashAnimateTime(2500).arcLabel('label')
        .pointOfView({ lat: 34, lng: 30, altitude: 1.9 });
      globe.globeMaterial().color.set('#2b4a6f');
      new ResizeObserver(() => globe.width(box.clientWidth).height(box.clientHeight)).observe(box);
      drawGlobe();
    } catch (err) {
      console.warn('globe failed', err);
      box.hidden = true;
      document.getElementById('globe-fail')!.hidden = false;
    }
  }
  function drawGlobe() {
    if (!globe) return;
    const pts = globePoints();
    globe.pointsData(pts).labelsData(pts.filter((p) => p.size >= 0.5 || p.id === hot)).arcsData(globeArcs());
  }

  function setHot(id: string | null, fromGlobe = false) {
    if (hot === id) return;
    hot = id;
    svg.querySelectorAll('.item').forEach((n) => n.classList.toggle('hot', n.getAttribute('data-id') === id));
    lists.querySelectorAll('li[data-id]').forEach((n) => n.classList.toggle('hot', n.getAttribute('data-id') === id));
    if (!fromGlobe) drawGlobe();
  }

  function update() {
    drawTimeline();
    drawLists();
    drawGlobe();
  }

  widthSel.addEventListener('change', () => { width = +widthSel.value; wins.A.c = clampC(wins.A.c); wins.B.c = clampC(wins.B.c); update(); });
  compare.addEventListener('change', () => { wins.B.on = compare.checked; active = compare.checked ? 'B' : 'A'; update(); });
  let timer: number | undefined;
  playBtn.addEventListener('click', () => {
    if (timer) { clearInterval(timer); timer = undefined; playBtn.textContent = '▶ Пустить время'; return; }
    playBtn.textContent = '⏸ Остановить';
    timer = window.setInterval(() => {
      const w = wins[active];
      const step = w.c < -3500 ? 500 : w.c < 0 ? Math.max(25, width / 4) : 50;
      w.c = clampC(w.c + step);
      if (w.c >= MAX - width / 2) { clearInterval(timer); timer = undefined; playBtn.textContent = '▶ Пустить время'; }
      update();
    }, 600);
  });
  new ResizeObserver(() => drawTimeline()).observe(svg.parentElement!);
  update();
  initGlobe();
}

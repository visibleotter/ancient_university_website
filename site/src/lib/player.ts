// Проигрыватель чертежей: рисует Scene в SVG, листает шаги, даёт двигать точки.
import { Scene, angleDeg, dist, projectGlider, type El, type Pt, type Text } from './geo';
import { demos } from './demos';

const W = 400, H = 300;
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();

function tr(t: Text, lang: string) { return t[lang] ?? t.en ?? t.ru; }

function draw(s: Scene, cur: number): string {
  const vis = s.els.filter((e) => e.step <= cur && e.geo);
  const cls = (e: El, base: string) => `${base} c-${e.color}${e.step === cur && cur > 0 ? ' new' : ''}${e.dashed ? ' dash' : ''}`;
  const out: string[] = [];
  const layer = (k: string) => vis.filter((e) => e.geo!.kind === k);
  for (const e of layer('poly')) { const g = e.geo as any; out.push(`<polygon class="${cls(e, 'poly')}" points="${g.pts.map((p: Pt) => `${p.x},${p.y}`).join(' ')}"/>`); }
  for (const e of layer('circle')) { const g = e.geo as any; out.push(`<circle class="${cls(e, 'stroke')}" cx="${g.c.x}" cy="${g.c.y}" r="${g.r}"/>`); }
  for (const e of layer('line')) {
    const g = e.geo as any; let a: Pt = g.a, b: Pt = g.b;
    const d = { x: b.x - a.x, y: b.y - a.y }, k = 2000 / Math.hypot(d.x, d.y);
    if (g.ext === 'line') { a = { x: a.x - d.x * k, y: a.y - d.y * k }; b = { x: b.x + d.x * k, y: b.y + d.y * k }; }
    if (g.ext === 'ray') b = { x: b.x + d.x * k, y: b.y + d.y * k };
    out.push(`<line class="${cls(e, 'stroke' + (g.ext === 'segment' ? ' seg' : ''))}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`);
    if (e.label && g.ext === 'segment') {
      const m = { x: (g.a.x + g.b.x) / 2, y: (g.a.y + g.b.y) / 2 }, n = { x: -(g.b.y - g.a.y), y: g.b.x - g.a.x }, nl = Math.hypot(n.x, n.y) || 1;
      out.push(`<text class="lbl c-${e.color}" x="${m.x + (n.x / nl) * 12}" y="${m.y + (n.y / nl) * 12 + 4}">${f1(dist(g.a, g.b) / 20)}</text>`);
    }
  }
  for (const e of layer('angle')) {
    const g = e.geo as any, r = 22;
    const u = { x: g.a.x - g.o.x, y: g.a.y - g.o.y }, v = { x: g.b.x - g.o.x, y: g.b.y - g.o.y };
    const lu = Math.hypot(u.x, u.y), lv = Math.hypot(v.x, v.y);
    if (lu < 1e-6 || lv < 1e-6) continue;
    const ua = { x: (u.x / lu) * r, y: (u.y / lu) * r }, va = { x: (v.x / lv) * r, y: (v.y / lv) * r };
    const deg = angleDeg(g.a, g.o, g.b);
    const sweep = u.x * v.y - u.y * v.x > 0 ? 1 : 0;
    if (Math.abs(deg - 90) < 0.6) {
      const q = 0.6;
      out.push(`<path class="${cls(e, 'ang')}" d="M${g.o.x + ua.x * q},${g.o.y + ua.y * q} L${g.o.x + (ua.x + va.x) * q},${g.o.y + (ua.y + va.y) * q} L${g.o.x + va.x * q},${g.o.y + va.y * q}"/>`);
    } else {
      out.push(`<path class="${cls(e, 'ang fill')}" d="M${g.o.x},${g.o.y} L${g.o.x + ua.x},${g.o.y + ua.y} A${r},${r} 0 0 ${sweep} ${g.o.x + va.x},${g.o.y + va.y} Z"/>`);
    }
    if (e.label) {
      const bis = { x: u.x / lu + v.x / lv, y: u.y / lu + v.y / lv }, lb = Math.hypot(bis.x, bis.y) || 1;
      out.push(`<text class="lbl c-${e.color}" x="${g.o.x + (bis.x / lb) * (r + 16)}" y="${g.o.y + (bis.y / lb) * (r + 16) + 4}">${Math.round(deg)}°</text>`);
    }
  }
  for (const e of layer('point')) {
    const p = (e.geo as any).p as Pt;
    const handle = e.drag ? ' handle' : '';
    out.push(`<circle class="${cls(e, 'pt' + handle)}" data-id="${e.id}" cx="${p.x}" cy="${p.y}" r="${e.drag ? 5.5 : 3.5}"/>`);
    if (e.drag) out.push(`<circle class="hit" data-id="${e.id}" cx="${p.x}" cy="${p.y}" r="16"/>`);
    if (e.name) out.push(`<text class="name" x="${p.x + 8}" y="${p.y - 8}">${e.name}</text>`);
  }
  return out.join('');
}

export function mount(el: HTMLElement) {
  if (el.dataset.mounted) return;
  const id = el.dataset.demo!, lang = el.dataset.locale ?? 'ru';
  const L = JSON.parse(el.dataset.labels ?? '{}');
  const build = demos[id];
  if (!build) { el.textContent = `Нет чертежа «${id}»`; return; }
  el.dataset.mounted = '1';

  const make = () => { const s = new Scene(); build(s); s.recompute(); return s; };
  let s = make();
  let cur = 0;

  el.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img"></svg>
    <figcaption>
      <p class="cap" aria-live="polite"></p>
      <div class="ctl">
        <button data-a="prev">◀ ${L.prev ?? ''}</button>
        <button data-a="next">${L.next ?? ''} ▶</button>
        <button data-a="all">${L.showAll ?? ''}</button>
        <button data-a="reset">${L.reset ?? ''}</button>
        <span class="hint">${L.drag ?? ''}</span>
      </div>
    </figcaption>`;
  const svg = el.querySelector('svg')!, cap = el.querySelector('.cap')!;
  const last = () => s.steps.length - 1;

  const render = () => {
    svg.innerHTML = draw(s, cur);
    cap.innerHTML = `<b>${L.step ?? ''} ${cur + 1} / ${s.steps.length}.</b> ${tr(s.steps[cur], lang)}`;
    (el.querySelector('[data-a=prev]') as HTMLButtonElement).disabled = cur === 0;
    (el.querySelector('[data-a=next]') as HTMLButtonElement).disabled = cur === last();
  };

  el.querySelector('.ctl')!.addEventListener('click', (ev) => {
    const a = (ev.target as HTMLElement).closest('button')?.dataset.a;
    if (a === 'prev') cur = Math.max(0, cur - 1);
    if (a === 'next') cur = Math.min(last(), cur + 1);
    if (a === 'all') cur = last();
    if (a === 'reset') { s = make(); cur = 0; }
    render();
  });

  // Перетаскивание точек.
  let dragged: El | null = null;
  const toSvg = (ev: PointerEvent): Pt => {
    const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const m = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: Math.max(8, Math.min(W - 8, m.x)), y: Math.max(8, Math.min(H - 8, m.y)) };
  };
  svg.addEventListener('pointerdown', (ev) => {
    const t = (ev.target as Element).closest('[data-id]') as SVGElement | null;
    if (!t) return;
    const e = s.els.find((x) => x.id === Number(t.dataset.id));
    if (!e?.drag) return;
    dragged = e; svg.setPointerCapture(ev.pointerId); ev.preventDefault();
  });
  svg.addEventListener('pointermove', (ev) => {
    if (!dragged) return;
    const m = toSvg(ev);
    if (dragged.drag === 'free') dragged.pos = m; else projectGlider(dragged, m);
    s.recompute(); render();
  });
  const stop = () => { dragged = null; };
  svg.addEventListener('pointerup', stop);
  svg.addEventListener('pointercancel', stop);

  render();
}

export function mountAll() {
  document.querySelectorAll<HTMLElement>('[data-demo]').forEach(mount);
}

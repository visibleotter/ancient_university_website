// Мини-движок «циркуль и линейка» для интерактивных чертежей.
// Чертёж описывается как последовательность шагов; на каждом шаге добавляются элементы,
// которые вычисляются из предыдущих. Свободные точки (и точки на окружности) можно двигать —
// весь чертёж пересчитывается, и видно, что построение работает для любых данных.

export type Pt = { x: number; y: number };
export type Text = { ru: string; en?: string; [k: string]: string | undefined };
export type Color = 'red' | 'yellow' | 'blue' | 'black' | 'grey';

type Geo =
  | { kind: 'point'; p: Pt }
  | { kind: 'circle'; c: Pt; r: number }
  | { kind: 'line'; a: Pt; b: Pt; ext: 'line' | 'segment' | 'ray' }
  | { kind: 'angle'; a: Pt; o: Pt; b: Pt }
  | { kind: 'poly'; pts: Pt[] };

export interface El {
  id: number;
  name?: string;
  step: number;
  color: Color;
  dashed?: boolean;
  label?: boolean;          // показать величину угла / длину
  calc: () => Geo | null;
  geo: Geo | null;
  drag?: 'free' | 'glider';
  pos?: Pt;                  // для свободной точки
  on?: El;                   // для точки на окружности/прямой
  t?: number;                // параметр положения на окружности/прямой
}

const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
const mul = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k });
const cross = (a: Pt, b: Pt) => a.x * b.y - a.y * b.x;
const dot = (a: Pt, b: Pt) => a.x * b.x + a.y * b.y;
export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

export class Scene {
  els: El[] = [];
  steps: Text[] = [];
  private nextId = 0;

  /** Начать новый шаг: всё, что добавлено дальше, появляется на этом шаге. */
  step(text: Text) { this.steps.push(text); return this; }
  private get cur() { return Math.max(0, this.steps.length - 1); }

  private add(el: Omit<El, 'id' | 'step' | 'geo'> & Partial<Pick<El, 'step'>>): El {
    const e = { ...el, id: this.nextId++, step: el.step ?? this.cur, geo: null } as El;
    this.els.push(e);
    return e;
  }

  // ---------- точки ----------
  free(name: string, x: number, y: number, color: Color = 'black'): El {
    const e = this.add({ name, color, drag: 'free', pos: { x, y }, calc: () => ({ kind: 'point', p: e.pos! }) });
    return e;
  }
  /** Точка, которая ездит по окружности или прямой (t — угол в градусах или доля отрезка). */
  glider(name: string, on: El, t: number, color: Color = 'black'): El {
    const e: El = this.add({
      name, color, drag: 'glider', on, t,
      calc: () => {
        const g = on.geo;
        if (!g) return null;
        if (g.kind === 'circle') { const a = (e.t! * Math.PI) / 180; return { kind: 'point', p: { x: g.c.x + g.r * Math.cos(a), y: g.c.y - g.r * Math.sin(a) } }; }
        if (g.kind === 'line') return { kind: 'point', p: add(g.a, mul(sub(g.b, g.a), e.t!)) };
        return null;
      },
    });
    return e;
  }
  /** Пересечение двух окружностей. which: 0 — слева от направления c1→c2, 1 — справа. */
  cc(c1: El, c2: El, which: 0 | 1, name?: string, color: Color = 'black'): El {
    return this.add({
      name, color,
      calc: () => {
        const g1 = c1.geo, g2 = c2.geo;
        if (g1?.kind !== 'circle' || g2?.kind !== 'circle') return null;
        const d = dist(g1.c, g2.c);
        if (d < 1e-9 || d > g1.r + g2.r || d < Math.abs(g1.r - g2.r)) return null;
        const a = (g1.r ** 2 - g2.r ** 2 + d * d) / (2 * d);
        const h = Math.sqrt(Math.max(0, g1.r ** 2 - a * a));
        const u = mul(sub(g2.c, g1.c), 1 / d);
        const m = add(g1.c, mul(u, a));
        const n = { x: u.y, y: -u.x }; // «слева» на экране (ось y вниз)
        return { kind: 'point', p: add(m, mul(n, which === 0 ? h : -h)) };
      },
    });
  }
  /** Пересечение двух окружностей: та из двух точек, что дальше от ref ('far') или ближе ('near'). */
  ccPick(c1: El, c2: El, ref: El, mode: 'far' | 'near', name?: string, color: Color = 'black'): El {
    const a = this.cc(c1, c2, 0), b = this.cc(c1, c2, 1);
    this.hide(a); this.hide(b);
    return this.add({
      name, color,
      calc: () => {
        const pa = P(a), pb = P(b), r = P(ref);
        if (!pa || !pb || !r) return pa ? { kind: 'point', p: pa } : null;
        const far = dist(pa, r) > dist(pb, r);
        return { kind: 'point', p: (far === (mode === 'far')) ? pa : pb };
      },
    });
  }
  /** Неподвижная точка (не двигается мышью). */
  fixed(name: string | undefined, x: number, y: number, color: Color = 'black'): El {
    return this.add({ name, color, calc: () => ({ kind: 'point', p: { x, y } }) });
  }
  /** Точка, вычисляемая произвольной формулой (для того, что не строится, а только показывается). */
  pt(name: string | undefined, deps: El[], f: (...p: Pt[]) => Pt | null, color: Color = 'black'): El {
    return this.add({ name, color, calc: () => { const ps = deps.map(P); if (!ps.every(Boolean)) return null; const r = f(...(ps as Pt[])); return r ? { kind: 'point', p: r } : null; } });
  }
  /** Прямая через точку p, параллельная прямой l (готовым инструментом, без построения). */
  parallel(l: El, p: El, color: Color = 'grey', dashed = false): El {
    const q = this.pt(undefined, [p], (pp) => { const g = l.geo; return g?.kind === 'line' ? add(pp, sub(g.b, g.a)) : null; });
    this.hide(q);
    return this.line(p, q, color, 'line', dashed);
  }
  /** Скрыть вспомогательный элемент (он вычисляется, но не рисуется). */
  hide<T extends El>(e: T): T { e.step = Infinity; return e; }
  /** Показать элемент начиная с шага n (по умолчанию — с текущего). */
  at<T extends El>(n: number, e: T): T { e.step = n; return e; }

  /** Пересечение двух прямых. */
  ll(l1: El, l2: El, name?: string, color: Color = 'black'): El {
    return this.add({
      name, color,
      calc: () => {
        const g1 = l1.geo, g2 = l2.geo;
        if (g1?.kind !== 'line' || g2?.kind !== 'line') return null;
        const r = sub(g1.b, g1.a), s = sub(g2.b, g2.a);
        const den = cross(r, s);
        if (Math.abs(den) < 1e-9) return null;
        const t = cross(sub(g2.a, g1.a), s) / den;
        return { kind: 'point', p: add(g1.a, mul(r, t)) };
      },
    });
  }
  /** Пересечение прямой и окружности. which: 0 — ближе к началу прямой (a), 1 — дальше. */
  lc(l: El, c: El, which: 0 | 1, name?: string, color: Color = 'black'): El {
    return this.add({
      name, color,
      calc: () => {
        const gl = l.geo, gc = c.geo;
        if (gl?.kind !== 'line' || gc?.kind !== 'circle') return null;
        const d = sub(gl.b, gl.a), f = sub(gl.a, gc.c);
        const A = dot(d, d), B = 2 * dot(f, d), C = dot(f, f) - gc.r ** 2;
        const disc = B * B - 4 * A * C;
        if (disc < 0) return null;
        const t = (-B + (which === 0 ? -1 : 1) * Math.sqrt(disc)) / (2 * A);
        return { kind: 'point', p: add(gl.a, mul(d, t)) };
      },
    });
  }

  // ---------- линии ----------
  circle(center: El, through: El, color: Color = 'grey', dashed = false): El {
    return this.add({ color, dashed, calc: () => { const c = P(center), t = P(through); return c && t ? { kind: 'circle', c, r: dist(c, t) } : null; } });
  }
  /** Окружность с центром center и радиусом, равным отрезку p1p2 (циркуль переносит раствор). */
  circleR(center: El, p1: El, p2: El, color: Color = 'grey', dashed = false): El {
    return this.add({ color, dashed, calc: () => { const c = P(center), a = P(p1), b = P(p2); return c && a && b ? { kind: 'circle', c, r: dist(a, b) } : null; } });
  }
  line(a: El, b: El, color: Color = 'grey', ext: 'line' | 'segment' | 'ray' = 'line', dashed = false): El {
    return this.add({ color, dashed, calc: () => { const p = P(a), q = P(b); return p && q && dist(p, q) > 1e-9 ? { kind: 'line', a: p, b: q, ext } : null; } });
  }
  segment(a: El, b: El, color: Color = 'black', label = false): El {
    const e = this.line(a, b, color, 'segment');
    e.label = label;
    return e;
  }
  ray(a: El, b: El, color: Color = 'black'): El { return this.line(a, b, color, 'ray'); }
  angle(a: El, o: El, b: El, color: Color = 'red', label = true): El {
    return this.add({ color, label, calc: () => { const p = P(a), q = P(o), r = P(b); return p && q && r ? { kind: 'angle', a: p, o: q, b: r } : null; } });
  }
  poly(pts: El[], color: Color = 'yellow'): El {
    return this.add({ color, calc: () => { const ps = pts.map(P); return ps.every(Boolean) ? { kind: 'poly', pts: ps as Pt[] } : null; } });
  }

  recompute() { for (const e of this.els) e.geo = e.calc(); }
}

function P(e: El): Pt | null { return e.geo?.kind === 'point' ? e.geo.p : null; }

/** Величина угла AOB в градусах (0..180). */
export function angleDeg(a: Pt, o: Pt, b: Pt) {
  const u = sub(a, o), v = sub(b, o);
  return (Math.acos(Math.max(-1, Math.min(1, dot(u, v) / (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y))))) * 180) / Math.PI;
}

/** Ближайшее положение точки-«бегунка» к курсору. */
export function projectGlider(e: El, m: Pt) {
  const g = e.on?.geo;
  if (!g) return;
  if (g.kind === 'circle') e.t = (Math.atan2(-(m.y - g.c.y), m.x - g.c.x) * 180) / Math.PI;
  if (g.kind === 'line') { const d = sub(g.b, g.a); e.t = Math.max(0.05, Math.min(0.95, dot(sub(m, g.a), d) / dot(d, d))); }
}

// Маршрут как линия: станции по порядку и повороты у станций.
// Налево — «вглубь» (как мы это знаем: источники, памятники, методы, путаницы),
// направо — «вширь» (соседи, сравнения, споры, другие маршруты).
import { all, one, linksOf, type Localized } from './content';
import type { Locale } from '../i18n/ui';

export type Side = 'left' | 'right';
export interface Station {
  card: Localized<'cards'>;
  index: number;      // с 0
  total: number;
  section: string;
  sectionIndex: number;
  firstInSection: boolean;
}
export interface Turn {
  side: Side;
  kind: 'card' | 'path';
  id: string;
  title: string;
  summary?: string;
  label?: string;     // вид связи или ручная подпись
  note?: string;
}

const LINK_LABEL: Record<string, string> = {
  history: 'историческая связь', meaning: 'смысловая связь', comparative: 'сравнение', source: 'откуда мы знаем', dispute: 'спор',
};

export async function stations(locale: Locale, pathId: string): Promise<Station[]> {
  const p = await one('paths', locale, pathId);
  const cards = await all('cards', locale);
  const out: Station[] = [];
  p.entry.data.sections.forEach((s, si) =>
    s.cards.forEach((id, j) => {
      const c = cards.get(id);
      if (!c) throw new Error(`Маршрут ${pathId}: нет карточки ${id}`);
      out.push({ card: c, index: out.length, total: 0, section: s.title, sectionIndex: si, firstInSection: j === 0 });
    }),
  );
  for (const s of out) s.total = out.length;
  return out;
}

/** Маршруты, которые начинаются с данной карточки (поворот на такую карточку предлагает весь маршрут). */
export async function pathsStartingAt(locale: Locale, cardId: string) {
  const paths = [...(await all('paths', locale)).values()];
  return paths.filter((p) => p.entry.data.sections[0]?.cards[0] === cardId);
}

function autoSide(kind: string, target: Localized<'cards'>): Side {
  const d = target.entry.data;
  if (kind === 'source' || d.area === 'method' || d.area === 'monuments' || d.type === 'mixup') return 'left';
  return 'right';
}

export async function turnsAt(locale: Locale, pathId: string, cardId: string): Promise<{ left: Turn[]; right: Turn[] }> {
  const p = await one('paths', locale, pathId);
  const onLine = new Set(p.entry.data.sections.flatMap((s) => s.cards));
  const cards = await all('cards', locale);
  const paths = await all('paths', locale);
  const turns: Turn[] = [];
  const seen = new Set<string>();
  const add = (t: Turn) => { const k = `${t.kind}:${t.id}`; if (!seen.has(k)) { seen.add(k); turns.push(t); } };
  const asPathOrCard = async (id: string, side: Side, label?: string, note?: string) => {
    const startPaths = (await pathsStartingAt(locale, id)).filter((x) => x.id !== pathId);
    if (paths.has(id) || startPaths.length) {
      const pp = paths.get(id) ?? startPaths[0];
      if (pp.id === pathId) return;
      add({ side, kind: 'path', id: pp.id, title: pp.entry.data.title, summary: pp.entry.data.summary, label: label ?? 'маршрут', note });
      return;
    }
    const c = cards.get(id);
    if (!c) throw new Error(`Маршрут ${pathId}: поворот у ${cardId} ведёт на несуществующее ${id}`);
    add({ side, kind: 'card', id, title: c.entry.data.title, summary: c.entry.data.summary, label, note });
  };
  // 1. Вручную — из файла маршрута (идут первыми и побеждают автоматические).
  for (const t of p.entry.data.turns.filter((t) => t.at === cardId)) {
    const target = cards.get(t.to);
    const side = t.side ?? (target ? autoSide('meaning', target) : 'right');
    await asPathOrCard(t.to, side, t.label);
  }
  // 2. Автоматически — из связей карточки (в обе стороны), кроме станций этого же маршрута.
  for (const l of await linksOf(locale, cardId)) {
    if (onLine.has(l.to)) continue;
    await asPathOrCard(l.to, autoSide(l.kind, l.card!), LINK_LABEL[l.kind], l.note);
  }
  // 3. Скрыть лишнее.
  const hidden = new Set(p.entry.data.hide.filter((h) => h.at === cardId).map((h) => h.to));
  const shown = turns.filter((t) => !hidden.has(t.id));
  return { left: shown.filter((t) => t.side === 'left'), right: shown.filter((t) => t.side === 'right') };
}

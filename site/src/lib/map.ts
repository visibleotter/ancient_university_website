// Данные для карты и шкалы времени: миры (годы, центры, главные места), карточки с годами/местом, дуги связей между мирами.
import { all, worldList } from './content';
import { href, type Locale } from '../i18n/ui';

export type When = { from: number; to?: number; approx: boolean };
export type MapWorld = {
  id: string; title: string; status: string; href: string; when?: When;
  center?: { lat: number; lon: number };
  places: { name: string; lat: number; lon: number; pleiades?: string; when?: When }[];
};
export type MapItem = {
  id: string; title: string; world: string | null; area: string; type: string; era?: string;
  reliability?: string; when?: When; place?: { name?: string; lat: number; lon: number; pleiades?: string }; href: string;
};
/** Год для людей: −585 → «585 до н. э.», −1 840 000 → «1,84 млн лет назад». */
export const year = (y: number) =>
  y <= -1000000 ? `${(Math.round(-y / 10000) / 100).toLocaleString('ru')} млн лет назад` : y <= -20000 ? `${Math.round(-y / 1000)} тыс. лет назад` : y < 0 ? `${Math.round(-y)} до н. э.` : `${Math.round(y)}`;
export const span = (w?: When) => (w ? `${w.approx ? '≈ ' : ''}${year(w.from)}${w.to !== undefined ? ' — ' + year(w.to) : ''}` : '');

export type MapArc = { from: string; to: string; kind: string; note?: string };

export async function mapData(locale: Locale) {
  const worlds: MapWorld[] = (await worldList(locale)).map((w) => {
    const d = w.entry.data;
    return { id: w.id, title: d.title, status: d.status, href: href(locale, w.id), when: d.when, center: d.center, places: d.places };
  });
  const cards = await all('cards', locale);
  const items: MapItem[] = [];
  for (const c of cards.values()) {
    const d = c.entry.data;
    if (!d.when && !d.place) continue;
    items.push({
      id: c.id, title: d.title, world: d.world ?? null, area: d.area, type: d.type, era: d.era,
      reliability: d.reliability, when: d.when, place: d.place, href: href(locale, `c/${c.id}`),
    });
  }
  // Дуги: связи между карточками разных миров, у которых обеих есть место (каждая пара — один раз).
  const placed = new Map(items.filter((i) => i.place).map((i) => [i.id, i]));
  const arcs: MapArc[] = [];
  const seen = new Set<string>();
  for (const a of placed.values())
    for (const l of cards.get(a.id)!.entry.data.links) {
      const b = placed.get(l.to);
      if (!b || !a.world || !b.world || a.world === b.world) continue;
      const key = [a.id, b.id].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      arcs.push({ from: a.id, to: b.id, kind: l.kind, note: l.note });
    }
  return { worlds, items, arcs };
}

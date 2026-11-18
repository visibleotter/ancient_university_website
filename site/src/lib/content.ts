// Доступ к контенту с учётом языка: берём перевод, если он есть, иначе русский оригинал.
import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale, type Locale } from '../i18n/ui';

type Coll = 'cards' | 'quotes' | 'paths' | 'worlds' | 'art';
export type Localized<C extends Coll> = { id: string; entry: CollectionEntry<C>; fallback: boolean };

/** Id записи без языковой папки: «ru/thales» → «thales». */
export const baseId = (id: string) => id.slice(id.indexOf('/') + 1);
const langOf = (id: string) => id.slice(0, id.indexOf('/'));

const cache = new Map<string, Map<string, any>>();

export async function all<C extends Coll>(coll: C, locale: Locale): Promise<Map<string, Localized<C>>> {
  const key = `${coll}:${locale}`;
  if (cache.has(key)) return cache.get(key)!;
  const entries = (await getCollection(coll)) as CollectionEntry<C>[];
  const out = new Map<string, Localized<C>>();
  for (const e of entries) if (langOf(e.id) === defaultLocale) out.set(baseId(e.id), { id: baseId(e.id), entry: e, fallback: locale !== defaultLocale });
  if (locale !== defaultLocale)
    for (const e of entries) if (langOf(e.id) === locale) out.set(baseId(e.id), { id: baseId(e.id), entry: e, fallback: false });
  cache.set(key, out);
  return out;
}

export async function one<C extends Coll>(coll: C, locale: Locale, id: string) {
  const m = await all(coll, locale);
  const r = m.get(id);
  if (!r) throw new Error(`Нет записи ${coll}/${id} — проверьте ссылку`);
  return r;
}

/** Все id (по русскому оригиналу) — для getStaticPaths. */
export async function ids(coll: Coll) {
  return [...(await all(coll, defaultLocale)).keys()];
}

/** Где упоминается карточка: маршруты и другие карточки, ссылающиеся на неё. */
export async function backlinks(locale: Locale, id: string) {
  const paths = [...(await all('paths', locale)).values()].filter((p) => p.entry.data.sections.some((s) => s.cards.includes(id)));
  const cards = [...(await all('cards', locale)).values()].filter((c) => c.id !== id && c.entry.data.related.includes(id));
  return { paths, cards };
}

/** Связи карточки в обе стороны: свои links + чужие links, указывающие на неё. */
export async function linksOf(locale: Locale, id: string) {
  const cards = await all('cards', locale);
  const me = cards.get(id)!;
  const out = me.entry.data.links.map((l) => ({ ...l, card: cards.get(l.to), dir: 'out' as const }));
  for (const c of cards.values())
    for (const l of c.entry.data.links) if (l.to === id) out.push({ ...l, to: c.id, card: c, dir: 'in' as const });
  for (const l of out) if (!l.card) throw new Error(`Карточка ${id}: связь ведёт на несуществующую карточку ${l.to}`);
  return out;
}

/** Миры по порядку. */
export async function worldList(locale: Locale) {
  return [...(await all('worlds', locale)).values()].sort((a, b) => a.entry.data.order - b.entry.data.order);
}

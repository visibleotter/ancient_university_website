// Модель контента раздела «Математика греков».
// Всё лежит по языкам: src/content/<коллекция>/<язык>/<id>.md.
// Русский — основной; если перевода нет, показываем русский оригинал с пометкой.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const AGES = ['6-7', '8-10', '11-15'] as const;
export const CARD_TYPES = [
  'story',        // рассказ / вход в тему
  'person',       // человек
  'concept',      // понятие (точка, угол…)
  'theorem',      // теорема / предложение
  'construction', // задача на построение
  'experiment',   // опыт руками
  'myth',         // популярное утверждение, которое источники не подтверждают
  'lesson',       // занятие курса
] as const;

/** Карточка — одна страница сайта, самая мелкая единица контента. */
const cards = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cards' }),
  schema: z.object({
    type: z.enum(CARD_TYPES),
    title: z.string(),
    summary: z.string(),
    ages: z.array(z.enum(AGES)).default([]),
    themes: z.array(z.string()).default([]),
    people: z.array(z.string()).default([]),       // id карточек-людей
    era: z.string().optional(),                    // «VI в. до н. э.»
    reliability: z.enum(['fact', 'legend', 'disputed']).optional(), // ✅ 📜 ❓
    greek: z.string().optional(),                  // термин по-гречески
    euclid: z.string().optional(),                 // «I.15»
    quotes: z.array(z.string()).default([]),       // id цитат
    demo: z.string().optional(),                   // id интерактивного чертежа
    related: z.array(z.string()).default([]),      // id других карточек
    // Только для построений: где эта задача встречается в школьных программах.
    curricula: z.array(z.object({ src: z.string(), ref: z.string() })).default([]),
    level: z.number().default(1),                  // порядок внутри возраста
    extra: z.boolean().default(false),             // для кружка / «со звёздочкой»
  }),
});

/** Цитата из источника. Тело файла — перевод. */
const quotes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/quotes' }),
  schema: z.object({
    author: z.string(),
    work: z.string(),
    locus: z.string(),
    greek: z.string().optional(),
    greekVerified: z.boolean().default(false),
    eudemus: z.enum(['named', 'probable', 'no']).optional(), // назван ли Евдем
    note: z.string().optional(),
  }),
});

/** Маршрут — упорядоченная цепочка карточек с разделами («Фалес и начала геометрии»). */
const paths = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/paths' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    ages: z.array(z.enum(AGES)).default([]),
    sections: z.array(z.object({ title: z.string(), text: z.string().optional(), cards: z.array(z.string()) })),
  }),
});

export const collections = { cards, quotes, paths };

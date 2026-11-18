// Модель контента сайта. Устройство: миры-цивилизации («облака знаний») → области → карточки;
// маршруты ведут по карточкам; связи между карточками типизированы (links) — для будущей карты связей.
// Всё лежит по языкам: src/content/<коллекция>/<язык>/<id>.md. Пока сайт только на русском.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const AGES = ['6-7', '8-10', '11-15'] as const;
/** Области внутри мира и сквозные линии (method, monuments идут через все миры). */
export const AREAS = ['science', 'religion', 'culture', 'history', 'method', 'monuments'] as const;
/** Виды связей между карточками. */
export const LINK_KINDS = [
  'history',     // историческая: заимствование, влияние, контакт
  'meaning',     // смысловая: та же идея, тот же вопрос
  'comparative', // компаративистская: сходный миф, обряд, образ в разных религиях
  'source',      // откуда мы это знаем: памятник, находка, метод
  'dispute',     // спор: один отвечает другому, возражает
] as const;
export const CARD_TYPES = [
  'story',        // рассказ / вход в тему
  'person',       // человек
  'concept',      // понятие (точка, угол…)
  'theorem',      // теорема / предложение
  'construction', // задача на построение
  'experiment',   // опыт руками
  'mixup',        // популярное утверждение или путаница, которую источники не подтверждают
  'lesson',       // занятие курса
  'idea',         // философская идея, учение
  'myth',         // сюжет мифа
  'figure',       // бог, титан, чудовище — персонаж мифа
  'text',         // памятник письменности: поэма, сборник, надпись
  'place',        // место: город, святилище, раскоп
  'event',        // историческое событие
  'method',       // как мы это знаем: метод датировки, раскопки, анализ
] as const;
export const ART_KINDS = ['vase', 'sculpture', 'relief', 'mosaic', 'fresco', 'painting', 'object', 'photo', 'diagram', 'map'] as const;

/** Время для карты и шкалы: годы числом, до н. э. — отрицательные (−585). Строка era остаётся для людей. */
const when = z.object({
  from: z.number(),
  to: z.number().optional(),                     // нет — точка во времени
  approx: z.boolean().default(false),            // «около»: на шкале рисуется размыто
});
/** Место на карте; pleiades — id в газеттере Pleiades (откуда взяты координаты), см. tools/map/pleiades.py. */
const place = z.object({
  name: z.string().optional(),
  lat: z.number(),
  lon: z.number(),
  pleiades: z.string().optional(),
});

/** Мир-цивилизация — «облако знаний». */
const worlds = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/worlds' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    era: z.string(),                               // «III тыс. до н. э. — I в. до н. э.»
    order: z.number(),                             // порядок на главной (примерно хронологический)
    status: z.enum(['active', 'planned']).default('planned'),
    native: z.string().optional(),                 // самоназвание: Ἑλλάς, Kemet…
    when: when.optional(),                         // годы мира на шкале времени
    center: z.object({ lat: z.number(), lon: z.number() }).optional(), // куда смотрит глобус
    places: z.array(place.extend({ name: z.string(), when: when.optional() })).default([]), // главные города и центры
  }),
});

/** Карточка — одна страница сайта, самая мелкая единица контента. */
const cards = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cards' }),
  schema: z.object({
    type: z.enum(CARD_TYPES),
    world: z.string().optional(),                  // id мира; нет — общая карточка (например, метод датировки)
    area: z.enum(AREAS),
    subject: z.string().optional(),                // тема внутри области: math, philosophy, mythology…
    title: z.string(),
    summary: z.string(),
    ages: z.array(z.enum(AGES)).default([]),
    themes: z.array(z.string()).default([]),
    people: z.array(z.string()).default([]),       // id карточек-людей
    era: z.string().optional(),                    // «VI в. до н. э.»
    when: when.optional(),                         // годы числом — для шкалы времени и карты
    place: place.optional(),                       // где: город, святилище; для людей — где жил и работал
    reliability: z.enum(['fact', 'legend', 'disputed']).optional(), // ✅ 📜 ❓
    greek: z.string().optional(),                  // термин по-гречески
    euclid: z.string().optional(),                 // «I.15»
    quotes: z.array(z.string()).default([]),       // id цитат
    demo: z.string().optional(),                   // id интерактивного чертежа
    related: z.array(z.string()).default([]),      // id других карточек
    links: z.array(z.object({ to: z.string(), kind: z.enum(LINK_KINDS), note: z.string().optional() })).default([]),
    figs: z.array(z.number()).default([]),         // номера рисунков атласа (tools/atlas, «Рис. N»)
    art: z.array(z.string()).default([]),          // id произведений искусства (коллекция art)
    // Только для внутреннего учёта (на сайте не показывается): где задача встречается в школьных программах.
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

/** Изображение к сюжету: произведение искусства (античность / позднее) или научное изображение (снимок, схема, карта неба).
 *  Тело файла — что рассматривать. */
const art = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/art' }),
  schema: z.object({
    title: z.string(),
    artist: z.string().optional(),                 // «Гойя»; для античных — мастер/вазописец, если известен
    date: z.string(),                              // «1819–1823», «ок. 460 до н. э.»
    period: z.enum(['ancient', 'later', 'science']), // античность / Европа и Россия / научное изображение
    kind: z.enum(ART_KINDS),
    museum: z.string(),                            // «Прадо, Мадрид»
    inv: z.string().optional(),                    // инвентарный номер
    url: z.string().url().optional(),              // страница музея или статья
    commons: z.string().optional(),                // имя файла на Wikimedia Commons (без «File:»)
    image: z.string().url().optional(),            // прямая ссылка на картинку, если её нет на Commons (ESA, NASA)
    credit: z.string().optional(),                 // автор снимка / «общественное достояние»
    license: z.string().optional(),                // лицензия снимка по Commons
    caution: z.boolean().default(false),           // ⚠ стоит посмотреть заранее, прежде чем показывать детям
    reliability: z.enum(['fact', 'legend', 'disputed']).optional(), // ❓ — атрибуция или датировка спорны
  }),
});

/** Маршрут — упорядоченная цепочка карточек с разделами («Фалес и начала геометрии»). */
const paths = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/paths' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    world: z.string().optional(),
    area: z.enum(AREAS),
    ages: z.array(z.enum(AGES)).default([]),
    // Станции основной линии по порядку.
    sections: z.array(z.object({ title: z.string(), text: z.string().optional(), cards: z.array(z.string()) })),
    // Повороты у станций: автоматически собираются из links (src/lib/route.ts); здесь — ручные добавления и скрытия.
    // to — id карточки или маршрута; side: left — «вглубь» (как мы знаем), right — «вширь» (соседи, сравнения, другие маршруты).
    turns: z.array(z.object({ at: z.string(), to: z.string(), side: z.enum(['left', 'right']).optional(), label: z.string().optional() })).default([]),
    hide: z.array(z.object({ at: z.string(), to: z.string() })).default([]),
  }),
});

export const collections = { worlds, cards, quotes, paths, art };

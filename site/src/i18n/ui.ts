// Языки сайта и строки интерфейса. Русский — основной (без префикса в адресе).
// Пока сайт делается только на русском (решение Вадима, 17.11.2026). Чтобы вернуть языки,
// добавьте их в `locales`; строки en/fr/es/it ниже сохранены, но новые ключи есть только в ru.
export const allLocales = ['ru', 'en', 'fr', 'es', 'it'] as const;
export const locales = ['ru'] as const satisfies readonly (typeof allLocales)[number][];
export type Locale = (typeof allLocales)[number];
export const defaultLocale: Locale = 'ru';

export const localeNames: Record<Locale, string> = {
  ru: 'Русский', en: 'English', fr: 'Français', es: 'Español', it: 'Italiano',
};

export const ui = {
  ru: { site: 'Древний университет', math: 'Математика греков', myths: 'Мифы', philosophers: 'Философы', soon: 'скоро', home: 'Главная',
    worlds: 'Миры древности', lines: 'Сквозные линии', allCards: 'Все карточки', atlas: 'Атлас чертежей', map: 'Карта и время', art: 'Искусство и изображения', draft: 'Черновой каркас: дизайн будет позже', untranslated: 'Перевода пока нет — показан русский оригинал.' },
  en: { site: 'Ancient University', math: 'Greek Mathematics', myths: 'Myths', philosophers: 'Philosophers', soon: 'soon', home: 'Home', draft: 'Draft skeleton: design comes later', untranslated: 'This section is not translated yet; the Russian original is shown.' },
  fr: { site: 'Université antique', math: 'Mathématiques grecques', myths: 'Mythes', philosophers: 'Philosophes', soon: 'bientôt', home: 'Accueil', draft: 'Squelette provisoire : le design viendra plus tard', untranslated: "Cette section n'est pas encore traduite ; l'original russe est affiché." },
  es: { site: 'Universidad antigua', math: 'Matemáticas griegas', myths: 'Mitos', philosophers: 'Filósofos', soon: 'pronto', home: 'Inicio', draft: 'Esqueleto provisional: el diseño vendrá después', untranslated: 'Esta sección aún no está traducida; se muestra el original ruso.' },
  it: { site: 'Università antica', math: 'Matematica greca', myths: 'Miti', philosophers: 'Filosofi', soon: 'presto', home: 'Home', draft: 'Scheletro provvisorio: il design arriverà dopo', untranslated: "Questa sezione non è ancora tradotta; è mostrato l'originale russo." },
} as const;

/** Строки раздела «Математика». Ключи типов и возрастов совпадают с content.config.ts. */
export const mt = {
  ru: {
    start: 'С чего начать', pathThales: 'Маршрут: Фалес и начала геометрии', constructions: 'Построения циркулем и линейкой', allCards: 'Все карточки',
    constructionsIntro: 'Задачи на построение — от первых опытов с верёвкой и сгибанием бумаги до Евклида, разложенные по возрасту.',
    paths: 'Маршруты', cards: 'Карточки', connections: 'Связи',
    route: { deeper: '↙ Вглубь', deeperHint: 'как мы это знаем', wider: 'Вширь ↘', widerHint: 'соседи, сравнения, другие маршруты', of: 'из', start: 'Начать маршрут →', back: '← Назад', next: 'Дальше →', end: 'Конец маршрута', toOverview: 'Весь маршрут', returnTo: '← Вернуться на маршрут', stepWord: 'шаг', pathTurn: 'маршрут', sectionNext: 'Дальше — раздел', openCard: 'карточка отдельно' }, planned: 'в работе', world: 'Мир', area: 'Область', subject: 'Тема',
    areas: { science: 'Наука', religion: 'Религия и мифы', culture: 'Культура и искусство', history: 'История', method: 'Как мы это знаем', monuments: 'Памятники и тексты' },
    areaIntro: {
      science: 'Счёт, геометрия, астрономия, медицина — и первые попытки объяснить мир без богов.',
      religion: 'Боги, мифы, обряды и представления о мире.',
      culture: 'Искусство, ремёсла, письмо, повседневная жизнь.',
      history: 'Цари, войны, города и переселения.',
      method: 'Сквозная линия через все миры: археология, датировки, палеоботаника, антропология — и самые громкие ошибки ранних раскопок.',
      monuments: 'Сквозная линия через все миры: поэмы, священные книги, надписи — как они устроены и что в них сказано.',
    },
    subjects: { math: 'Математика', philosophy: 'Философия', mythology: 'Мифология', astronomy: 'Астрономия', logic: 'Логика', music: 'Музыка' } as Record<string, string>,
    links: { history: 'историческая связь', meaning: 'смысловая связь', comparative: 'сравнение', source: 'источник', dispute: 'спор' },
    figs: 'Чертежи из атласа', fig: 'Рис.', figRead: 'Как читать', figDo: 'Что сделать руками', figLife: 'Где в жизни', atlasIntro: 'Чертежи к «Началам» Евклида и к рассказам Евдема в цветах Оливера Бирна (1847): равные части — одного цвета. Каждый можно повторить циркулем и линейкой.',
    images: 'Изображения', art: 'В искусстве', artAncient: 'Античность', artLater: 'Европа и Россия', artCaution: '⚠ посмотрите заранее, прежде чем показывать детям', photo: 'Снимок', museumPage: 'страница музея',
    artKinds: { vase: 'вазопись', sculpture: 'скульптура', relief: 'рельеф', mosaic: 'мозаика', fresco: 'фреска', painting: 'живопись', object: 'предмет', photo: 'снимок', diagram: 'схема', map: 'карта неба' },
    byAge: 'По возрасту', all: 'Все', step: 'Шаг', prev: 'Назад', next: 'Дальше', showAll: 'Всё сразу', reset: 'Сначала', drag: 'Точки можно двигать',
    quotes: 'Источники', related: 'Связано', usedIn: 'Где встречается', euclid: 'Евклид', curricula: 'Где в школьных программах', era: 'Время',
    greekOk: 'греческий текст сверен', greekNo: 'греческий текст не сверен', eud: { named: 'Евдем назван', probable: 'Евдем вероятен, но не назван', no: '' },
    fallbackCard: 'Перевода пока нет — показан русский оригинал.', interactive: 'Интерактивный чертёж', extra: 'для кружка',
    types: { story: 'Рассказ', person: 'Человек', concept: 'Понятие', theorem: 'Теорема', construction: 'Построение', experiment: 'Опыт', mixup: 'Путаница', lesson: 'Занятие',
      idea: 'Идея', myth: 'Миф', figure: 'Персонаж мифа', text: 'Памятник', place: 'Место', event: 'Событие', method: 'Метод' },
    ages: { '6-7': '👶 6–7 лет', '8-10': '🧒 8–10 лет', '11-15': '🧑 11–15 лет' },
    rel: { fact: '✅ прямо в источнике', legend: '📜 предание, поздний источник', disputed: '❓ спорно' },
  },
  en: {
    start: 'Where to start', pathThales: 'Path: Thales and the beginnings of geometry', constructions: 'Compass-and-straightedge constructions', allCards: 'All cards',
    constructionsIntro: 'Construction problems from school curricula of several countries and from Euclid, sorted by age. Tags show which curriculum includes the problem.',
    byAge: 'By age', all: 'All', step: 'Step', prev: 'Back', next: 'Next', showAll: 'Show all', reset: 'Restart', drag: 'You can drag the points',
    quotes: 'Sources', related: 'Related', usedIn: 'Appears in', euclid: 'Euclid', curricula: 'In school curricula', era: 'Time',
    greekOk: 'Greek text checked', greekNo: 'Greek text not checked', eud: { named: 'Eudemus named', probable: 'Eudemus probable, not named', no: '' },
    fallbackCard: 'No translation yet — the Russian original is shown.', interactive: 'Interactive drawing', extra: 'for math circles',
    types: { story: 'Story', person: 'Person', concept: 'Concept', theorem: 'Theorem', construction: 'Construction', experiment: 'Hands-on', myth: 'Myth or mix-up', lesson: 'Lesson' },
    ages: { '6-7': '👶 ages 6–7', '8-10': '🧒 ages 8–10', '11-15': '🧑 ages 11–15' },
    rel: { fact: '✅ stated in the source', legend: '📜 tradition, late source', disputed: '❓ disputed' },
  },
  fr: {
    start: 'Par où commencer', pathThales: 'Parcours : Thalès et les débuts de la géométrie', constructions: 'Constructions à la règle et au compas', allCards: 'Toutes les fiches',
    constructionsIntro: "Problèmes de construction tirés des programmes scolaires de plusieurs pays et d'Euclide, classés par âge.",
    byAge: 'Par âge', all: 'Tout', step: 'Étape', prev: 'Retour', next: 'Suite', showAll: 'Tout afficher', reset: 'Recommencer', drag: 'On peut déplacer les points',
    quotes: 'Sources', related: 'Voir aussi', usedIn: 'Apparaît dans', euclid: 'Euclide', curricula: 'Dans les programmes', era: 'Époque',
    greekOk: 'texte grec vérifié', greekNo: 'texte grec non vérifié', eud: { named: 'Eudème nommé', probable: 'Eudème probable, non nommé', no: '' },
    fallbackCard: "Pas encore de traduction — l'original russe est affiché.", interactive: 'Figure interactive', extra: 'pour le club de maths',
    types: { story: 'Récit', person: 'Personne', concept: 'Notion', theorem: 'Théorème', construction: 'Construction', experiment: 'Expérience', myth: 'Mythe ou confusion', lesson: 'Séance' },
    ages: { '6-7': '👶 6–7 ans', '8-10': '🧒 8–10 ans', '11-15': '🧑 11–15 ans' },
    rel: { fact: '✅ dans la source', legend: '📜 tradition, source tardive', disputed: '❓ discuté' },
  },
  es: {
    start: 'Por dónde empezar', pathThales: 'Ruta: Tales y los comienzos de la geometría', constructions: 'Construcciones con regla y compás', allCards: 'Todas las fichas',
    constructionsIntro: 'Problemas de construcción de los programas escolares de varios países y de Euclides, ordenados por edad.',
    byAge: 'Por edad', all: 'Todo', step: 'Paso', prev: 'Atrás', next: 'Siguiente', showAll: 'Mostrar todo', reset: 'Empezar de nuevo', drag: 'Puedes mover los puntos',
    quotes: 'Fuentes', related: 'Relacionado', usedIn: 'Aparece en', euclid: 'Euclides', curricula: 'En los programas escolares', era: 'Época',
    greekOk: 'texto griego verificado', greekNo: 'texto griego no verificado', eud: { named: 'Eudemo citado', probable: 'Eudemo probable, no citado', no: '' },
    fallbackCard: 'Aún no hay traducción: se muestra el original ruso.', interactive: 'Dibujo interactivo', extra: 'para el club de matemáticas',
    types: { story: 'Relato', person: 'Persona', concept: 'Concepto', theorem: 'Teorema', construction: 'Construcción', experiment: 'Experimento', myth: 'Mito o confusión', lesson: 'Lección' },
    ages: { '6-7': '👶 6–7 años', '8-10': '🧒 8–10 años', '11-15': '🧑 11–15 años' },
    rel: { fact: '✅ en la fuente', legend: '📜 tradición, fuente tardía', disputed: '❓ discutido' },
  },
  it: {
    start: 'Da dove cominciare', pathThales: 'Percorso: Talete e gli inizi della geometria', constructions: 'Costruzioni con riga e compasso', allCards: 'Tutte le schede',
    constructionsIntro: 'Problemi di costruzione dai programmi scolastici di vari paesi e da Euclide, ordinati per età.',
    byAge: 'Per età', all: 'Tutto', step: 'Passo', prev: 'Indietro', next: 'Avanti', showAll: 'Mostra tutto', reset: 'Ricomincia', drag: 'I punti si possono spostare',
    quotes: 'Fonti', related: 'Collegamenti', usedIn: 'Compare in', euclid: 'Euclide', curricula: 'Nei programmi scolastici', era: 'Epoca',
    greekOk: 'testo greco verificato', greekNo: 'testo greco non verificato', eud: { named: 'Eudemo citato', probable: 'Eudemo probabile, non citato', no: '' },
    fallbackCard: "Traduzione non ancora disponibile: è mostrato l'originale russo.", interactive: 'Disegno interattivo', extra: 'per il club di matematica',
    types: { story: 'Racconto', person: 'Persona', concept: 'Concetto', theorem: 'Teorema', construction: 'Costruzione', experiment: 'Esperimento', myth: 'Mito o equivoco', lesson: 'Lezione' },
    ages: { '6-7': '👶 6–7 anni', '8-10': '🧒 8–10 anni', '11-15': '🧑 11–15 anni' },
    rel: { fact: '✅ nella fonte', legend: '📜 tradizione, fonte tarda', disputed: '❓ discusso' },
  },
} as const;

/** Параметры для страниц вида src/pages/[...locale]/…: undefined = русский (корень). */
export function localePaths() {
  return (locales as readonly Locale[]).map((l) => ({ params: { locale: l === defaultLocale ? undefined : l } }));
}

export function toLocale(param: string | undefined): Locale {
  return (param ?? defaultLocale) as Locale;
}

/** Ссылка внутри сайта с учётом base и языка. */
export function href(locale: Locale, path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  const p = path.replace(/^\/|\/$/g, '');
  return `${base}${prefix}/${p ? p + '/' : ''}`;
}

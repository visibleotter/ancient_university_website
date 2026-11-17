// Языки сайта и строки интерфейса. Русский — основной (без префикса в адресе).
export const locales = ['ru', 'en', 'fr', 'es', 'it'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ru';

export const localeNames: Record<Locale, string> = {
  ru: 'Русский', en: 'English', fr: 'Français', es: 'Español', it: 'Italiano',
};

export const ui = {
  ru: { site: 'Древний университет', math: 'Математика греков', myths: 'Мифы', philosophers: 'Философы', soon: 'скоро', home: 'Главная', draft: 'Черновой каркас: дизайн будет позже', untranslated: '' },
  en: { site: 'Ancient University', math: 'Greek Mathematics', myths: 'Myths', philosophers: 'Philosophers', soon: 'soon', home: 'Home', draft: 'Draft skeleton: design comes later', untranslated: 'This section is not translated yet; the Russian original is shown.' },
  fr: { site: 'Université antique', math: 'Mathématiques grecques', myths: 'Mythes', philosophers: 'Philosophes', soon: 'bientôt', home: 'Accueil', draft: 'Squelette provisoire : le design viendra plus tard', untranslated: "Cette section n'est pas encore traduite ; l'original russe est affiché." },
  es: { site: 'Universidad antigua', math: 'Matemáticas griegas', myths: 'Mitos', philosophers: 'Filósofos', soon: 'pronto', home: 'Inicio', draft: 'Esqueleto provisional: el diseño vendrá después', untranslated: 'Esta sección aún no está traducida; se muestra el original ruso.' },
  it: { site: 'Università antica', math: 'Matematica greca', myths: 'Miti', philosophers: 'Filosofi', soon: 'presto', home: 'Home', draft: 'Scheletro provvisorio: il design arriverà dopo', untranslated: "Questa sezione non è ancora tradotta; è mostrato l'originale russo." },
} as const;

/** Параметры для страниц вида src/pages/[...locale]/…: undefined = русский (корень). */
export function localePaths() {
  return locales.map((l) => ({ params: { locale: l === defaultLocale ? undefined : l } }));
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

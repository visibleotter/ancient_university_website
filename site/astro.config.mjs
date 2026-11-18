// @ts-check
import { defineConfig } from 'astro/config';

// Сайт публикуется на Vercel (настройки сборки — vercel.json в корне репозитория).
// Когда будет постоянный домен, впишите его в `site` — он нужен для канонических ссылок и карты сайта.
export default defineConfig({
  site: 'https://ancient-university.vercel.app',
  trailingSlash: 'always',
  // Языки (ru без префикса; en/fr/es/it с префиксом) делаем сами: src/i18n/ui.ts + src/pages/[...locale]/.
  // Пока включён только русский.
});

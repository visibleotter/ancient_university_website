// @ts-check
import { defineConfig } from 'astro/config';

// Сайт публикуется на GitHub Pages: https://visibleotter.github.io/ancient_university_website/
export default defineConfig({
  site: 'https://visibleotter.github.io',
  base: '/ancient_university_website',
  trailingSlash: 'always',
  // Языки (ru без префикса; en/fr/es/it с префиксом) делаем сами: src/i18n/ui.ts + src/pages/[...locale]/
});

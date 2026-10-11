// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Адрес сайта: подставляется при выкладке (PUBLIC_SITE_URL), нужен для sitemap и canonical.
const site = process.env.PUBLIC_SITE_URL || 'https://example.ru';

export default defineConfig({
  site,
  // Путь сайта на GitHub Pages (/<репозиторий>/) — задаёт workflow; локально корень.
  base: process.env.BASE_PATH || '/',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'auto' },
  image: { responsiveStyles: true },
});

import type { APIRoute } from 'astro';
import { isDemo } from '../data/site';

// Демо закрыто от индексации целиком, чтобы не конкурировать с рабочим сайтом клиента.
export const GET: APIRoute = ({ site }) => {
  const body = isDemo
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

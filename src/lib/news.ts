import { queryOptions } from '@tanstack/react-query';
import sanitizeHtml from 'sanitize-html';

export const API_URL = 'https://aupicinfo.com/wp-json/wp/v2';
export const RADIO_URL = 'https://radio.nitro-server.uk/listen/aupicradio/radio.mp3';
export const PAGE_SIZE = 10;
export const navCategories = [
  { id: 121, slug: 'politique', name: 'Politique' },
  { id: 5, slug: 'environnement', name: 'Environnement' },
  { id: 1491, slug: 'economie', name: 'Economie' },
  { id: 3, slug: 'societe', name: 'Société' },
  { id: 11, slug: 'sante', name: 'Santé' },
  { id: 256, slug: 'sport', name: 'Sport' },
];
export interface Category { id: number; name: string; slug: string; count: number }
export interface Post {
 id: number; slug: string; date: string; link: string;
 title: { rendered: string }; excerpt: { rendered: string }; content?: { rendered: string };
 categories: number[];
 _embedded?: { author?: { name: string }[]; 'wp:featuredmedia'?: { source_url: string; media_details?: { sizes?: Record<string, { source_url: string }> } }[]; 'wp:term'?: Category[][] };
}
const assets = import.meta.glob<{ default: { url: string } }>('../assets/news-*.asset.json', { eager: true });
export function postImage(post: Post, full = false) {
 const local = assets[`../assets/news-${post.id}.jpg.asset.json`]?.default.url;
 const media = post._embedded?.['wp:featuredmedia']?.[0];
 return local || (full ? media?.source_url : media?.media_details?.sizes?.['medium_large']?.source_url || media?.source_url);
}
export function plainText(html: string) {
 return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n))).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'").replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
export function safeContent(html: string) {
 return sanitizeHtml(html, { allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'figure', 'figcaption', 'video', 'source'], allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt', 'width', 'height', 'loading'], video: ['src', 'controls', 'poster'], source: ['src', 'type'] }, allowedSchemes: ['https', 'http', 'mailto'], transformTags: { img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }) } });
}
export function formatDate(date: string) { return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date)); }
export function validPage(value: unknown) { const n = Number(value); return Number.isInteger(n) && n > 0 ? n : 1; }
export function pageNumbers(current: number, total: number): (number | '…')[] {
 const nums = [...new Set([1, current - 1, current, current + 1, total])].filter(n => n >= 1 && n <= total).sort((a,b) => a-b);
 return nums.flatMap((n,i) => i > 0 && n - (nums[i-1] ?? 0) > 1 ? ['…', n] : [n]) as (number | '…')[];
}
async function request(path: string, signal?: AbortSignal) {
 let last: unknown;
 for (let attempt = 0; attempt < 2; attempt++) {
  try { const response = await fetch(`${API_URL}/${path}`, { signal }); if (!response.ok) throw new Error(`HTTP ${response.status}`); return response; }
  catch (error) { last = error; if (signal?.aborted) throw error; }
 }
 throw new Error('Les articles sont temporairement indisponibles. Veuillez réessayer.', { cause: last });
}
export const categoriesQuery = queryOptions({ queryKey: ['categories'], queryFn: async ({ signal }) => (await (await request('categories?per_page=100&_fields=id,name,slug,count', signal)).json()) as Category[], staleTime: 3600000 });
export function postsQuery(page = 1, category?: number, search = '') {
 return queryOptions({ queryKey: ['posts', page, category, search], queryFn: async ({ signal }) => {
  const params = new URLSearchParams({ per_page: String(PAGE_SIZE), page: String(page), _embed: 'wp:featuredmedia,author,wp:term', _fields: 'id,slug,date,link,title,excerpt,categories,_links,_embedded' });
  if (category) params.set('categories', String(category)); if (search) params.set('search', search);
  const response = await request(`posts?${params}`, signal);
  return { posts: await response.json() as Post[], total: Number(response.headers.get('X-WP-Total') || 0), pages: Number(response.headers.get('X-WP-TotalPages') || 1) };
 }, staleTime: 120000, gcTime: 900000 });
}
export function articleQuery(slug: string) {
 return queryOptions({ queryKey: ['article', slug], queryFn: async ({ signal }) => {
  const response = await request(`posts?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia,author,wp:term`, signal);
  const posts = await response.json() as Post[]; const post = posts[0];
  return post ? { ...post, content: { rendered: safeContent(post.content?.rendered || '') } } : null;
 }, staleTime: 300000 });
}

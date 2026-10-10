import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import type { Post, Category } from './news';

const input = z.discriminatedUnion('kind', [
 z.object({ kind: z.literal('categories') }),
 z.object({ kind: z.literal('posts'), page: z.number().int().min(1).max(10000), category: z.number().int().positive().optional(), search: z.string().max(200) }),
 z.object({ kind: z.literal('article'), slug: z.string().min(1).max(500) }),
]);
export const fetchNews = createServerFn({ method: 'GET' }).inputValidator(input).handler(async ({ data }) => {
 const params = new URLSearchParams();
 if (data.kind === 'categories') { params.set('per_page','100'); params.set('_fields','id,name,slug,count'); }
 else {
  params.set('_embed','wp:featuredmedia,author,wp:term');
  if (data.kind === 'article') params.set('slug',data.slug);
  else {
   params.set('per_page','10');params.set('page',String(data.page));
   params.set('_fields','id,slug,date,link,title,excerpt,categories,_links,_embedded');
   if (data.category) params.set('categories',String(data.category)); if (data.search) params.set('search',data.search);
  }
 }
 const url = `https://aupicinfo.com/wp-json/wp/v2/${data.kind === 'categories' ? 'categories' : 'posts'}?${params}`;
 let last: unknown;
 for (let attempt=0;attempt<2;attempt++) {
  try {
   const response = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { Accept: 'application/json' } });
   if (!response.ok) throw new Error(`Source returned ${response.status}`);
   const result = await response.json() as Post[] | Category[];
   const sanitizeHtml = data.kind === 'article' ? (await import('sanitize-html')).default : null;
   if (data.kind === 'article') {
    for (const post of result as Post[]) if (post.content && sanitizeHtml) post.content.rendered = sanitizeHtml(post.content.rendered, { allowedTags: [...sanitizeHtml.defaults.allowedTags,'img','figure','figcaption','video','source'], allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src','alt','width','height','loading'], video: ['src','controls','poster'], source: ['src','type'] }, allowedSchemes: ['https','http','mailto'], transformTags: { img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }) } });
   }
   return { items: result, total: Number(response.headers.get('X-WP-Total') || 0), pages: Number(response.headers.get('X-WP-TotalPages') || 1) };
  } catch (error) { last=error; }
 }
 console.error('News source unavailable', last instanceof Error ? last.message : 'network error');
 throw new Error('Les articles sont temporairement indisponibles. Veuillez réessayer.');
});

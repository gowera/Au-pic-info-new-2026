import { createFileRoute } from '@tanstack/react-router';
import { Archive, NewsError, NewsNotFound, NewsPending } from '@/components/news/articles';
import { categoriesQuery, postsQuery, validPage } from '@/lib/news';
export const Route = createFileRoute('/')({
 validateSearch: (search: Record<string, unknown>) => ({ page: validPage(search['page']), q: typeof search['q'] === 'string' ? search['q'].slice(0,200) : '' }),
 loaderDeps: ({ search }) => ({ page: search.page, q: search.q }),
 loader: async ({ context, deps }) => { await Promise.all([context.queryClient.ensureQueryData(postsQuery(deps.page, undefined, deps.q)), context.queryClient.ensureQueryData(categoriesQuery)]); },
 head: () => ({ meta: [ { title: 'Aupic de l’Info — Actualités de la RDC et radio en direct' }, { name: 'description', content: 'Toute l’actualité de la RDC : politique, société, économie, environnement, santé et sport. Écoutez Aupic Radio en direct.' }, { property: 'og:title', content: 'Aupic de l’Info — L’actualité au sommet' }, { property: 'og:description', content: 'Les dernières nouvelles de la RDC et Aupic Radio en direct.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' } ] }),
 component: Index, errorComponent: NewsError, notFoundComponent: NewsNotFound, pendingComponent: NewsPending,
});
function Index() { const { page, q } = Route.useSearch(); return <Archive page={page} q={q} />; }

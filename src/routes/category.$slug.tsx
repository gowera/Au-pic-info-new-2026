import { createFileRoute, notFound } from '@tanstack/react-router';
import { Archive, NewsError, NewsNotFound, NewsPending } from '@/components/news/articles';
import { categoriesQuery, plainText, postsQuery, validPage } from '@/lib/news';
export const Route = createFileRoute('/category/$slug')({
 validateSearch: (search: Record<string, unknown>) => ({ page: validPage(search['page']), q: typeof search['q'] === 'string' ? search['q'].slice(0,200) : '' }),
 loaderDeps: ({ search }) => ({ page: search.page, q: search.q }),
 loader: async ({ context, params, deps }) => {
  const categories = await context.queryClient.ensureQueryData(categoriesQuery); const category = categories.find(c => c.slug === params.slug); if (!category) throw notFound();
  await context.queryClient.ensureQueryData(postsQuery(deps.page, category.id, deps.q)); return { category };
 },
 head: ({ loaderData }) => { const name = loaderData ? plainText(loaderData.category.name) : 'Rubrique introuvable'; const title = `${name} — Aupic de l’Info`; const description = `Les dernières actualités ${name.toLowerCase()} de la RDC sur Aupic de l’Info.`; return { meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }; },
 component: CategoryPage, errorComponent: NewsError, notFoundComponent: NewsNotFound, pendingComponent: NewsPending,
});
function CategoryPage() { const { category } = Route.useLoaderData(); const { page, q } = Route.useSearch(); return <Archive page={page} q={q} category={category.id} title={plainText(category.name)} />; }

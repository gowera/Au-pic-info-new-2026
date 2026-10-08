import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ChevronRight, Copy, Check, Facebook, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { articleQuery, categoriesQuery, plainText, postImage, postsQuery } from '@/lib/news';
import { ArticleLink, NewsError, NewsNotFound, NewsPending, PostCategories, PostMeta, SectionTitle, Sidebar } from '@/components/news/articles';
export const Route = createFileRoute('/article/$slug')({
 loader: async ({ context, params }) => {
  const [post] = await Promise.all([context.queryClient.ensureQueryData(articleQuery(params.slug)), context.queryClient.ensureQueryData(categoriesQuery), context.queryClient.ensureQueryData(postsQuery())]);
  if (!post) throw notFound(); return { post };
 },
 head: ({ loaderData }) => {
  const post = loaderData?.post; const title = post ? `${plainText(post.title.rendered)} — Aupic de l’Info` : 'Article introuvable — Aupic de l’Info'; const description = post ? plainText(post.excerpt.rendered).slice(0,180) : 'Cet article n’est pas disponible.'; const image = post ? postImage(post, true) : undefined;
  return { meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary_large_image' }, ...(image?.startsWith('https://') ? [{ property: 'og:image', content: image }, { name: 'twitter:image', content: image }] : [])] };
 },
 component: ArticlePage, errorComponent: NewsError, notFoundComponent: NewsNotFound, pendingComponent: NewsPending,
});
function ArticlePage() {
 const { slug } = Route.useParams(); const { data: post } = useSuspenseQuery(articleQuery(slug)); const { data: latest } = useSuspenseQuery(postsQuery()); const [copied, setCopied] = useState(false); const [copyError, setCopyError] = useState(false);
 if (!post) return <NewsNotFound />;
 const image = postImage(post, true); const related = latest.posts.filter(p => p.id !== post.id).slice(0,3);
 async function copy() { try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false),2500); } catch { setCopyError(true); } }
 return <main className="site-container article-page"><nav className="breadcrumb" aria-label="Fil d’Ariane"><Link to="/" search={{ page: 1, q: '' }}>Accueil</Link><ChevronRight size={12} /><span>Actualités</span><ChevronRight size={12} /><span>Article</span></nav><div className="content-layout"><article className="article-detail"><PostCategories post={post} /><h1>{plainText(post.title.rendered)}</h1><PostMeta post={post} />{image && <img className="article-cover" src={image} alt={plainText(post.title.rendered)} fetchPriority="high" />}<div className="article-body" dangerouslySetInnerHTML={{ __html: post.content?.rendered || '' }} /><div className="article-share"><span>Partager cet article</span><Button size="sm" variant="outline" asChild><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window === 'undefined' ? post.link : window.location.href)}`} target="_blank" rel="noreferrer"><Facebook />Facebook</a></Button><Button size="sm" variant="outline" onClick={copy}>{copied ? <Check /> : <Copy />}{copied ? 'Lien copié' : 'Copier le lien'}</Button>{copyError && <span role="alert">Copiez le lien dans la barre d’adresse.</span>}</div><Button variant="link" asChild><Link to="/" search={{ page: 1, q: '' }}><ArrowLeft />Retour aux actualités</Link></Button><section className="mt-8"><SectionTitle>À lire aussi</SectionTitle><div className="related-grid">{related.map(p => <article key={p.id}>{postImage(p) && <ArticleLink post={p}><img src={postImage(p)} alt="" loading="lazy" /></ArticleLink>}<h3><ArticleLink post={p}>{plainText(p.title.rendered)}</ArticleLink></h3><PostMeta post={p} author={false} /></article>)}</div></section></article><Sidebar posts={latest.posts} /></div></main>;
}

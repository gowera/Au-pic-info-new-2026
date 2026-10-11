import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  ChevronRight,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Share2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { articleQuery, categoriesQuery, plainText, postImage, postsQuery } from "@/lib/news";
import {
  ArticleLink,
  NewsError,
  NewsNotFound,
  NewsPending,
  PostCategories,
  PostMeta,
  SectionTitle,
  Sidebar,
} from "@/components/news/articles";
export const Route = createFileRoute("/$slug")({
  loader: async ({ context, params }) => {
    const [post] = await Promise.all([
      context.queryClient.ensureQueryData(articleQuery(params.slug)),
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(postsQuery()),
    ]);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    const title = post
      ? `${plainText(post.title.rendered)} — Aupic de l’Info`
      : "Article introuvable — Aupic de l’Info";
    const description = post
      ? plainText(post.excerpt.rendered).slice(0, 180)
      : "Cet article n’est pas disponible.";
    const image = post ? postImage(post, true) : undefined;
    const shareImage =
      image && (typeof window === "undefined" ? image.startsWith("https://") : true)
        ? new URL(
            image,
            typeof window === "undefined" ? "https://aupicinfo.com" : window.location.origin,
          ).href
        : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(shareImage
          ? [
              { property: "og:image", content: shareImage },
              { name: "twitter:image", content: shareImage },
            ]
          : []),
      ],
    };
  },
  component: ArticlePage,
  errorComponent: NewsError,
  notFoundComponent: NewsNotFound,
  pendingComponent: NewsPending,
});
function ArticlePage() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(articleQuery(slug));
  const { data: latest } = useSuspenseQuery(postsQuery());
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [shareError, setShareError] = useState(false);
  if (!post) return <NewsNotFound />;
  const image = postImage(post, true);
  const articleTitle = plainText(post.title.rendered);
  const related = latest.posts.filter((p) => p.id !== post.id).slice(0, 3);
  const shareUrl = typeof window === "undefined" ? post.link : window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(articleTitle);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError(true);
    }
  }
  async function share() {
    try {
      await navigator.share({ title: articleTitle, url: shareUrl });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Unable to share article", error);
      setShareError(true);
    }
  }
  return (
    <main className="site-container article-page">
      <nav className="breadcrumb" aria-label="Fil d’Ariane">
        <Link to="/" search={{ page: 1, q: "" }}>
          Accueil
        </Link>
        <ChevronRight size={12} />
        <span>Actualités</span>
        <ChevronRight size={12} />
        <span>Article</span>
      </nav>
      <div className="content-layout">
        <article className="article-detail">
          <PostCategories post={post} />
          <h1>{plainText(post.title.rendered)}</h1>
          <PostMeta post={post} />
          {image && (
            <img
              className="article-cover"
              src={image}
              alt={plainText(post.title.rendered)}
              fetchPriority="high"
            />
          )}
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: post.content?.rendered || "" }}
          />
          <div className="article-share">
            <span>Partager cet article</span>
            <Button size="sm" variant="outline" asChild>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Partager sur Facebook"
              >
                <Facebook />
                Facebook
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Partager sur X"
              >
                𝕏 X
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a
                href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Partager sur WhatsApp"
              >
                <MessageCircle />
                WhatsApp
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a
                href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Partager sur Telegram"
              >
                <Send />
                Telegram
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Partager sur LinkedIn"
              >
                <Linkedin />
                LinkedIn
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a
                href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Partager sur Pinterest"
              >
                P Pinterest
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a
                href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Partager sur Reddit"
              >
                <MessageCircle />
                Reddit
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a
                href={`https://bsky.app/intent/compose?text=${encodedTitle}%20${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Partager sur Bluesky"
              >
                Bluesky
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a
                href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
                aria-label="Partager par e-mail"
              >
                <Mail />
                E-mail
              </a>
            </Button>
            {canShare && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => void share()}
                aria-label="Partager avec une autre application"
              >
                <Share2 />
                Plus
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? <Check /> : <Copy />}
              {copied ? "Lien copié" : "Copier le lien"}
            </Button>
            {copyError && <span role="alert">Copiez le lien dans la barre d’adresse.</span>}
            {shareError && (
              <span role="alert">Le partage n’est pas disponible pour le moment.</span>
            )}
          </div>
          <Button variant="link" asChild>
            <Link to="/" search={{ page: 1, q: "" }}>
              <ArrowLeft />
              Retour aux actualités
            </Link>
          </Button>
          <section className="mt-8">
            <SectionTitle>À lire aussi</SectionTitle>
            <div className="related-grid">
              {related.map((p) => (
                <article key={p.id}>
                  {postImage(p) && (
                    <ArticleLink post={p}>
                      <img src={postImage(p)} alt="" loading="lazy" />
                    </ArticleLink>
                  )}
                  <h3>
                    <ArticleLink post={p}>{plainText(p.title.rendered)}</ArticleLink>
                  </h3>
                  <PostMeta post={p} author={false} />
                </article>
              ))}
            </div>
          </section>
        </article>
        <Sidebar posts={latest.posts} />
      </div>
    </main>
  );
}

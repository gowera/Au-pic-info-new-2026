import { z } from "zod";
import type { Post, Category } from "./news";

export const API_URL = "https://aupicinfo.com/wp-json/wp/v2";

const input = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("categories") }),
  z.object({
    kind: z.literal("posts"),
    page: z.number().int().min(1).max(10000),
    category: z.number().int().positive().optional(),
    search: z.string().max(200),
  }),
  z.object({ kind: z.literal("article"), slug: z.string().min(1).max(500) }),
]);
type NewsRequest = z.infer<typeof input>;

export async function fetchNews(request: NewsRequest) {
  const data = input.parse(request);
  const params = new URLSearchParams();
  if (data.kind === "categories") {
    params.set("per_page", "100");
    params.set("_fields", "id,name,slug,count");
  } else {
    params.set("_embed", "wp:featuredmedia,author,wp:term");
    if (data.kind === "article") params.set("slug", data.slug);
    else {
      params.set("per_page", "10");
      params.set("page", String(data.page));
      params.set("_fields", "id,slug,date,link,title,excerpt,categories,_links,_embedded");
      if (data.category) params.set("categories", String(data.category));
      if (data.search) params.set("search", data.search);
    }
  }
  const url = `${API_URL}/${data.kind === "categories" ? "categories" : "posts"}?${params}`;
  let last: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(20000),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Source returned ${response.status}`);
      const result = (await response.json()) as Post[] | Category[];
      return {
        items: result,
        total: Number(response.headers.get("X-WP-Total") || 0),
        pages: Number(response.headers.get("X-WP-TotalPages") || 1),
      };
    } catch (error) {
      last = error;
    }
  }
  console.error("News source unavailable", last instanceof Error ? last.message : "network error");
  throw new Error("Les articles sont temporairement indisponibles. Veuillez réessayer.");
}

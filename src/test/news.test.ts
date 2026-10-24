import { afterEach, describe, expect, it, vi } from "vitest";
import {
  API_URL,
  PAGE_SIZE,
  RADIO_URL,
  pageNumbers,
  validPage,
  safeContent,
  postImage,
} from "@/lib/news";
import { fetchNews } from "@/lib/news-api";

afterEach(() => vi.unstubAllGlobals());

describe("Au Pic Info rules", () => {
  it("uses the original REST API", () =>
    expect(API_URL).toBe("https://aupicinfo.com/wp-json/wp/v2"));
  it("uses the supplied radio stream", () =>
    expect(RADIO_URL).toBe("https://stream.zeno.fm/wnawq794tk8uv"));
  it("serves imported article photos from the public images folder", () =>
    expect(
      postImage({
        id: 156052,
        slug: "article",
        date: "",
        link: "",
        title: { rendered: "" },
        excerpt: { rendered: "" },
        categories: [],
      }),
    ).toBe(`${import.meta.env.BASE_URL}images/news-156052.jpg`));
  it("loads ten posts per archive page instead of the whole archive", () =>
    expect(PAGE_SIZE).toBe(10));
  it("rejects invalid pagination", () => {
    expect(validPage(-5)).toBe(1);
    expect(validPage(2.2)).toBe(1);
    expect(validPage("2")).toBe(2);
  });
  it("keeps navigation bounded for large archives", () =>
    expect(pageNumbers(100, 192)).toEqual([1, "…", 99, 100, 101, "…", 192]));
  it("removes executable source content and preserves readable article content", () => {
    const html = safeContent(
      '<p>Actualité</p><script>alert(1)</script><img src="https://aupicinfo.com/photo.jpg" onerror="alert(1)"><a href="javascript:alert(1)">danger</a>',
    );
    expect(html).toContain("<p>Actualité</p>");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("javascript:");
  });
  it("fetches filtered and paginated news from the WordPress API", async () => {
    let requestedUrl = "";
    vi.stubGlobal("AbortSignal", { timeout: () => undefined });
    vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
      requestedUrl = String(input);
      return {
        ok: true,
        headers: new Headers({ "X-WP-Total": "31", "X-WP-TotalPages": "4" }),
        json: async () => [],
      };
    });
    const result = await fetchNews({ kind: "posts", page: 3, category: 121, search: "Goma" });
    const url = new URL(requestedUrl);
    expect(url.origin + url.pathname).toBe(API_URL + "/posts");
    expect(url.searchParams.get("page")).toBe("3");
    expect(url.searchParams.get("categories")).toBe("121");
    expect(url.searchParams.get("search")).toBe("Goma");
    expect(result.total).toBe(31);
    expect(result.pages).toBe(4);
  });
});

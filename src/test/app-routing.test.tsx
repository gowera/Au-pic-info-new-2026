import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { getRouter } from "@/router";

// Match routes without running loaders or rendering: loaders may need the network,
// and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches article slugs directly at the root without an /article prefix", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    expect(router.matchRoutes("/example-news").at(-1)?.routeId).toBe("/$slug");
    expect(router.matchRoutes("/article/example-news").at(-1)?.routeId).toBe("/article/$slug");
  });

  it("configures TanStack Router to use Vite's deployment base path", () => {
    const router = getRouter();
    const expectedBasePath =
      import.meta.env.BASE_URL === "/" ? "/" : import.meta.env.BASE_URL.replace(/\/$/, "");

    expect(router.options.basepath).toBe(expectedBasePath);
  });
});

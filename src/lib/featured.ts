export function latestFeaturedPosts<T extends { date: string; id: number }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || b.id - a.id).slice(0, 5);
}
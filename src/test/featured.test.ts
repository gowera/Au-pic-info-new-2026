import { describe, expect, it } from 'vitest';
import { latestFeaturedPosts } from '@/lib/featured';

describe('Main news feature', () => {
  it('includes exactly the five latest articles in newest-first order', () => {
    const posts = [2, 6, 1, 4, 3, 5, 7].map(id => ({ id, date: `2026-10-09T${String(id).padStart(2, '0')}:00:00` }));
    expect(latestFeaturedPosts(posts).map(post => post.id)).toEqual([7, 6, 5, 4, 3]);
    expect(posts.map(post => post.id)).toEqual([2, 6, 1, 4, 3, 5, 7]);
  });
  it('does not duplicate articles when fewer than five are available', () => {
    expect(latestFeaturedPosts([{ id: 1, date: '2026-10-09' }]).map(post => post.id)).toEqual([1]);
    expect(latestFeaturedPosts([])).toEqual([]);
  });
});
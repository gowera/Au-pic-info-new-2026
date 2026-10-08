import { describe, expect, it } from 'vitest';
import { API_URL, PAGE_SIZE, RADIO_URL, pageNumbers, validPage, safeContent } from '@/lib/news';
describe('Au Pic Info rules', () => {
 it('uses the original REST API', () => expect(API_URL).toBe('https://aupicinfo.com/wp-json/wp/v2'));
 it('uses the supplied radio stream', () => expect(RADIO_URL).toBe('https://radio.nitro-server.uk/listen/aupicradio/radio.mp3'));
 it('loads ten posts per archive page instead of the whole archive', () => expect(PAGE_SIZE).toBe(10));
 it('rejects invalid pagination', () => { expect(validPage(-5)).toBe(1); expect(validPage(2.2)).toBe(1); expect(validPage('2')).toBe(2); });
 it('keeps navigation bounded for large archives', () => expect(pageNumbers(100,192)).toEqual([1,'…',99,100,101,'…',192]));
 it('removes executable source content and preserves readable article content', () => { const html = safeContent('<p>Actualité</p><script>alert(1)</script><img src="https://aupicinfo.com/photo.jpg" onerror="alert(1)"><a href="javascript:alert(1)">danger</a>'); expect(html).toContain('<p>Actualité</p>'); expect(html).not.toContain('<script'); expect(html).not.toContain('onerror'); expect(html).not.toContain('javascript:'); });
});

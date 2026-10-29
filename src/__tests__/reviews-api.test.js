import { GET } from '@/app/api/reviews/route';
const previousKey = process.env.GOOGLE_PLACES_API_KEY;
afterEach(() => { if (previousKey === undefined) delete process.env.GOOGLE_PLACES_API_KEY; else process.env.GOOGLE_PLACES_API_KEY = previousKey; jest.restoreAllMocks(); });
it('returns an honest unavailable state without fabricated reviews', async () => {
  delete process.env.GOOGLE_PLACES_API_KEY;
  const fetch = jest.spyOn(global, 'fetch');
  const response = await GET(new Request('http://localhost/api/reviews?riverId=mad-river'));
  expect(await response.json()).toMatchObject({ available: false, rating: null, reviews: [] });
  expect(fetch).not.toHaveBeenCalled();
});
it('rejects arbitrary Places queries and unknown rivers before upstream calls', async () => {
  process.env.GOOGLE_PLACES_API_KEY = 'test-only';
  const fetch = jest.spyOn(global, 'fetch');
  const response = await GET(new Request('http://localhost/api/reviews?query=arbitrary&riverId=unknown'));
  expect(response.status).toBe(400);
  expect(fetch).not.toHaveBeenCalled();
});

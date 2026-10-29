import { GET } from '@/app/api/weather/route';
import { normalizeOpenMeteo, normalizeNws, localDate } from '@/lib/weather';

const time = Date.parse('2026-10-31T12:00:00Z') / 1000;
const hours = Array.from({ length: 126 }, (_, i) => time + (i - 3) * 3600);
const payload = () => ({
  timezone: 'America/New_York',
  current: { time, interval: 900, temperature_2m: 60, relative_humidity_2m: 0, weather_code: 0, pressure_msl: 1013, precipitation: 0 },
  hourly: { time: hours, temperature_2m: hours.map(() => 60), weather_code: hours.map(() => 0), pressure_msl: hours.map(() => 1010), precipitation: hours.map(() => null), precipitation_probability: hours.map(() => 0) },
  daily: { sunrise: [time - 3600], sunset: [time + 3600] },
});
const json = data => ({ ok: true, json: async () => data });
const request = query => new Request(`http://localhost/api/weather${query}`);
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

it.each(['', '?lat=40', '?lat=abc&lon=-83', '?lat=91&lon=0', '?lat=0&lon=181', '?lat=%20&lon=0'])('rejects invalid coordinates %s without upstream calls', async query => {
  global.fetch = jest.fn();
  expect((await GET(request(query))).status).toBe(400);
  expect(global.fetch).not.toHaveBeenCalled();
});

it('requests bounded imperial epoch data and returns five days and 120 hours without treating null as zero', async () => {
  global.fetch = jest.fn().mockResolvedValue(json(payload()));
  const response = await GET(request('?lat=40&lon=-83'));
  const body = await response.json();
  expect(response.status).toBe(200);
  expect(body.daily).toHaveLength(5);
  expect(body.forecast).toHaveLength(40);
  expect(body.forecast.at(-1).dt - body.forecast[0].dt).toBe(117 * 3600);
  expect(body.current).toMatchObject({ humidity: 0, windGust: null, pressureTendency: 'rising', precipitation: 0, feelsLike: null });
  expect(body.forecast[0]).toMatchObject({ precipitation: null, precipitationProbability: 0 });
  const [url, options] = global.fetch.mock.calls[0];
  expect(new URL(url).searchParams.get('timeformat')).toBe('unixtime');
  expect(new URL(url).searchParams.get('precipitation_unit')).toBe('inch');
  expect(options.signal).toBeInstanceOf(AbortSignal);
});

it('keeps epoch times across DST and uses destination dates rather than the process timezone', () => {
  const result = normalizeOpenMeteo(payload());
  expect(result.daily.map(day => day.date)).toEqual(['2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04']);
  expect(localDate(Date.parse('2026-11-02T04:30:00Z') / 1000, 'America/New_York')).toBe('2026-11-01');
  expect(result.current.sunrise).toBe('2026-10-31T11:00:00.000Z');
});

const nws = () => ({ properties: { periods: Array.from({ length: 120 }, (_, i) => ({
  startTime: new Date((time + i * 3600) * 1000).toISOString(), temperature: 10, temperatureUnit: 'C', shortForecast: 'Mostly Sunny',
  windSpeed: '5 to 10 mph', windDirection: 'NW', probabilityOfPrecipitation: { value: 40 }, relativeHumidity: { value: 0 },
})) } });

it('falls back to NWS without making up precipitation amounts, gusts, pressure, humidity or sun times', async () => {
  global.fetch = jest.fn().mockRejectedValueOnce(new Error('timeout'))
    .mockResolvedValueOnce(json({ properties: { timeZone: 'America/New_York', forecastHourly: 'https://api.weather.gov/gridpoints/ILN/1,2/forecast/hourly' } }))
    .mockResolvedValueOnce(json(nws()));
  const response = await GET(request('?lat=40&lon=-83'));
  const data = await response.json();
  expect(data.provider).toBe('NWS');
  expect(data.current).toMatchObject({ temp: 50, humidity: 0, pressure: null, pressureTendency: null, windGust: null, cloudCover: null, feelsLike: null, precipitation: null, precipitationProbability: 40, sunrise: null, sunset: null, windLabel: '5 to 10 mph' });
  expect(data.daily).toHaveLength(5);
  expect(data.forecast).toHaveLength(40);
  const missing = nws(); missing.properties.periods[0].relativeHumidity = undefined;
  expect(normalizeNws(missing, 'America/New_York').current.humidity).toBeNull();
});

it('returns 503 for malformed providers and refuses a forecast URL outside NWS', async () => {
  global.fetch = jest.fn().mockResolvedValueOnce(json({}))
    .mockResolvedValueOnce(json({ properties: { forecastHourly: 'https://example.com/private', timeZone: 'America/New_York' } }));
  expect((await GET(request('?lat=40&lon=-83'))).status).toBe(503);
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

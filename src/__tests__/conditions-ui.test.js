/** @jest-environment jsdom */
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import WeatherPanel, { weatherTime } from '@/app/components/WeatherPanel';
import useResource from '@/hooks/useResource';

const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; jest.useRealTimers(); });
const response = data => ({ ok: true, json: async () => data });

it('renders missing measurements honestly and formats destination times across DST', () => {
  render(<WeatherPanel data={{ provider: 'NWS', timezone: 'America/Denver', currentKind: 'Current hourly forecast', current: { temp: 0, humidity: 0, pressure: null, precipitation: null, precipitationProbability: 40, description: 'Snow', time: '2026-11-01T08:30:00Z' }, daily: [], forecast: [] }} />);
  expect(screen.getAllByText('Unavailable').length).toBeGreaterThan(3);
  expect(screen.getByText('0°F')).toBeInTheDocument();
  expect(screen.getByText('40%')).toBeInTheDocument();
  expect(screen.queryByText('0.00 in')).not.toBeInTheDocument();
  expect(weatherTime('2026-11-01T07:30:00Z', 'America/Denver')).toContain('MDT');
  expect(weatherTime('2026-11-01T08:30:00Z', 'America/Denver')).toContain('MST');
});

it('ignores an old corridor response even if fetch resolves after abort', async () => {
  let resolveFirst;
  global.fetch = jest.fn().mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve; }))
    .mockResolvedValueOnce(response({ name: 'second' }));
  const { result, rerender, unmount } = renderHook(({ url }) => useResource(url), { initialProps: { url: '/first' } });
  const signal = global.fetch.mock.calls[0][1].signal;
  rerender({ url: '/second' });
  expect(signal.aborted).toBe(true);
  await waitFor(() => expect(result.current.data).toEqual({ name: 'second' }));
  await act(async () => resolveFirst(response({ name: 'first' })));
  expect(result.current.data).toEqual({ name: 'second' });
  unmount();
  expect(global.fetch.mock.calls[1][1].signal.aborted).toBe(true);
});

it('polls without losing the last reading on a failed refresh, supports retry, and cleans timers', async () => {
  jest.useFakeTimers();
  global.fetch = jest.fn().mockResolvedValueOnce(response({ flow: 100 }))
    .mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(response({ flow: 200 }));
  const { result, unmount } = renderHook(() => useResource('/gauge', 300000));
  await act(async () => {});
  expect(result.current.data.flow).toBe(100);
  await act(async () => { jest.advanceTimersByTime(300000); });
  expect(result.current.error).toBe('offline');
  expect(result.current.data.flow).toBe(100);
  await act(async () => result.current.retry());
  expect(result.current.data.flow).toBe(200);
  unmount();
  await act(async () => { jest.advanceTimersByTime(600000); });
  expect(global.fetch).toHaveBeenCalledTimes(3);
});

it('keeps successful additional gauges available when another gauge fails', async () => {
  global.fetch = jest.fn().mockResolvedValueOnce(response({ siteId: 'one', flow: 100 })).mockRejectedValueOnce(new Error('offline'));
  const { result } = renderHook(() => useResource(['/one', '/two']));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toEqual([{ siteId: 'one', flow: 100 }, null]);
  expect(result.current.error).toContain('Some additional gauges');
});

it('refreshes on return, exposes pending retries, and retains original check times on failure', async () => {
  const reading = { flow: 100, checkedAt: '2026-10-29T12:05:00Z', flowTimestamp: '2026-10-29T12:00:00Z' };
  let rejectRefresh;
  global.fetch = jest.fn().mockResolvedValueOnce(response(reading))
    .mockImplementationOnce(() => new Promise((resolve, reject) => { rejectRefresh = reject; }))
    .mockResolvedValue(response({ ...reading, flow: 200 }));
  const { result, unmount } = renderHook(() => useResource('/gauge', 300000));
  await waitFor(() => expect(result.current.refreshing).toBe(false));
  act(() => { window.dispatchEvent(new Event('focus')); });
  expect(result.current.refreshing).toBe(true);
  expect(result.current.data).toEqual(reading);
  await act(async () => { rejectRefresh(new Error('offline')); });
  expect(result.current.refreshing).toBe(false);
  expect(result.current.data).toEqual(reading);
  expect(result.current.error).toBe('offline');
  await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
  expect(result.current.data.flow).toBe(200);
  unmount();
  act(() => { window.dispatchEvent(new Event('focus')); document.dispatchEvent(new Event('visibilitychange')); });
  expect(global.fetch).toHaveBeenCalledTimes(3);
});

it('does not request disabled historical gauges on focus or poll', async () => {
  jest.useFakeTimers();
  global.fetch = jest.fn();
  const { result } = renderHook(() => useResource(null, 300000));
  await act(async () => { window.dispatchEvent(new Event('focus')); jest.advanceTimersByTime(600000); result.current.retry(); });
  expect(global.fetch).not.toHaveBeenCalled();
  expect(result.current.refreshing).toBe(false);
});

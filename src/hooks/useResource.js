'use client';

import { useCallback, useEffect, useState } from 'react';

export default function useResource(request, refreshMs = 0) {
  const url = JSON.stringify(request);
  const [result, setResult] = useState({ url: null, data: null, error: null });
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    const target = JSON.parse(url);
    if (!target) return;
    const controller = new AbortController();
    let timer;
    async function load() {
      try {
        const get = async endpoint => {
          const response = await fetch(endpoint, { signal: controller.signal });
          if (!response.ok) throw new Error('The service could not be reached. Please retry.');
          return response.json();
        };
        if (Array.isArray(target)) {
          const results = await Promise.allSettled(target.map(get));
          if (!controller.signal.aborted) setResult(previous => ({
            url,
            data: results.map((result, i) => result.status === 'fulfilled' ? result.value : previous.url === url ? previous.data?.[i] || null : null),
            error: results.some(result => result.status === 'rejected') ? 'Some additional gauges could not be refreshed.' : null,
          }));
        } else {
          const data = await get(target);
          if (!controller.signal.aborted) setResult({ url, data, error: null });
        }
      } catch (error) {
        if (!controller.signal.aborted) setResult(previous => ({ url, data: previous.url === url ? previous.data : null, error: error.message }));
      } finally {
        if (!controller.signal.aborted && refreshMs) timer = setTimeout(load, refreshMs);
      }
    }
    load();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [url, refreshMs, revision]);
  const current = result.url === url ? result : { data: null, error: null };
  return { ...current, loading: Boolean(request && !current.data && !current.error), retry };
}

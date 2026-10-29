"use client";
import { useCallback, useEffect, useRef } from 'react';
import { trustedMessage, validCoordinates } from '../../../public/maps/map-utils';

export default function AccessMap({ point, mode, gauges, gaugeId, records, showStocking }) {
  const frame = useRef(null);
  const sync = useCallback(() => {
    const target = frame.current?.contentWindow;
    if (!target || !point) return;
    target.postMessage({ type: 'update_map', lat: point.latitude, lon: point.longitude,
      name: point.name, mode, gauges: gauges.filter(g => validCoordinates(g.latitude, g.longitude)).map(g => ({
        id: g.siteId, name: g.name, lat: g.latitude, lon: g.longitude, isActive: g.siteId === gaugeId,
      })) }, window.location.origin);
    target.postMessage({ type: 'update_stocking', records, visible: showStocking }, window.location.origin);
  }, [point, mode, gauges, gaugeId, records, showStocking]);
  useEffect(() => {
    const ready = event => {
      if (trustedMessage(event, frame.current?.contentWindow, window.location.origin, ['map_ready'])) sync();
    };
    window.addEventListener('message', ready);
    sync();
    return () => window.removeEventListener('message', ready);
  }, [sync]);
  return <iframe ref={frame} onLoad={sync} title={`${point.name} Map`} src="/map.html"
    width="100%" height="100%" style={{ border: 0, minHeight: '450px' }} loading="lazy" />;
}

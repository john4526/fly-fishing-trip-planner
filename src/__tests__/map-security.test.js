/** @jest-environment jsdom */
import fs from 'node:fs';
import path from 'node:path';
import { fireEvent, render } from '@testing-library/react';
import StateVectorMap from '@/app/components/StateVectorMap';
import { textPopup, trustedMessage, validCoordinates, reportTileFailure } from '../../public/maps/map-utils';
const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

it('accepts navigation only from its own iframe and a configured corridor', () => {
  const { container } = render(<StateVectorMap stateId="ohio" corridorIds={['mad-river']} />);
  const frame = container.querySelector('iframe');
  const send = (origin, source, corridorId) => fireEvent(window, new MessageEvent('message', {
    origin, source, data: { type: 'select_river_corridor', corridorId },
  }));
  send('https://untrusted.example', frame.contentWindow, 'mad-river');
  send(window.location.origin, window, 'mad-river');
  send(window.location.origin, frame.contentWindow, '../../admin');
  expect(push).not.toHaveBeenCalled();
  send(window.location.origin, frame.contentWindow, 'mad-river');
  expect(push).toHaveBeenCalledWith('/states/ohio/corridors/mad-river');
});

it('renders URL and message names as text in the actual access-map script', () => {
  const payload = '<img src=x onerror="window.exploited=true">';
  window.history.replaceState({}, '', `/map.html?lat=40&lon=-83&name=${encodeURIComponent(payload)}`);
  document.body.innerHTML = '<div id="map-status"></div><div id="map"></div>';
  const popups = [];
  const layers = [];
  const makeLayer = () => {
    const layer = { addTo: jest.fn(() => layer), on: jest.fn(() => layer),
      bindPopup: jest.fn(node => { popups.push(node); return layer; }), openPopup: jest.fn(() => layer),
      setLatLng: jest.fn(() => layer), clearLayers: jest.fn(() => layer) };
    layers.push(layer); return layer;
  };
  const map = { setView: jest.fn(() => map), removeLayer: jest.fn() };
  window.L = { map: () => map, marker: makeLayer, tileLayer: makeLayer, circleMarker: makeLayer, layerGroup: makeLayer };
  const add = jest.spyOn(window, 'addEventListener');
  const source = fs.readFileSync(path.join(process.cwd(), 'public/maps/access-map.js'), 'utf8').replace(/^import .*;\n/, '');
  new Function('validCoordinates', 'trustedMessage', 'textPopup', 'reportTileFailure', source)(validCoordinates, trustedMessage, textPopup, reportTileFailure);
  expect(popups[0].textContent).toBe(payload);
  expect(popups[0].querySelector('img')).toBeNull();
  const handler = add.mock.calls.find(([type]) => type === 'message')[1];
  const data = { type: 'update_map', lat: 41, lon: -82, mode: 'terrain', name: payload, gauges: [] };
  const originalCalls = map.setView.mock.calls.length;
  handler({ data, source: window.parent, origin: 'https://untrusted.example' });
  handler({ data: { ...data, lat: 999 }, source: window.parent, origin: window.location.origin });
  expect(map.setView).toHaveBeenCalledTimes(originalCalls);
  handler({ data, source: window.parent, origin: window.location.origin });
  expect(map.setView).toHaveBeenLastCalledWith([41, -82], 15);
  expect(popups.at(-1).textContent).toBe(payload);
  expect(popups.at(-1).querySelector('img')).toBeNull();
  window.removeEventListener('message', handler);
  add.mockRestore();
  delete window.L;
  window.history.replaceState({}, '', '/');
});

it('shows an understandable message when map tiles fail', () => {
  const status = document.createElement('div');
  status.hidden = true;
  let fail;
  reportTileFailure({ on: (type, callback) => { fail = callback; } }, status);
  fail();
  expect(status.hidden).toBe(false);
  expect(status.textContent).toMatch(/Basemap unavailable/);
});

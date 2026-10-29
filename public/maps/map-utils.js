export function validCoordinates(lat, lon) {
  return Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
    Number.isFinite(lon) && lon >= -180 && lon <= 180;
}

export function trustedMessage(event, source, origin, types) {
  return Boolean(source && event.source === source && event.origin === origin &&
    event.data && typeof event.data === 'object' && !Array.isArray(event.data) &&
    types.includes(event.data.type));
}

// Leaflet treats strings as HTML. Always provide a DOM node containing text.
export function textPopup(title, lines = []) {
  const container = document.createElement('div');
  const heading = document.createElement('strong');
  heading.textContent = String(title ?? '');
  container.append(heading);
  for (const line of lines) {
    const row = document.createElement('div');
    row.textContent = String(line ?? '');
    container.append(row);
  }
  return container;
}

export function reportTileFailure(layer, status) {
  layer.on('tileerror', () => {
    status.hidden = false;
    status.textContent = 'Basemap unavailable. Access markers and corridor outlines remain available. Reload to retry.';
  });
  return layer;
}

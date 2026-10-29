import { validCoordinates, trustedMessage, textPopup, reportTileFailure } from './map-utils.js';
const status = document.getElementById('map-status');
const L = window.L;
if (!L) {
  status.textContent = 'Map could not load. Access details and driving directions are available outside the map.';
} else {
  const params = new URLSearchParams(window.location.search);
  const lat = Number(params.get('lat'));
  const lon = Number(params.get('lon'));
  const initial = params.has('lat') && params.has('lon') && validCoordinates(lat, lon) ? [lat, lon] : [40.1062, -83.7974];
  const map = L.map('map').setView(initial, 15);
  const satellite = reportTileFailure(L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19, attribution: 'Tiles © Esri and imagery providers',
  }), status);
  const terrain = reportTileFailure(L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{x}/{y}', {
    maxZoom: 16, attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
  }), status);
  let layer = params.get('mode') === 'terrain' ? terrain : satellite;
  layer.addTo(map);
  const marker = L.marker(initial).addTo(map).bindPopup(textPopup(params.get('name') || 'Access Point')).openPopup();
  const gauges = L.layerGroup().addTo(map);
  const stocking = L.layerGroup();
  status.hidden = true;

  window.addEventListener('message', event => {
    if (!trustedMessage(event, window.parent, window.location.origin, ['update_map', 'update_stocking'])) return;
    const data = event.data;
    if (data.type === 'update_map') {
      if (!validCoordinates(data.lat, data.lon) || typeof data.name !== 'string' || !['terrain', 'satellite'].includes(data.mode)) return;
      map.setView([data.lat, data.lon], 15);
      marker.setLatLng([data.lat, data.lon]).bindPopup(textPopup(data.name)).openPopup();
      const nextLayer = data.mode === 'terrain' ? terrain : satellite;
      if (nextLayer !== layer) { map.removeLayer(layer); nextLayer.addTo(map); layer = nextLayer; }
      gauges.clearLayers();
      if (Array.isArray(data.gauges)) for (const gauge of data.gauges.slice(0, 100)) {
        if (!gauge || !validCoordinates(gauge.lat, gauge.lon)) continue;
        L.circleMarker([gauge.lat, gauge.lon], { radius: 8, color: gauge.isActive ? '#ef4444' : '#2563eb' })
          .addTo(gauges).bindPopup(textPopup(gauge.name, [`USGS Gauge: ${gauge.id}`]));
      }
    } else {
      if (!Array.isArray(data.records) || typeof data.visible !== 'boolean') return;
      stocking.clearLayers();
      for (const record of data.records.slice(0, 1000)) {
        if (!record || !validCoordinates(record.latitude, record.longitude)) continue;
        L.circleMarker([record.latitude, record.longitude], { radius: 7, color: '#16a34a' })
          .addTo(stocking).bindPopup(textPopup(`${record.species ?? 'Fish'} stocking`, [
            record.locationName, `Quantity: ${Number.isFinite(record.quantity) ? record.quantity.toLocaleString() : 'Unavailable'}`,
            `Life stage: ${record.lifeStage ?? 'Unavailable'}`, `Year: ${record.year ?? 'Unavailable'}`,
            `Hatchery: ${record.hatchery ?? 'Unavailable'}`,
          ]));
      }
      if (data.visible) stocking.addTo(map); else map.removeLayer(stocking);
    }
  });
  window.parent.postMessage({ type: 'map_ready' }, window.location.origin);
}

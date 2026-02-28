/**
 * Leaflet Map Utilities — marker configuration, clustering, popups.
 */

import { formatCurrency } from './formatters.js';

const STATUS_COLORS = {
    'Disponible': '#20c997',
    'Arrendada': '#4c6ef5',
    'En Mantenimiento': '#f59f00',
    'Vendida': '#868e96',
};

let mapInstance = null;
let markerGroup = null;

/** Initialize the Leaflet map on a container element. */
export function initMap(containerId, center = [4.711, -74.072], zoom = 12) {
    if (mapInstance) {
        mapInstance.remove();
    }

    mapInstance = L.map(containerId).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
    }).addTo(mapInstance);

    markerGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
    });

    mapInstance.addLayer(markerGroup);

    return mapInstance;
}

/** Add property markers to the map. */
export function updateMarkers(properties) {
    if (!markerGroup) return;

    markerGroup.clearLayers();

    properties.forEach(p => {
        const color = STATUS_COLORS[p.status] || '#868e96';

        const marker = L.circleMarker([p.latitude, p.longitude], {
            radius: 10,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85,
        });

        const popupContent = `
      <div style="font-family:Inter,sans-serif; min-width:200px;">
        <h3 style="margin:0 0 4px; font-size:14px; font-weight:700; color:#212529;">${p.name}</h3>
        <p style="margin:0 0 2px; font-size:12px; color:#868e96;">${p.property_type} • ${p.city}</p>
        <div style="display:flex; align-items:center; gap:6px; margin-top:8px;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${color};"></span>
          <span style="font-size:12px; font-weight:600; color:#495057;">${p.status}</span>
        </div>
        ${p.monthly_rent ? `<p style="margin:6px 0 0; font-size:13px; font-weight:600; color:#20c997;">Canon: ${formatCurrency(p.monthly_rent)}</p>` : ''}
        <a href="#/properties/${p.id}" style="display:inline-block; margin-top:8px; font-size:12px; color:#4c6ef5; text-decoration:none; font-weight:600;">Ver ficha →</a>
      </div>
    `;

        marker.bindPopup(popupContent);
        markerGroup.addLayer(marker);
    });

    // Fit bounds if there are markers
    if (properties.length > 0) {
        const bounds = markerGroup.getBounds();
        if (bounds.isValid()) {
            mapInstance.fitBounds(bounds, { padding: [30, 30] });
        }
    }
}

/** Resize the map (call after container size change). */
export function invalidateMap() {
    if (mapInstance) {
        setTimeout(() => mapInstance.invalidateSize(), 100);
    }
}

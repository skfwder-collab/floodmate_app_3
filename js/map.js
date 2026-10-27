/**
 * FloodMate MVP — Leaflet.js Interactive Flood Radar Map
 */

import { appState } from "./state.js";
import { evaluatePassability, getFullVehicleMatrix } from "./passability.js";

export class FloodMap {
  constructor(containerId = "map") {
    this.containerId = containerId;
    this.map = null;
    this.markersLayer = null;
    this.locationMarkersLayer = null;
    this.selectedPointCallback = null;
  }

  init(onPointSelect) {
    this.selectedPointCallback = onPointSelect;

    // Bangkok Basin default coordinates
    const defaultCenter = [13.737, 100.565];

    // Initialize Leaflet Map
    this.map = L.map(this.containerId, {
      center: defaultCenter,
      zoom: 14,
      zoomControl: false
    });

    // Add Zoom control at bottom right
    L.control.zoom({ position: "bottomright" }).addTo(this.map);

    // CartoDB Dark Matter tile layer for the sleek flood radar aesthetic
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; OpenStreetMap contributors',
      maxZoom: 19,
      subdomains: "abcd"
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.locationMarkersLayer = L.layerGroup().addTo(this.map);

    // Render initial data
    this.renderSavedLocations();
    this.renderFloodPoints();

    // Listen to state changes
    appState.subscribe("points", () => this.renderFloodPoints());
    appState.subscribe("vehicle", () => this.renderFloodPoints());
    appState.subscribe("locations", () => this.renderSavedLocations());

    // Map click handler to trigger new report at clicked coordinate
    this.map.on("click", (e) => {
      window.dispatchEvent(
        new CustomEvent("floodmate:map-click", {
          detail: { lat: e.latlng.lat, lng: e.latlng.lng }
        })
      );
    });
  }

  renderSavedLocations() {
    if (!this.locationMarkersLayer) return;
    this.locationMarkersLayer.clearLayers();

    const locations = appState.getLocations();
    locations.forEach((loc) => {
      const iconHtml = `
        <div class="saved-loc-pin loc-${loc.category}">
          <span class="loc-icon">${loc.category === "home" ? "🏠" : loc.category === "work" ? "🏢" : "🚗"}</span>
          <div class="loc-label">${loc.name}</div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-leaflet-div-icon",
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });
      marker.bindPopup(`
        <div class="map-popup-card">
          <div class="popup-badge">Saved Coordinate</div>
          <h4 style="margin: 4px 0 2px 0; color: #0B132B;">${loc.name}</h4>
          <p style="margin: 0; font-size: 12px; color: #64748B;">${loc.address}</p>
        </div>
      `);
      this.locationMarkersLayer.addLayer(marker);
    });
  }

  renderFloodPoints() {
    if (!this.markersLayer) return;
    this.markersLayer.clearLayers();

    const points = appState.getPoints();
    const activeVehicle = appState.getActiveVehicle();

    points.forEach((point) => {
      const pass = evaluatePassability(point.depthCm, activeVehicle);
      const isRising = point.trend === "rising";
      const trendIcon = isRising ? "▲" : point.trend === "falling" ? "▼" : "─";
      const trendColor = isRising ? "#E63946" : point.trend === "falling" ? "#2A9D8F" : "#64748B";

      // Color tier for the marker based on selected vehicle passability
      let markerColorClass = "marker-safe";
      if (pass.status === "caution") markerColorClass = "marker-caution";
      if (pass.status === "impassable") markerColorClass = "marker-danger";

      const markerHtml = `
        <div class="radar-marker ${markerColorClass}">
          <div class="radar-ping"></div>
          <div class="marker-core">
            <span class="marker-depth">${point.depthCm}</span>
            <span class="marker-unit">cm</span>
          </div>
          <div class="marker-trend" style="color: ${trendColor}">${trendIcon}</div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-leaflet-div-icon",
        html: markerHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([point.lat, point.lng], { icon: customIcon });

      // Generate passability matrix for popup
      const matrix = getFullVehicleMatrix(point.depthCm);
      const matrixHtml = matrix
        .map(
          (m) => `
        <div class="passability-chip pass-${m.status}">
          <span>${m.icon} ${m.name.split("/")[0]}</span>
          <strong>${m.label}</strong>
        </div>
      `
        )
        .join("");

      const popupHtml = `
        <div class="map-popup-card">
          <div class="popup-header">
            <div>
              <span class="source-tag source-${point.sourceType}">
                ${point.sourceType === "sensor" ? "📡 IoT Sensor" : "📸 Verified Photo"}
              </span>
              <span class="confidence-tag">Confidence: ${point.confidence}%</span>
            </div>
            <span class="popup-time">${point.updatedAgo || "Recently"}</span>
          </div>

          <h3 class="popup-title">${point.name}</h3>
          
          <div class="popup-depth-row">
            <div class="depth-hero">
              <span class="depth-num">${point.depthCm}</span>
              <span class="depth-unit">cm water depth</span>
            </div>
            <div class="trend-badge trend-${point.trend}">
              ${trendIcon} ${point.trend.toUpperCase()} (${point.trendRateCmHr > 0 ? "+" : ""}${point.trendRateCmHr || 0} cm/h)
            </div>
          </div>

          <div class="popup-matrix">
            <div class="matrix-title">Vehicle Clearance Check:</div>
            ${matrixHtml}
          </div>

          <div class="popup-footer-row">
            <div class="popup-stat">
              <span class="stat-label">Rainfall</span>
              <span class="stat-val">${point.rainfallIntensityMm || 35} mm/hr</span>
            </div>
            <button class="popup-action-btn" onclick="window.floodmateSelectPoint('${point.id}')">
              Full Analytics →
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { minWidth: 280, maxWidth: 320 });
      this.markersLayer.addLayer(marker);
    });
  }

  panTo(lat, lng, zoom = 15) {
    if (this.map) {
      this.map.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  }
}

export const floodMap = new FloodMap();

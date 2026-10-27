/**
 * FloodMate MVP — Main Application Coordinator
 */

import { appState } from "./state.js";
import { floodMap } from "./map.js";
import { evaluatePassability, getFullVehicleMatrix, VEHICLE_CONFIGS } from "./passability.js";
import { getProximityAlerts, calculatePeakForecast, getRecommendedActions } from "./alerts.js";
import { reportEngine, REFERENCE_OBJECTS } from "./report.js";
import { orgEngine } from "./org-dashboard.js";

class FloodMateApp {
  constructor() {
    this.currentTab = "radar-map";
    this.selectedPoint = null;
    this.trendChart = null;
  }

  init() {
    // 1. Initialize Map
    floodMap.init((pointId) => this.showPointDetail(pointId));

    // 2. Setup Global Listeners
    this.setupNavigation();
    this.setupVehicleSelector();
    this.setupAlertsView();
    this.setupReportFlow();
    this.setupOrgDashboard();
    this.setupPointDetailDrawer();
    this.setupQuickDemoSeeds();

    // 3. Expose global helper for Leaflet popups
    window.floodmateSelectPoint = (id) => this.showPointDetail(id);

    // 4. Initial Render
    this.updateGlobalScanBanner();
    this.renderAlerts();
    this.renderOrgDashboard();

    // 5. Subscribe to State
    appState.subscribe("all", () => {
      this.updateGlobalScanBanner();
      this.renderAlerts();
      this.renderOrgDashboard();
    });

    // 6. Listen to map-click event to trigger report
    window.addEventListener("floodmate:map-click", (e) => {
      const { lat, lng } = e.detail;
      this.switchTab("report-flood");
      const roadInput = document.getElementById("report-road");
      if (roadInput && !roadInput.value) {
        roadInput.value = `Street @ ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
      const latInput = document.getElementById("report-lat");
      const lngInput = document.getElementById("report-lng");
      if (latInput) latInput.value = lat.toFixed(5);
      if (lngInput) lngInput.value = lng.toFixed(5);
    });
  }

  setupNavigation() {
    const navButtons = document.querySelectorAll(".nav-tab-btn");
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update nav buttons
    document.querySelectorAll(".nav-tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });

    // Update tab sections
    document.querySelectorAll(".tab-pane").forEach((pane) => {
      pane.classList.toggle("active", pane.id === `tab-${tabName}`);
    });

    // Invalidate map size when switching back to map
    if (tabName === "radar-map" && floodMap.map) {
      setTimeout(() => floodMap.map.invalidateSize(), 150);
    }

    if (tabName === "alerts-forecast") {
      this.renderAlerts();
    } else if (tabName === "org-dashboard") {
      this.renderOrgDashboard();
    }
  }

  setupVehicleSelector() {
    const vehicleButtons = document.querySelectorAll(".vehicle-toggle-btn");
    const current = appState.getActiveVehicle();

    vehicleButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.vehicle === current);
      btn.addEventListener("click", () => {
        const type = btn.dataset.vehicle;
        appState.setActiveVehicle(type);
        vehicleButtons.forEach((b) => b.classList.toggle("active", b.dataset.vehicle === type));
        this.updateGlobalScanBanner();
        this.renderAlerts();
      });
    });
  }

  updateGlobalScanBanner() {
    const points = appState.getPoints();
    const activeVehicle = appState.getActiveVehicle();
    const maxDepth = Math.max(...points.map((p) => p.depthCm), 0);
    const criticalCount = points.filter((p) => evaluatePassability(p.depthCm, activeVehicle).status === "impassable").length;

    const bannerEl = document.getElementById("radar-scan-status");
    if (bannerEl) {
      bannerEl.innerHTML = `
        <div class="radar-pulse-dot"></div>
        <span><strong>RADAR SCAN:</strong> Active in Bangkok Basin &bull; ${points.length} telemetry points &bull; Max depth: <strong>${maxDepth} cm</strong> &bull; Impassable for <em>${VEHICLE_CONFIGS[activeVehicle].name}</em>: <strong style="color: ${criticalCount > 0 ? '#FFB703' : '#2A9D8F'}">${criticalCount} zones</strong></span>
      `;
    }
  }

  /* -------------------------------------------------------------
   * TAB 2: ALERTS & PREDICTIVE FORECASTING
   * ------------------------------------------------------------- */
  setupAlertsView() {
    const addLocForm = document.getElementById("add-location-form");
    if (addLocForm) {
      addLocForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("new-loc-name").value.trim();
        const category = document.getElementById("new-loc-category").value;
        const address = document.getElementById("new-loc-address").value.trim();
        // Default near Sukhumvit area with slight offset
        const lat = 13.738 + (Math.random() - 0.5) * 0.02;
        const lng = 100.565 + (Math.random() - 0.5) * 0.02;

        if (name) {
          appState.addLocation({
            id: `loc_${Date.now()}`,
            name,
            category,
            address: address || "Urban Location",
            lat,
            lng,
            isPrimary: false
          });
          addLocForm.reset();
          this.renderAlerts();
        }
      });
    }
  }

  renderAlerts() {
    const alertsContainer = document.getElementById("alerts-card-list");
    if (!alertsContainer) return;

    const proximityAlerts = getProximityAlerts();
    const activeVehicle = appState.getActiveVehicle();

    if (!proximityAlerts.length) {
      alertsContainer.innerHTML = `<div class="empty-state">No saved coordinates yet. Add your Home, Work, or Car spot below.</div>`;
      return;
    }

    alertsContainer.innerHTML = proximityAlerts
      .map((item) => {
        const { location, nearestPoint, distanceMeters, forecast, passability, actions } = item;

        const isImpassable = passability.status === "impassable";
        const alertBorderClass = isImpassable ? "alert-card-critical" : passability.status === "caution" ? "alert-card-warning" : "alert-card-safe";

        return `
          <div class="alert-card ${alertBorderClass}">
            <div class="alert-card-header">
              <div class="loc-badge-group">
                <span class="loc-cat-tag loc-${location.category}">
                  ${location.category === "home" ? "🏠 HOME" : location.category === "work" ? "🏢 WORK" : "🚗 PARKED CAR"}
                </span>
                <h3 class="alert-loc-title">${location.name}</h3>
                <span class="alert-address">${location.address}</span>
              </div>
              <div class="alert-distance-badge">
                📍 Nearest Flood: <strong>${distanceMeters}m</strong> away (${nearestPoint.name})
              </div>
            </div>

            <!-- Predictive Water Peak Section -->
            <div class="alert-forecast-banner forecast-${forecast.urgency}">
              <div class="forecast-icon">⏱️</div>
              <div class="forecast-body">
                <div class="forecast-topline">
                  <span class="forecast-title">PREDICTED CREST:</span>
                  <span class="forecast-highlight">Water will peak in <strong>${forecast.timeString}</strong> (~${forecast.peakDepthCm} cm)</span>
                </div>
                <div class="forecast-subtitle">${forecast.headline}</div>
              </div>
              <div class="forecast-countdown-pill">
                ${forecast.minutesToPeak > 0 ? `Move Car in &le; ${forecast.minutesToPeak}m` : "Monitoring"}
              </div>
            </div>

            <!-- Vehicle Passability Bar -->
            <div class="passability-bar pass-${passability.status}">
              <span><strong>Vehicle Status (${VEHICLE_CONFIGS[activeVehicle].name}):</strong> ${passability.label}</span>
              <span class="pass-advice">${passability.advice}</span>
            </div>

            <!-- Actionable Emergency Checklist -->
            <div class="actions-checklist">
              <div class="actions-heading">Recommended Immediate Steps:</div>
              <div class="actions-grid">
                ${actions
                  .map(
                    (act) => `
                  <div class="action-item prio-${act.priority.toLowerCase()}">
                    <span class="action-icon">${act.icon}</span>
                    <div class="action-content">
                      <div class="action-title">${act.title}</div>
                      <div class="action-desc">${act.desc}</div>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>

            <div class="alert-card-actions">
              <button class="btn btn-outline" onclick="window.floodmateLocateMap(${location.lat}, ${location.lng})">
                🗺️ Show on Map
              </button>
              <button class="btn btn-primary" onclick="window.floodmateSelectPoint('${nearestPoint.id}')">
                📊 Sensor Breakdown
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    // Expose map locator
    window.floodmateLocateMap = (lat, lng) => {
      this.switchTab("radar-map");
      floodMap.panTo(lat, lng, 16);
    };
  }

  /* -------------------------------------------------------------
   * TAB 3: PHOTO REPORTING & AI ESTIMATION
   * ------------------------------------------------------------- */
  setupReportFlow() {
    const refContainer = document.getElementById("reference-objects-selector");
    if (refContainer) {
      refContainer.innerHTML = REFERENCE_OBJECTS.map(
        (ref) => `
        <label class="ref-radio-card ${ref.id === "ref_hubcap" ? "selected" : ""}" data-ref-id="${ref.id}">
          <input type="radio" name="refObject" value="${ref.id}" ${ref.id === "ref_hubcap" ? "checked" : ""}>
          <div class="ref-card-icon">${ref.icon}</div>
          <div class="ref-card-info">
            <strong>${ref.name}</strong>
            <span>${ref.hint}</span>
          </div>
          <div class="ref-badge">~${ref.estCm} cm</div>
        </label>
      `
      ).join("");

      refContainer.querySelectorAll(".ref-radio-card").forEach((card) => {
        card.addEventListener("click", () => {
          refContainer.querySelectorAll(".ref-radio-card").forEach((c) => c.classList.remove("selected"));
          card.classList.add("selected");
          const radio = card.querySelector("input");
          if (radio) {
            radio.checked = true;
            reportEngine.setReferenceObject(radio.value);
          }
        });
      });
    }

    // Photo Preset Samples & File Upload
    const photoFileInput = document.getElementById("photo-file-input");
    const photoPreview = document.getElementById("photo-preview-img");
    const photoPreviewContainer = document.getElementById("photo-preview-container");
    const photoPlaceholder = document.getElementById("photo-dropzone-placeholder");

    // Quick preset buttons for instant desktop testing
    document.querySelectorAll(".preset-photo-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sampleUrl = btn.dataset.src;
        reportEngine.setPhoto(sampleUrl);
        if (photoPreview && photoPreviewContainer) {
          photoPreview.src = sampleUrl;
          photoPreviewContainer.style.display = "block";
          if (photoPlaceholder) photoPlaceholder.style.display = "none";
        }
      });
    });

    if (photoFileInput) {
      photoFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target.result;
            reportEngine.setPhoto(dataUrl);
            if (photoPreview && photoPreviewContainer) {
              photoPreview.src = dataUrl;
              photoPreviewContainer.style.display = "block";
              if (photoPlaceholder) photoPlaceholder.style.display = "none";
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // AI Verification Submission Flow
    const reportForm = document.getElementById("flood-report-form");
    const aiModal = document.getElementById("ai-scan-modal");
    const aiProgress = document.getElementById("ai-scan-progress");
    const aiStatusText = document.getElementById("ai-scan-status-text");

    if (reportForm) {
      reportForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const roadName = document.getElementById("report-road").value.trim() || "Sukhumvit Street";
        const lat = parseFloat(document.getElementById("report-lat").value) || 13.738;
        const lng = parseFloat(document.getElementById("report-lng").value) || 100.565;
        const notes = document.getElementById("report-notes").value.trim();
        const reporterName = document.getElementById("report-name").value.trim() || "Anonymous Citizen";

        // Show AI Scanning Modal
        if (aiModal) {
          aiModal.classList.add("active");
          if (aiProgress) aiProgress.style.width = "20%";
          if (aiStatusText) aiStatusText.textContent = "Scanning photo geometry and water surface meniscus...";
        }

        setTimeout(() => {
          if (aiProgress) aiProgress.style.width = "65%";
          if (aiStatusText) aiStatusText.textContent = "Detecting reference object landmarks (car wheel rim & curb boundary)...";
        }, 700);

        setTimeout(() => {
          if (aiProgress) aiProgress.style.width = "95%";
          if (aiStatusText) aiStatusText.textContent = "Computing refraction index and true centimeter depth...";
        }, 1200);

        const aiResult = await reportEngine.simulateAiDepthAnalysis(roadName);

        // Hide scanning modal
        if (aiModal) {
          aiModal.classList.remove("active");
        }

        // Submit to state and map
        const newPoint = reportEngine.submitReport({
          roadName,
          lat,
          lng,
          aiResult,
          notes,
          reporterName
        });

        // Show success confirmation & navigate to map
        alert(
          `✅ Report Verified by AI!\n\nLocation: ${newPoint.name}\nEstimated Depth: ${aiResult.estimatedDepthCm} cm (${aiResult.errorMargin})\nConfidence: ${aiResult.confidenceScore}%\nReference: ${aiResult.referenceUsed}\n\nMap has been updated in real-time.`
        );

        reportForm.reset();
        if (photoPreviewContainer) photoPreviewContainer.style.display = "none";
        if (photoPlaceholder) photoPlaceholder.style.display = "flex";

        this.switchTab("radar-map");
        floodMap.panTo(newPoint.lat, newPoint.lng, 16);
      });
    }
  }

  /* -------------------------------------------------------------
   * TAB 4: ORGANIZATION & JURISTIC DASHBOARD
   * ------------------------------------------------------------- */
  setupOrgDashboard() {
    const broadcastForm = document.getElementById("org-broadcast-form");
    if (broadcastForm) {
      broadcastForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("broadcast-title").value.trim();
        const urgency = document.getElementById("broadcast-urgency").value;
        const body = document.getElementById("broadcast-body").value.trim();

        if (title && body) {
          orgEngine.broadcastAlert({ title, urgency, body });
          broadcastForm.reset();
          alert("📢 Emergency Announcement dispatched to resident portal & parking monitors!");
          this.renderOrgDashboard();
        }
      });
    }

    const exportBtn = document.getElementById("export-insurance-pdf-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        orgEngine.exportInsurancePdfDossier();
      });
    }
  }

  renderOrgDashboard() {
    // 1. Render Facility Monitors
    const facilitiesList = document.getElementById("org-facilities-table");
    if (facilitiesList) {
      const facilities = appState.getFacilities();
      facilitiesList.innerHTML = facilities
        .map(
          (f) => `
        <tr class="facility-row status-${f.status}">
          <td>
            <strong>${f.facilityName}</strong>
            <div class="facility-sub">${f.barrierStatus}</div>
          </td>
          <td>
            <div class="facility-depth">
              <span class="depth-highlight">${f.currentWaterCm} cm</span>
              <span class="depth-trend">(${f.riskTrend})</span>
            </div>
          </td>
          <td>${f.criticalThresholdCm} cm</td>
          <td>
            <span class="status-pill pill-${f.status}">${f.status.toUpperCase()}</span>
          </td>
          <td>${f.pumpStatus}</td>
          <td>
            <button class="btn btn-sm btn-outline" onclick="alert('Inspection ticket generated for ${f.facilityName}')">
              Action
            </button>
          </td>
        </tr>
      `
        )
        .join("");
    }

    // 2. Render Incident Audit Logs
    const timelineList = document.getElementById("org-timeline-list");
    if (timelineList) {
      const logs = appState.getTimelineLogs();
      timelineList.innerHTML = logs
        .map(
          (log) => `
        <div class="timeline-entry entry-${log.severity}">
          <div class="timeline-time">${log.timestamp}</div>
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-type">
              <strong>${log.eventType}</strong>
              <span class="timeline-by">&bull; ${log.loggedBy}</span>
            </div>
            <div class="timeline-desc">${log.description}</div>
          </div>
        </div>
      `
        )
        .join("");
    }

    // 3. Render Published Announcements
    const annList = document.getElementById("org-announcements-list");
    if (annList) {
      const list = appState.getAnnouncements();
      annList.innerHTML = list
        .map(
          (a) => `
        <div class="announcement-card ann-${a.urgency.toLowerCase()}">
          <div class="ann-header">
            <span class="ann-badge ${a.urgency === "HIGH" ? "badge-urgent" : "badge-info"}">${a.urgency} ADVISORY</span>
            <span class="ann-time">${a.time}</span>
          </div>
          <h4 class="ann-title">${a.title}</h4>
          <p class="ann-body">${a.body}</p>
          <div class="ann-footer">Dispatched by: ${a.org}</div>
        </div>
      `
        )
        .join("");
    }
  }

  /* -------------------------------------------------------------
   * POINT DETAIL DRAWER & CHART.JS
   * ------------------------------------------------------------- */
  setupPointDetailDrawer() {
    const closeBtn = document.getElementById("close-drawer-btn");
    const drawer = document.getElementById("point-detail-drawer");
    if (closeBtn && drawer) {
      closeBtn.addEventListener("click", () => drawer.classList.remove("open"));
    }
  }

  showPointDetail(pointId) {
    const point = appState.getPointById(pointId);
    if (!point) return;

    this.selectedPoint = point;
    const drawer = document.getElementById("point-detail-drawer");
    if (!drawer) return;

    drawer.classList.add("open");

    document.getElementById("drawer-point-title").textContent = point.name;
    document.getElementById("drawer-depth-cm").textContent = point.depthCm;
    document.getElementById("drawer-trend-text").textContent = `${point.trend.toUpperCase()} (${point.trendRateCmHr > 0 ? "+" : ""}${point.trendRateCmHr || 0} cm/hr)`;
    document.getElementById("drawer-confidence-score").textContent = `${point.confidence}% Verified`;
    document.getElementById("drawer-source-type").textContent = point.sourceType === "sensor" ? `IoT Sensor (${point.sensorId})` : `User Photo (${point.reporterName || "Crowd"})`;
    document.getElementById("drawer-rainfall").textContent = `${point.rainfallIntensityMm || 35} mm/hr`;
    document.getElementById("drawer-notes").textContent = point.notes || "Live street water telemetry logged.";

    // Render Vehicle Matrix in Drawer
    const matrix = getFullVehicleMatrix(point.depthCm);
    const matrixContainer = document.getElementById("drawer-vehicle-matrix");
    if (matrixContainer) {
      matrixContainer.innerHTML = matrix
        .map(
          (m) => `
        <div class="vehicle-clearance-card status-${m.status}">
          <div class="clearance-head">
            <span class="v-icon">${m.icon}</span>
            <strong>${m.name}</strong>
            <span class="v-status">${m.label}</span>
          </div>
          <p class="clearance-advice">${m.advice}</p>
        </div>
      `
        )
        .join("");
    }

    // Render Forecast Ticker
    const forecast = calculatePeakForecast(point);
    const forecastContainer = document.getElementById("drawer-forecast-box");
    if (forecastContainer) {
      forecastContainer.innerHTML = `
        <div class="drawer-forecast-banner forecast-${forecast.urgency}">
          <strong>⏱️ Peak Estimation:</strong> ${forecast.headline}
        </div>
      `;
    }

    // Render Chart.js Trend Curve
    this.renderTrendChart(point);
  }

  renderTrendChart(point) {
    const canvas = document.getElementById("trendChartCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (this.trendChart) {
      this.trendChart.destroy();
    }

    const history = point.history || [
      { time: "18:00", depth: 10 },
      { time: "19:00", depth: 18 },
      { time: "20:00", depth: point.depthCm }
    ];

    const labels = history.map((h) => h.time);
    const dataPoints = history.map((h) => h.depth);

    // Add projected peak forward point
    const forecast = calculatePeakForecast(point);
    if (point.trend === "rising") {
      labels.push("Peak (~" + forecast.timeString + ")");
      dataPoints.push(forecast.peakDepthCm);
    }

    this.trendChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Water Depth (cm)",
            data: dataPoints,
            borderColor: "#0077B6",
            backgroundColor: "rgba(0, 119, 182, 0.15)",
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: dataPoints.map((d, i) => (i === dataPoints.length - 1 && point.trend === "rising" ? "#E63946" : "#0077B6")),
            pointRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Depth: ${context.parsed.y} cm`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Depth (cm)", color: "#64748B" },
            grid: { color: "rgba(100, 116, 139, 0.15)" }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  setupQuickDemoSeeds() {
    const resetBtn = document.getElementById("reset-demo-data-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("Reset all FloodMate state back to default seed telemetry?")) {
          appState.resetToDefaults();
          window.location.reload();
        }
      });
    }
  }
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new FloodMateApp();
  app.init();
});

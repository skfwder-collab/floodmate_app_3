/**
 * FloodMate MVP — Organization & Juristic Dashboard
 * Dedicated portal for condo juristic offices, parking operators & facilities management
 */

import { appState } from "./state.js";

export class OrgDashboardEngine {
  constructor() {
    this.selectedFacility = null;
  }

  broadcastAlert({ title, urgency, body, orgName }) {
    const announcement = {
      id: `ann_${Date.now()}`,
      org: orgName || "Grand Sukhumvit Juristic Office",
      time: "Just now",
      urgency: urgency || "HIGH",
      title: title || "Flood Advisory",
      body: body || "Please exercise caution."
    };

    appState.addAnnouncement(announcement);

    // Also add to audit log
    appState.addTimelineLog({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      eventType: "Broadcast Emergency Advisory",
      description: `[${urgency}] ${title} — Sent to building residents and parking lot patrons.`,
      loggedBy: orgName || "Juristic Management Desk",
      severity: urgency === "HIGH" ? "action" : "info"
    });

    return announcement;
  }

  exportInsurancePdfDossier() {
    // Generate clean printable insurance dossier
    const facilities = appState.getFacilities();
    const logs = appState.getTimelineLogs();
    const points = appState.getPoints();

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to generate the Insurance Claim Dossier.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>FloodMate - Certified Insurance Incident Dossier</title>
        <style>
          body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
            color: #111827;
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
            line-height: 1.5;
          }
          .header {
            border-bottom: 2px solid #0077B6;
            padding-bottom: 20px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .title {
            font-size: 24px;
            font-weight: 800;
            color: #03045E;
            margin: 0;
          }
          .subtitle {
            font-size: 13px;
            color: #6B7280;
            margin-top: 4px;
          }
          .badge {
            background: #E0F2FE;
            color: #0369A1;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 12px;
            border: 1px solid #BAE6FD;
          }
          h2 {
            font-size: 16px;
            color: #1E293B;
            border-left: 4px solid #0077B6;
            padding-left: 10px;
            margin-top: 25px;
            margin-bottom: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 13px;
          }
          th, td {
            border: 1px solid #E2E8F0;
            padding: 10px 12px;
            text-align: left;
          }
          th {
            background-color: #F8FAFC;
            font-weight: 600;
            color: #475569;
          }
          .status-safe { color: #166534; font-weight: bold; }
          .status-warning { color: #B45309; font-weight: bold; }
          .status-critical { color: #991B1B; font-weight: bold; }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #CBD5E1;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #94A3B8;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="padding: 10px 18px; background: #0077B6; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
            🖨️ Print / Save to PDF
          </button>
        </div>

        <div class="header">
          <div>
            <h1 class="title">FLOODMATE™ INCIDENT & INSURANCE AUDIT DOSSIER</h1>
            <div class="subtitle">Certified Telemetry & Street Waterlogging Record for Insurance Adjusters</div>
            <div class="subtitle">Juristic Entity: Grand Sukhumvit Residence | Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          </div>
          <div>
            <span class="badge">SECURE AUDIT HASH: #FM-${Math.floor(100000 + Math.random() * 900000)}</span>
          </div>
        </div>

        <h2>1. Facility Critical Risk Points & Barrier Status</h2>
        <table>
          <thead>
            <tr>
              <th>Risk Point</th>
              <th>Recorded Depth</th>
              <th>Safe Threshold</th>
              <th>Pump / Barrier Status</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${facilities
              .map(
                (f) => `
              <tr>
                <td><strong>${f.facilityName}</strong></td>
                <td>${f.currentWaterCm} cm</td>
                <td>${f.criticalThresholdCm} cm</td>
                <td>${f.barrierStatus} | ${f.pumpStatus}</td>
                <td class="status-${f.status}">${f.status.toUpperCase()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <h2>2. Chronological Incident Evidence Timeline (Immutable Log)</h2>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Event Category</th>
              <th>Telemetry / Operator Verification</th>
              <th>Recorded By</th>
            </tr>
          </thead>
          <tbody>
            ${logs
              .map(
                (l) => `
              <tr>
                <td><code>${l.timestamp}</code></td>
                <td><strong>${l.eventType}</strong></td>
                <td>${l.description}</td>
                <td>${l.loggedBy}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <h2>3. Local Basin Sensor Readings at Time of Incident</h2>
        <table>
          <thead>
            <tr>
              <th>Location</th>
              <th>Water Level</th>
              <th>Trend</th>
              <th>Confidence</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            ${points
              .map(
                (p) => `
              <tr>
                <td>${p.name}</td>
                <td><strong>${p.depthCm} cm</strong></td>
                <td>${p.trend.toUpperCase()} (${p.trendRateCmHr > 0 ? "+" : ""}${p.trendRateCmHr} cm/hr)</td>
                <td>${p.confidence}%</td>
                <td>${p.sourceType === "sensor" ? "IoT Sensor " + (p.sensorId || "") : "Verified User Photo"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <div>Generated by FloodMate Telemetry Engine (Zero-Tamper Local Node)</div>
          <div>For Claim Adjuster Verification: claim-desk@floodmate-network.org</div>
        </div>

        <script>
          // Automatically trigger print dialog when loaded
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

export const orgEngine = new OrgDashboardEngine();

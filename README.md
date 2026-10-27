# 🌊 FloodMate™ — Street-Level Flood Radar & Passability Intelligence

A modern, responsive, zero-build client-side Web MVP designed for deployment on **GitHub Pages**. FloodMate empowers citizens, motorists, and condominium juristic offices to monitor street water depths in real-time, predict water crest times, evaluate vehicle passability, verify depths via photo AI, and audit claims for insurance adjusters.

---

## 🚀 Live Demo & GitHub Pages Deployment

### Quick Deployment to GitHub Pages (2 Minutes)

1. **Initialize Git & Commit**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial FloodMate MVP release"
   git branch -M main
   ```

2. **Connect to your GitHub Repository**:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Navigate to **Settings** > **Pages** (under the "Code and automation" section).
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Choose Branch: `main` and Folder: `/ (root)`.
   - Click **Save**.
   - Your site will be live at: `https://<your-username>.github.io/<your-repo-name>/` within 1–2 minutes!

---

## 🌟 Key Features & Specifications

### 1. Flood Radar Visual Identity
* Deep radar palette (navy `#0B132B`, ocean radar cyan `#48CAE4`, amber caution `#FFB703`, emergency crimson `#E63946`, safe mint `#2A9D8F`).
* Real-time radar scan ticker strip with live telemetry statistics and animated radar pings.

### 2. Real-Time Street-Level Flood Map (Leaflet.js)
* **Depth & Trend**: Precise water depths in centimeters (`cm`), rising/falling trends (`▲ +5.2 cm/hr`), and confidence scores (`94% - Multi-sensor verified`).
* **Dynamic Vehicle Passability Filter**: Toggle between **🛵 Motorcycle** (15 cm limit), **🚗 Sedan** (25 cm limit), and **🚙 SUV** (40 cm limit). Markers and routes automatically recalculate danger levels based on your selected vehicle.
* **Point Detail Slide-Over Drawer**: Integrated with **Chart.js** displaying historical depth readings and predictive crest curves.

### 3. Alerts & Predictive Crest Forecasting
* **Saved Coordinates**: Monitor custom points (Home, Work, Street Parked Car) with proximity calculations.
* **Actionable Peak Warnings**: Computes estimated time to crest (e.g. *"Water will peak in 75 mins (~38 cm). Move car in &le; 75m"*).
* **Emergency Action Checklist**: Step-by-step guidance (flip ground electrical breaker, deploy sandbags, evacuate vehicles).

### 4. Photo-Based Flood Reporting & AI Depth Verification
* **Visual Reference Object Guide**: Standardized cues (Car Tire Rim ~15cm, Hubcap ~28cm, Sidewalk Curb ~18cm, Adult Knee ~45cm).
* **AI Optical Depth Engine Simulator**: Simulated neural scanning with laser line overlay, surface meniscus calculation, and confidence evaluation.
* **Instant Map Injection**: Newly verified reports immediately appear on the live radar map and persist in `LocalStorage`.

### 5. Juristic & Organization Dashboard
* **Critical Facility Monitors**: Real-time status for basement parking ramps (B1-B2), entry gates, and electrical transformer vaults.
* **Emergency Broadcast Advisory**: Send urgent push announcements to connected residents and parking lot vehicles.
* **Incident Evidence Timeline**: Chronological cryptographic ledger tracking all alarms, barrier deployments, and citizen reports.
* **Insurance Claim PDF Dossier**: One-click printable certified report for insurance adjusters.

### 6. Future Enterprise Roadmap
* Clearly marked preview placeholders for:
  * 🔒 *Parametric Insurance Claim API* (instant smart-contract payouts).
  * 🔒 *Property Flood Risk Score (PFRS)* (10-year real estate flood index).
  * 🔒 *Automated IoT Sluice Barrier Protocol* (LoRa mesh hardware).

---

## 🛠️ Architecture & Tech Stack

* **Zero-Build Architecture**: Standard HTML5, CSS3 Custom Properties, and modular ES6 JavaScript. No Node.js build process required.
* **Libraries via CDN**:
  * [Leaflet.js v1.9.4](https://leafletjs.com/) — Interactive mapping with CartoDB Voyager tiles.
  * [Chart.js v4.4.1](https://www.chartjs.org/) — Historical water depth and rain curves.
* **Client-Side State**: Browser `LocalStorage` persistence for all reports, custom coordinates, and juristic audit logs.

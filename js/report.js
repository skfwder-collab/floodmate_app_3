/**
 * FloodMate MVP — Photo-Based Flood Reporting & AI Depth Estimation Simulator
 */

import { appState } from "./state.js";

export const REFERENCE_OBJECTS = [
  {
    id: "ref_tire_rim",
    name: "Passenger Car Tire Rim",
    estCm: 15,
    icon: "🛞",
    hint: "Water touching lower metal wheel rim (approx 15 cm)."
  },
  {
    id: "ref_hubcap",
    name: "Wheel Center Hubcap / Half Tire",
    estCm: 28,
    icon: "🚗",
    hint: "Water covering center axle hubcap (approx 28-30 cm)."
  },
  {
    id: "ref_curb",
    name: "Standard Sidewalk Curb",
    estCm: 18,
    icon: "🧱",
    hint: "Sidewalk curb completely submerged (approx 15-20 cm)."
  },
  {
    id: "ref_knee",
    name: "Adult Knee / Shin Level",
    estCm: 45,
    icon: "🦵",
    hint: "Water reaching adult kneecap level (approx 42-48 cm)."
  }
];

export class FloodReportEngine {
  constructor() {
    this.selectedPhotoData = null;
    this.selectedReferenceId = "ref_hubcap";
  }

  setPhoto(dataUrl) {
    this.selectedPhotoData = dataUrl;
  }

  setReferenceObject(refId) {
    this.selectedReferenceId = refId;
  }

  /**
   * Simulates AI Computer Vision Depth Estimation with realistic micro-variations.
   * Returns a Promise resolving to depth estimation analytics.
   */
  async simulateAiDepthAnalysis(roadName, photoDataUrl) {
    const ref = REFERENCE_OBJECTS.find((r) => r.id === this.selectedReferenceId) || REFERENCE_OBJECTS[1];
    
    // Add realistic jitter (+/- 2 to 3 cm)
    const jitter = Math.floor(Math.random() * 5) - 2;
    const estimatedDepth = Math.max(5, ref.estCm + jitter);
    const confidenceScore = Math.floor(88 + Math.random() * 8); // 88% - 96%
    const errorMargin = "± 2.5 cm";

    // Simulate 1.6s neural processing latency
    await new Promise((resolve) => setTimeout(resolve, 1600));

    return {
      referenceUsed: ref.name,
      estimatedDepthCm: estimatedDepth,
      confidenceScore,
      errorMargin,
      surfaceTurbulence: "Moderate",
      reflectionCorrected: true,
      passabilitySummary: estimatedDepth >= 25 ? "Impassable for sedans" : "Passable with caution"
    };
  }

  /**
   * Finalizes submission, records into LocalStorage, and dispatches to map & alerts.
   */
  submitReport({ roadName, lat, lng, aiResult, notes, reporterName }) {
    const newPoint = {
      id: `crowd_${Date.now()}`,
      name: roadName || "Reported Flood Point",
      lat: Number(lat) || 13.737,
      lng: Number(lng) || 100.565,
      depthCm: aiResult.estimatedDepthCm,
      trend: "rising",
      trendRateCmHr: +3.0,
      confidence: aiResult.confidenceScore,
      sourceType: "crowdsource",
      reporterName: reporterName || "Anonymous Citizen",
      photoUrl: this.selectedPhotoData,
      verifiedByAi: true,
      aiReferenceObject: `${aiResult.referenceUsed} (${aiResult.errorMargin})`,
      updatedAgo: "Just now",
      rainfallIntensityMm: 50,
      roadType: "Street / Soi",
      notes: notes || "User photo verified via FloodMate AI Depth Engine.",
      history: [
        { time: "Current", depth: aiResult.estimatedDepthCm }
      ]
    };

    // Store in global state
    appState.addPoint(newPoint);

    // Also record an incident log for organizational insurance record
    appState.addTimelineLog({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      eventType: "Citizen Verified Report",
      description: `${roadName}: ${aiResult.estimatedDepthCm} cm detected using ${aiResult.referenceUsed} (AI Confidence: ${aiResult.confidenceScore}%).`,
      loggedBy: reporterName || "Citizen Reporter",
      severity: aiResult.estimatedDepthCm > 25 ? "warning" : "info"
    });

    return newPoint;
  }
}

export const reportEngine = new FloodReportEngine();

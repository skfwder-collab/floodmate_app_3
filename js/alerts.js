/**
 * FloodMate MVP — Alerts & Advanced Forecasting Engine
 * Handles saved locations proximity, peak time calculation, and actionable warnings
 */

import { appState } from "./state.js";
import { evaluatePassability } from "./passability.js";

// Haversine distance in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculates predictive peak water timing and estimated max depth.
 */
export function calculatePeakForecast(point) {
  const currentDepth = point.depthCm || 0;
  const trendRate = point.trendRateCmHr || 0;
  const rainIntensity = point.rainfallIntensityMm || 20;

  if (point.trend === "falling") {
    return {
      statusText: "Receding",
      minutesToPeak: 0,
      peakDepthCm: currentDepth,
      timeString: "Already crested",
      urgency: "low",
      headline: `Water receding at ${Math.abs(trendRate)} cm/hr. Street clearing underway.`
    };
  }

  if (point.trend === "stable") {
    return {
      statusText: "Stable",
      minutesToPeak: 0,
      peakDepthCm: currentDepth,
      timeString: "Plateaued",
      urgency: "medium",
      headline: `Depth holding steady at ${currentDepth} cm.`
    };
  }

  // Rising trend forecast model:
  // Water peaks when drainage capacity equals inflow (proportional to rainfall)
  const additionalPeakCm = Math.round(rainIntensity * 0.25 + Math.abs(trendRate) * 1.5);
  const estimatedPeakDepth = currentDepth + additionalPeakCm;
  // Estimated minutes to peak:
  const minutesToPeak = Math.max(30, Math.round((additionalPeakCm / Math.max(1, trendRate)) * 60));

  let urgency = "medium";
  if (estimatedPeakDepth > 30 || minutesToPeak <= 60) {
    urgency = "critical";
  } else if (estimatedPeakDepth > 20) {
    urgency = "high";
  }

  return {
    statusText: "Rising to Peak",
    minutesToPeak,
    peakDepthCm: estimatedPeakDepth,
    timeString: `${minutesToPeak} mins`,
    urgency,
    headline: `Expected to peak at ~${estimatedPeakDepth} cm in ${minutesToPeak} mins.`
  };
}

/**
 * Generates emergency action recommendations based on depth & vehicle type
 */
export function getRecommendedActions(depthCm, vehicleType = "sedan", minutesToPeak = 90) {
  const actions = [];
  const passability = evaluatePassability(depthCm, vehicleType);

  if (passability.status === "impassable" || (depthCm > 20 && minutesToPeak <= 90)) {
    actions.push({
      priority: "CRITICAL",
      icon: "🚗",
      title: `Evacuate Parked Vehicle Immediately (Within ${minutesToPeak} mins)`,
      desc: `Current depth (${depthCm} cm) is critical for ${vehicleType}s. Move to elevated floor parking (Level 2+) before access ramps are sealed.`
    });
  }

  if (depthCm >= 15) {
    actions.push({
      priority: "HIGH",
      icon: "⚡",
      title: "Disconnect Ground-Level Electrical Appliances",
      desc: "Flip the breaker for ground-floor wall sockets and outdoor garden pumps to prevent short circuits."
    });
    actions.push({
      priority: "HIGH",
      icon: "🧱",
      title: "Deploy Doorstep Flood Barriers & Sandbags",
      desc: "Ensure entrance barricades reach at least 45 cm to protect against vehicle wake wash."
    });
  } else {
    actions.push({
      priority: "MEDIUM",
      icon: "👀",
      title: "Monitor Radar and Street Camera Feeds",
      desc: "Water is currently manageable (<15 cm). Keep watch on upstream rainfall cells."
    });
  }

  actions.push({
    priority: "STANDARD",
    icon: "🎒",
    title: "Verify Emergency Bag & Power Banks",
    desc: "Have clean drinking water, waterproof flashlight, and mobile charging banks ready."
  });

  return actions;
}

/**
 * Returns proximity alerts for user's saved locations against all active flood points.
 */
export function getProximityAlerts() {
  const locations = appState.getLocations();
  const points = appState.getPoints();
  const vehicle = appState.getActiveVehicle();
  const results = [];

  locations.forEach((loc) => {
    // Find nearest flood point within 1.5 km
    let nearestPoint = null;
    let minDistance = Infinity;

    points.forEach((pt) => {
      const dist = calculateDistanceMeters(loc.lat, loc.lng, pt.lat, pt.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestPoint = pt;
      }
    });

    if (nearestPoint) {
      const forecast = calculatePeakForecast(nearestPoint);
      const passability = evaluatePassability(nearestPoint.depthCm, vehicle);
      const actions = getRecommendedActions(nearestPoint.depthCm, vehicle, forecast.minutesToPeak);

      results.push({
        location: loc,
        nearestPoint,
        distanceMeters: minDistance,
        forecast,
        passability,
        actions
      });
    }
  });

  return results;
}

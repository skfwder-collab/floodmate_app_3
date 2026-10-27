/**
 * FloodMate MVP — State Management & LocalStorage Persistence
 */

import {
  INITIAL_LOCATIONS,
  INITIAL_FLOOD_POINTS,
  INITIAL_ORG_FACILITIES,
  INITIAL_TIMELINE_LOGS,
  SAMPLE_ANNOUNCEMENTS
} from "./mock-data.js";

const STORAGE_KEYS = {
  POINTS: "floodmate_points_v1",
  LOCATIONS: "floodmate_locations_v1",
  FACILITIES: "floodmate_facilities_v1",
  LOGS: "floodmate_timeline_logs_v1",
  ANNOUNCEMENTS: "floodmate_announcements_v1",
  ACTIVE_VEHICLE: "floodmate_active_vehicle_v1"
};

export class AppState {
  constructor() {
    this.listeners = new Map();
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.POINTS)) {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(INITIAL_FLOOD_POINTS));
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(INITIAL_LOCATIONS));
    localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(INITIAL_ORG_FACILITIES));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_TIMELINE_LOGS));
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(SAMPLE_ANNOUNCEMENTS));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_VEHICLE, "sedan");
    this.notify("all");
  }

  // --- FLOOD POINTS ---
  getPoints() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.POINTS)) || [];
    } catch {
      return INITIAL_FLOOD_POINTS;
    }
  }

  getPointById(id) {
    return this.getPoints().find((p) => p.id === id);
  }

  addPoint(newPoint) {
    const points = this.getPoints();
    points.unshift(newPoint);
    localStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(points));
    this.notify("points", points);
    return newPoint;
  }

  // --- SAVED LOCATIONS (Home, Work, Car) ---
  getLocations() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS)) || [];
    } catch {
      return INITIAL_LOCATIONS;
    }
  }

  addLocation(location) {
    const locations = this.getLocations();
    locations.push(location);
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    this.notify("locations", locations);
  }

  // --- VEHICLE FILTER ---
  getActiveVehicle() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_VEHICLE) || "sedan";
  }

  setActiveVehicle(vehicleType) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_VEHICLE, vehicleType);
    this.notify("vehicle", vehicleType);
  }

  // --- ORGANIZATION DASHBOARD ---
  getFacilities() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FACILITIES)) || [];
    } catch {
      return INITIAL_ORG_FACILITIES;
    }
  }

  getTimelineLogs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS)) || [];
    } catch {
      return INITIAL_TIMELINE_LOGS;
    }
  }

  addTimelineLog(log) {
    const logs = this.getTimelineLogs();
    logs.unshift(log);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    this.notify("logs", logs);
  }

  getAnnouncements() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) || [];
    } catch {
      return SAMPLE_ANNOUNCEMENTS;
    }
  }

  addAnnouncement(announcement) {
    const list = this.getAnnouncements();
    list.unshift(announcement);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
    this.notify("announcements", list);
  }

  // --- EVENT PUB/SUB ---
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  notify(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => cb(data));
    }
    if (event !== "all" && this.listeners.has("all")) {
      this.listeners.get("all").forEach((cb) => cb({ event, data }));
    }
  }
}

export const appState = new AppState();

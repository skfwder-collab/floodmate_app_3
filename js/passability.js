/**
 * FloodMate MVP — Vehicle Passability Engine
 * Evaluates water depth vs vehicle clearance safety thresholds
 */

export const VEHICLE_CONFIGS = {
  motorcycle: {
    type: "motorcycle",
    name: "Motorcycle / Scooter",
    icon: "🛵",
    safeLimitCm: 10,
    cautionLimitCm: 15, // Above 15cm is dangerous for exhaust & intake
    criticalLimitCm: 20,
    guidance: "Air intake and exhaust pipes risk water ingestion above 15 cm. Low traction risk on wet curbs."
  },
  sedan: {
    type: "sedan",
    name: "Sedan / Hatchback",
    icon: "🚗",
    safeLimitCm: 15,
    cautionLimitCm: 25, // Door sills & standard exhaust ~20-25cm
    criticalLimitCm: 35,
    guidance: "Door seal infiltration begins at 20-25 cm. Hydro-lock risk if air filter submerged."
  },
  suv: {
    type: "suv",
    name: "SUV / Pickup Truck",
    icon: "🚙",
    safeLimitCm: 25,
    cautionLimitCm: 40, // High ground clearance ~35-40cm
    criticalLimitCm: 50,
    guidance: "High clearance handles up to 40 cm safely at low speeds. Beware of hidden open manholes."
  }
};

/**
 * Returns passability evaluation for a given depth and vehicle type.
 * @param {number} depthCm
 * @param {'motorcycle' | 'sedan' | 'suv'} vehicleType
 * @returns {{ status: 'safe'|'caution'|'impassable', label: string, color: string, badgeBg: string, advice: string }}
 */
export function evaluatePassability(depthCm, vehicleType = "sedan") {
  const config = VEHICLE_CONFIGS[vehicleType] || VEHICLE_CONFIGS.sedan;

  if (depthCm < config.safeLimitCm) {
    return {
      status: "safe",
      label: "Passable",
      color: "#2A9D8F", // emerald
      badgeBg: "rgba(42, 157, 143, 0.18)",
      advice: `Clear to pass. Depth (${depthCm} cm) is well under the ${config.safeLimitCm} cm threshold.`
    };
  } else if (depthCm <= config.cautionLimitCm) {
    return {
      status: "caution",
      label: "Caution Advised",
      color: "#FFB703", // amber
      badgeBg: "rgba(255, 183, 3, 0.18)",
      advice: `Drive very slowly in low gear. Water is approaching clearance boundary (${depthCm} cm). Avoid bow waves.`
    };
  } else {
    return {
      status: "impassable",
      label: "Impassable / Do Not Enter",
      color: "#E63946", // crimson
      badgeBg: "rgba(230, 57, 70, 0.2)",
      advice: `CRITICAL: Severe risk of engine hydro-lock and floating. Do not attempt crossing (${depthCm} cm > ${config.cautionLimitCm} cm limit).`
    };
  }
}

/**
 * Summary breakdown for all 3 vehicle types for a given depth.
 */
export function getFullVehicleMatrix(depthCm) {
  return Object.keys(VEHICLE_CONFIGS).map((type) => {
    const config = VEHICLE_CONFIGS[type];
    const evaluation = evaluatePassability(depthCm, type);
    return {
      type,
      name: config.name,
      icon: config.icon,
      ...evaluation
    };
  });
}

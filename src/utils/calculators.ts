export type SupplyPhase = 'single-230v' | 'three-400v';

export interface CircuitSizingInput {
  watts: number;
  phase: SupplyPhase;
  distanceMeters: number;
}

export interface CircuitSizingResult {
  currentAmps: number;
  recommendedMcbAmps: number;
  recommendedCableMm2: string;
  cableNote: string;
}

const STANDARD_MCB_RATINGS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100];

export function calculateCircuitSizing({
  watts,
  phase,
  distanceMeters,
}: CircuitSizingInput): CircuitSizingResult {
  const safeWatts = Math.max(100, watts);
  const safeDistance = Math.max(1, distanceMeters);
  const powerFactor = 0.85;

  const rawAmps =
    phase === 'single-230v'
      ? safeWatts / (230 * powerFactor)
      : safeWatts / (Math.sqrt(3) * 400 * powerFactor);

  const currentAmps = Math.round(rawAmps * 10) / 10;
  const designAmps = currentAmps * 1.15;

  const recommendedMcbAmps =
    STANDARD_MCB_RATINGS.find((rating) => rating >= designAmps) ?? 100;

  // Step up cable gauge one size for long runs over 35m to manage voltage drop
  const longRunPenalty = safeDistance > 35 ? 1 : 0;

  const cableTiers: { maxMcb: number; size: string; note: string }[] = [
    { maxMcb: 10, size: '1.5 mm²', note: 'Lighting circuits (SLS 733 copper)' },
    { maxMcb: 20, size: '2.5 mm²', note: '13A radial / ring sockets (SLS 733)' },
    { maxMcb: 32, size: '4.0 mm²', note: 'Heavy appliance / water heater spur' },
    { maxMcb: 40, size: '6.0 mm²', note: 'Main kitchen / pump / sub-feed' },
    { maxMcb: 63, size: '10.0 mm²', note: 'Main distribution incomer (TPN/SPN)' },
    { maxMcb: 100, size: '16.0 mm²', note: '100A heavy estate / workshop feeder' },
  ];

  const baseIdx = cableTiers.findIndex((tier) => recommendedMcbAmps <= tier.maxMcb);
  const resolvedIdx = Math.min(
    cableTiers.length - 1,
    (baseIdx === -1 ? cableTiers.length - 1 : baseIdx) + longRunPenalty
  );
  const chosen = cableTiers[resolvedIdx];

  return {
    currentAmps,
    recommendedMcbAmps,
    recommendedCableMm2: chosen.size,
    cableNote:
      longRunPenalty > 0
        ? `${chosen.note} · upsized for >35m run`
        : chosen.note,
  };
}

export interface PaintCalcInput {
  areaSqm: number;
  coats: number;
}

export interface PaintCalcResult {
  totalAreaSqm: number;
  litresNeeded: number;
  drums10L: number;
  buckets4L: number;
}

export function calculatePaintRequirement({
  areaSqm,
  coats,
}: PaintCalcInput): PaintCalcResult {
  const safeArea = Math.max(1, areaSqm);
  const safeCoats = Math.max(1, Math.min(4, Math.round(coats)));
  const coveragePerLitre = 12; // 12 m² per litre per coat (Weather-Shield emulsion)

  const totalAreaSqm = Math.round(safeArea * safeCoats * 10) / 10;
  const litresNeeded = Math.ceil((totalAreaSqm / coveragePerLitre) * 10) / 10;

  let drums10L = Math.floor(litresNeeded / 10);
  const remainder = litresNeeded - drums10L * 10;
  let buckets4L = 0;

  if (remainder > 8) {
    drums10L += 1;
  } else if (remainder > 0) {
    buckets4L = Math.ceil(remainder / 4);
  }

  return {
    totalAreaSqm,
    litresNeeded,
    drums10L,
    buckets4L,
  };
}

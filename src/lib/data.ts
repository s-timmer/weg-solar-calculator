// === System sizing knots ===
export const SYSTEM_SIZES = [
  { kWp: 30, roofArea: 200, panels: 72, annualOutput: 28500, totalCost: 43500, afterSubsidy: 36500, costPerKWp: 1450 },
  { kWp: 39, roofArea: 260, panels: 94, annualOutput: 37050, totalCost: 51600, afterSubsidy: 44600, costPerKWp: 1323 },
  { kWp: 45, roofArea: 300, panels: 108, annualOutput: 42750, totalCost: 57000, afterSubsidy: 50000, costPerKWp: 1267 },
] as const;

// === Battery knots ===
export const BATTERY_OPTIONS = [
  { kWh: 0, sc30: 0.50, sc39: 0.47, costLow: 0, costHigh: 0 },
  { kWh: 20, sc30: 0.58, sc39: 0.54, costLow: 10000, costHigh: 14000 },
  { kWh: 30, sc30: 0.63, sc39: 0.60, costLow: 14000, costHigh: 18000 },
  { kWh: 40, sc30: 0.66, sc39: 0.63, costLow: 18000, costHigh: 22000 },
] as const;

// === Rates (€/kWh) ===
export const RATES = {
  selfConsumedBehindMeter: 0.29, // §42b
  selfConsumedEnergySharing: 0.16, // §42c
  feedInExcess: 0.071,
  feedInFull: 0.11,
} as const;

// === Building constants ===
export const BUILDING = {
  totalMEA: 7791.53,
  avgApartmentMEA: 300,
  totalUnits: 26,
  avgConsumptionPerUnit: 2000, // kWh/year
} as const;

// === Supply model baseline values at 30 kWp ===
export const SUPPLY_MODELS_BASE = {
  volleinspeisung: { selfConsumedValue: 0, feedInValue: 3140, opex: 500 },
  par42b: { selfConsumedValue: 4130, feedInValue: 1010, opex: 500 },
  par42c: { selfConsumedValue: 2980, feedInValue: 1010, opex: 500 },
} as const;

export type SupplyModel = 'volleinspeisung' | 'par42b' | 'par42c';

// === Interpolation helpers ===

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function piecewiseLinear(knots: readonly { x: number; y: number }[], x: number): number {
  if (x <= knots[0].x) return knots[0].y;
  if (x >= knots[knots.length - 1].x) return knots[knots.length - 1].y;
  for (let i = 0; i < knots.length - 1; i++) {
    if (x >= knots[i].x && x <= knots[i + 1].x) {
      const t = (x - knots[i].x) / (knots[i + 1].x - knots[i].x);
      return lerp(knots[i].y, knots[i + 1].y, t);
    }
  }
  return knots[knots.length - 1].y;
}

export interface InterpolatedSystem {
  kWp: number;
  roofArea: number;
  panels: number;
  annualOutput: number;
  totalCost: number;
  afterSubsidy: number;
  costPerKWp: number;
}

export function interpolateSystem(kWp: number): InterpolatedSystem {
  const knots = SYSTEM_SIZES;
  const roofArea = piecewiseLinear(knots.map(k => ({ x: k.kWp, y: k.roofArea })), kWp);
  const panels = Math.round(piecewiseLinear(knots.map(k => ({ x: k.kWp, y: k.panels })), kWp));
  const annualOutput = Math.round(piecewiseLinear(knots.map(k => ({ x: k.kWp, y: k.annualOutput })), kWp));
  const totalCost = Math.round(piecewiseLinear(knots.map(k => ({ x: k.kWp, y: k.totalCost })), kWp));
  const afterSubsidy = Math.round(piecewiseLinear(knots.map(k => ({ x: k.kWp, y: k.afterSubsidy })), kWp));
  const costPerKWp = Math.round(totalCost / kWp);

  return { kWp, roofArea: Math.round(roofArea), panels, annualOutput, totalCost, afterSubsidy, costPerKWp };
}

export function interpolateBatterySelfConsumption(batteryKWh: number, systemKWp: number): number {
  const sc30Knots = BATTERY_OPTIONS.map(b => ({ x: b.kWh, y: b.sc30 }));
  const sc39Knots = BATTERY_OPTIONS.map(b => ({ x: b.kWh, y: b.sc39 }));

  const sc30 = piecewiseLinear(sc30Knots, batteryKWh);
  const sc39 = piecewiseLinear(sc39Knots, batteryKWh);

  // Linear interpolation/extrapolation between 30 and 39 kWp
  const t = (systemKWp - 30) / (39 - 30);
  const sc = lerp(sc30, sc39, t);
  return Math.max(0.35, Math.min(0.90, sc)); // clamp
}

export function interpolateBatteryCost(batteryKWh: number): number {
  const costKnots = BATTERY_OPTIONS.map(b => ({ x: b.kWh, y: (b.costLow + b.costHigh) / 2 }));
  return Math.round(piecewiseLinear(costKnots, batteryKWh));
}

// === PMT (monthly loan payment) ===
function pmt(monthlyRate: number, numPayments: number, principal: number): number {
  if (monthlyRate === 0) return principal / numPayments;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
}

// === Main computation ===

export interface AppState {
  systemKWp: number;
  supplyModel: SupplyModel;
  batteryKWh: number;
  includeSubsidy: boolean;
  financingMethod: 'sonderumlage' | 'kfw' | 'contracting';
  apartmentMEA: number;
  kfwRate: number;
  loanYears: number;
  priceIncrease: number;
}

export interface ComputedData {
  system: InterpolatedSystem;
  displayCost: number;
  batteryCost: number;
  totalInvestment: number;
  selfConsumption: number;
  selfConsumedKWh: number;
  excessKWh: number;
  annualRevenue: number;
  annualOpex: number;
  annualNetSavings: number;
  contractingAnnualSavings: number;
  meaShare: number;
  perApartmentCost: number;
  perApartmentAnnualSavings: number;
  perApartmentMonthlySavings: number;
  monthlyLoanPayment: number;
  netMonthlyCashFlow: number;
  paybackYears: number;
  projection25yr: { year: number; annualSavings: number; annualCost: number; cumulative: number }[];
  profit25yr: number;
  supplyModelComparison: {
    model: SupplyModel;
    revenue: number;
    netSavings: number;
  }[];
}

export function computeAll(state: AppState): ComputedData {
  const system = interpolateSystem(state.systemKWp);
  const displayCost = state.includeSubsidy ? system.afterSubsidy : system.totalCost;
  const batteryCost = interpolateBatteryCost(state.batteryKWh);
  const batteryCostAfterSubsidy = state.includeSubsidy ? Math.round(batteryCost * 0.5) : batteryCost;
  const totalInvestment = displayCost + batteryCostAfterSubsidy;

  // Self-consumption
  const selfConsumption = state.supplyModel === 'volleinspeisung'
    ? 0
    : interpolateBatterySelfConsumption(state.batteryKWh, state.systemKWp);
  const selfConsumedKWh = Math.round(system.annualOutput * selfConsumption);
  const excessKWh = system.annualOutput - selfConsumedKWh;

  // Revenue calculation
  let annualRevenue: number;
  if (state.supplyModel === 'volleinspeisung') {
    annualRevenue = system.annualOutput * RATES.feedInFull;
  } else if (state.supplyModel === 'par42b') {
    annualRevenue = selfConsumedKWh * RATES.selfConsumedBehindMeter + excessKWh * RATES.feedInExcess;
  } else {
    annualRevenue = selfConsumedKWh * RATES.selfConsumedEnergySharing + excessKWh * RATES.feedInExcess;
  }
  annualRevenue = Math.round(annualRevenue);

  // Opex scales with system size
  const annualOpex = Math.round(500 * (state.systemKWp / 30));
  const annualNetSavings = annualRevenue - annualOpex;

  // Contracting: operator keeps ~70% of savings, WEG gets ~30% but pays nothing upfront
  const contractingAnnualSavings = Math.round(annualNetSavings * 0.3);

  // Per apartment
  const meaShare = state.apartmentMEA / BUILDING.totalMEA;
  const effectiveSavings = state.financingMethod === 'contracting' ? contractingAnnualSavings : annualNetSavings;
  const perApartmentCost = state.financingMethod === 'contracting' ? 0 : Math.round(totalInvestment * meaShare);
  const perApartmentAnnualSavings = effectiveSavings * meaShare;
  const perApartmentMonthlySavings = perApartmentAnnualSavings / 12;

  // Loan
  const monthlyRate = state.kfwRate / 100 / 12;
  const numPayments = state.loanYears * 12;
  const monthlyLoanPayment = state.financingMethod === 'kfw'
    ? pmt(monthlyRate, numPayments, perApartmentCost)
    : 0;
  const netMonthlyCashFlow = perApartmentMonthlySavings - monthlyLoanPayment;

  // Payback
  const effectiveInvestment = state.financingMethod === 'contracting' ? 0 : totalInvestment;
  const paybackYears = effectiveSavings > 0 && effectiveInvestment > 0 ? effectiveInvestment / effectiveSavings : state.financingMethod === 'contracting' ? 0 : 99;

  // 25-year projection
  const projection25yr: ComputedData['projection25yr'] = [];
  let cumulative = -effectiveInvestment;
  for (let year = 1; year <= 25; year++) {
    const priceMultiplier = Math.pow(1 + state.priceIncrease / 100, year - 1);
    let yearRevenue: number;
    if (state.supplyModel === 'volleinspeisung') {
      yearRevenue = system.annualOutput * RATES.feedInFull;
    } else if (state.supplyModel === 'par42b') {
      yearRevenue = selfConsumedKWh * RATES.selfConsumedBehindMeter * priceMultiplier + excessKWh * RATES.feedInExcess;
    } else {
      yearRevenue = selfConsumedKWh * RATES.selfConsumedEnergySharing * priceMultiplier + excessKWh * RATES.feedInExcess;
    }
    if (state.financingMethod === 'contracting') yearRevenue *= 0.3;
    const yearOpex = state.financingMethod === 'contracting' ? 0 : annualOpex;
    const inverterReplacement = (year === 15 && state.financingMethod !== 'contracting') ? 4000 : 0;
    const yearSavings = yearRevenue - yearOpex - inverterReplacement;
    cumulative += yearSavings;
    projection25yr.push({
      year,
      annualSavings: Math.round(yearSavings),
      annualCost: Math.round(yearOpex + inverterReplacement),
      cumulative: Math.round(cumulative),
    });
  }
  const profit25yr = Math.round(cumulative);

  // Compare all 3 supply models
  const supplyModelComparison = (['volleinspeisung', 'par42b', 'par42c'] as SupplyModel[]).map(model => {
    const sc = model === 'volleinspeisung' ? 0 : interpolateBatterySelfConsumption(state.batteryKWh, state.systemKWp);
    const scKWh = system.annualOutput * sc;
    const exKWh = system.annualOutput - scKWh;
    let rev: number;
    if (model === 'volleinspeisung') {
      rev = system.annualOutput * RATES.feedInFull;
    } else if (model === 'par42b') {
      rev = scKWh * RATES.selfConsumedBehindMeter + exKWh * RATES.feedInExcess;
    } else {
      rev = scKWh * RATES.selfConsumedEnergySharing + exKWh * RATES.feedInExcess;
    }
    return {
      model,
      revenue: Math.round(rev),
      netSavings: Math.round(rev - annualOpex),
    };
  });

  return {
    system,
    displayCost,
    batteryCost: batteryCostAfterSubsidy,
    totalInvestment,
    selfConsumption,
    selfConsumedKWh,
    excessKWh,
    annualRevenue,
    annualOpex,
    annualNetSavings,
    contractingAnnualSavings,
    meaShare,
    perApartmentCost,
    perApartmentAnnualSavings,
    perApartmentMonthlySavings,
    monthlyLoanPayment,
    netMonthlyCashFlow,
    paybackYears,
    projection25yr,
    profit25yr,
    supplyModelComparison,
  };
}

export type ClientTier = "student" | "business";

interface ServiceSpec {
  studentBaseMin: number;
  studentBaseMax: number;
  businessBaseMin: number;
  businessBaseMax: number;
  baseDays: number;
}

const BASE_RATES: Record<string, ServiceSpec> = {
  web_development: {
    studentBaseMin: 800000,
    studentBaseMax: 1500000,
    businessBaseMin: 2500000,
    businessBaseMax: 6000000,
    baseDays: 7,
  },
  game_development: {
    studentBaseMin: 900000,
    studentBaseMax: 1800000,
    businessBaseMin: 3500000,
    businessBaseMax: 8000000,
    baseDays: 10,
  },
  system_custom: {
    studentBaseMin: 850000,
    studentBaseMax: 1600000,
    businessBaseMin: 3000000,
    businessBaseMax: 7000000,
    baseDays: 8,
  },
  qa_tester_bugfix: {
    studentBaseMin: 400000,
    studentBaseMax: 900000,
    businessBaseMin: 1200000,
    businessBaseMax: 2500000,
    baseDays: 3,
  },
  other: {
    studentBaseMin: 500000,
    studentBaseMax: 1200000,
    businessBaseMin: 1500000,
    businessBaseMax: 4000000,
    baseDays: 4,
  },
};

export function calculateEstimate(
  category: string,
  featureCount: number,
  hasDb: boolean,
  urgency: string,
  tier: ClientTier = "student",
) {
  const spec = BASE_RATES[category] || BASE_RATES.other;

  const featureRate = tier === "student" ? 100000 : 350000;
  const dbRate = tier === "student" ? 200000 : 700000;

  let min =
    (tier === "student" ? spec.studentBaseMin : spec.businessBaseMin) +
    featureCount * featureRate;
  let max =
    (tier === "student" ? spec.studentBaseMax : spec.businessBaseMax) +
    featureCount * featureRate * 1.3;
  let days = spec.baseDays + featureCount * 1.2;

  if (hasDb) {
    min += dbRate;
    max += dbRate * 1.2;
    days += 2;
  }

  if (urgency === "rush") {
    min *= 1.25;
    max *= 1.25;
    days = Math.max(3, Math.round(days * 0.7));
  } else if (urgency === "urgent") {
    min *= 1.5;
    max *= 1.5;
    days = Math.max(2, Math.round(days * 0.5));
  }

  return {
    priceMin: Math.round(min),
    priceMax: Math.round(max),
    days: Math.round(days),
  };
}

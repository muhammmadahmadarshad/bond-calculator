/**
 * Bond calculation business logic (pure functions).
 */

export type CouponFrequency = 1 | 2;

export interface BondFormValues {
  faceValue: number;
  annualCouponRate: number;
  marketPrice: number;
  yearsToMaturity: number;
  couponFrequency: CouponFrequency;
}

export interface BondCalculationResults {
  currentYield: number;
  ytm: number;
  totalInterestEarned: number;
  priceStatus: 'premium' | 'discount' | 'par';
}

export interface CashFlowRow {
  period: number;
  paymentDate: string;
  couponPayment: number;
  cumulativeInterest: number;
  remainingPrincipal: number;
}

const MAX_ITERATIONS = 1000;
const YTM_TOLERANCE = 1e-8;

function annualCouponDollars(faceValue: number, annualCouponRatePct: number): number {
  return faceValue * (annualCouponRatePct / 100);
}

export function calculateCurrentYield(
  faceValue: number,
  annualCouponRate: number,
  marketPrice: number,
): number {
  if (marketPrice <= 0) return 0;
  return annualCouponDollars(faceValue, annualCouponRate) / marketPrice;
}

function bondPriceAtYield(
  couponPerPeriod: number,
  faceValue: number,
  periods: number,
  yieldPerPeriod: number,
): number {
  if (yieldPerPeriod <= -1) return Infinity;
  let pv = 0;
  for (let t = 1; t <= periods; t++) {
    pv += couponPerPeriod / Math.pow(1 + yieldPerPeriod, t);
  }
  pv += faceValue / Math.pow(1 + yieldPerPeriod, periods);
  return pv;
}

function bondPriceDerivativeAtYield(
  couponPerPeriod: number,
  faceValue: number,
  periods: number,
  yieldPerPeriod: number,
): number {
  if (yieldPerPeriod <= -1) return 0;
  let dv = 0;
  const r = 1 + yieldPerPeriod;
  for (let t = 1; t <= periods; t++) {
    dv -= (t * couponPerPeriod) / Math.pow(r, t + 1);
  }
  dv -= (periods * faceValue) / Math.pow(r, periods + 1);
  return dv;
}

export function calculateYTM(
  faceValue: number,
  annualCouponRate: number,
  marketPrice: number,
  yearsToMaturity: number,
  couponFrequency: CouponFrequency,
): number {
  const periods = yearsToMaturity * couponFrequency;
  const couponPerPeriod = annualCouponDollars(faceValue, annualCouponRate) / couponFrequency;

  if (periods <= 0) return 0;

  let y = 0.05;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const p = bondPriceAtYield(couponPerPeriod, faceValue, periods, y);
    const diff = marketPrice - p;
    if (Math.abs(diff) < YTM_TOLERANCE) break;
    const dp = bondPriceDerivativeAtYield(couponPerPeriod, faceValue, periods, y);
    if (Math.abs(dp) < 1e-12) break;
    y = y + diff / dp;
    if (y <= -1) y = 0.01;
    if (y > 10) y = 0.5;
  }

  if (couponFrequency === 1) return y;
  return Math.pow(1 + y, 2) - 1;
}

export function totalInterestEarned(
  faceValue: number,
  annualCouponRate: number,
  yearsToMaturity: number,
  couponFrequency: CouponFrequency,
): number {
  const periods = yearsToMaturity * couponFrequency;
  const couponPerPeriod = annualCouponDollars(faceValue, annualCouponRate) / couponFrequency;
  return periods * couponPerPeriod;
}

export function getPriceStatus(
  marketPrice: number,
  faceValue: number,
): 'premium' | 'discount' | 'par' {
  if (marketPrice > faceValue) return 'premium';
  if (marketPrice < faceValue) return 'discount';
  return 'par';
}

export function generateCashFlows(
  faceValue: number,
  annualCouponRate: number,
  yearsToMaturity: number,
  couponFrequency: CouponFrequency,
  settlementDate: Date = new Date(),
): CashFlowRow[] {
  const periods = yearsToMaturity * couponFrequency;
  const couponPerPeriod = annualCouponDollars(faceValue, annualCouponRate) / couponFrequency;
  const monthsPerPeriod = 12 / couponFrequency;

  const rows: CashFlowRow[] = [];
  let cumulativeInterest = 0;

  for (let t = 1; t <= periods; t++) {
    const paymentDate = new Date(settlementDate);
    paymentDate.setMonth(paymentDate.getMonth() + t * monthsPerPeriod);
    cumulativeInterest += couponPerPeriod;
    const remainingPrincipal = t < periods ? faceValue : 0;
    rows.push({
      period: t,
      paymentDate: paymentDate.toISOString().slice(0, 10),
      couponPayment: couponPerPeriod,
      cumulativeInterest,
      remainingPrincipal,
    });
  }
  return rows;
}

export function runBondCalculation(values: BondFormValues): {
  results: BondCalculationResults;
  cashFlows: CashFlowRow[];
} {
  const currentYield = calculateCurrentYield(
    values.faceValue,
    values.annualCouponRate,
    values.marketPrice,
  );
  const ytm = calculateYTM(
    values.faceValue,
    values.annualCouponRate,
    values.marketPrice,
    values.yearsToMaturity,
    values.couponFrequency,
  );
  const totalInterestEarnedVal = totalInterestEarned(
    values.faceValue,
    values.annualCouponRate,
    values.yearsToMaturity,
    values.couponFrequency,
  );
  const priceStatus = getPriceStatus(values.marketPrice, values.faceValue);
  const cashFlows = generateCashFlows(
    values.faceValue,
    values.annualCouponRate,
    values.yearsToMaturity,
    values.couponFrequency,
  );
  return {
    results: {
      currentYield,
      ytm,
      totalInterestEarned: totalInterestEarnedVal,
      priceStatus,
    },
    cashFlows,
  };
}

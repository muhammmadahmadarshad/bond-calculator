/**
 * Bond calculation business logic (pure functions).
 * Structured for easy migration to NestJS backend.
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

/**
 * Annual coupon payment in dollars.
 */
function annualCouponDollars(faceValue: number, annualCouponRatePct: number): number {
  return faceValue * (annualCouponRatePct / 100);
}

/**
 * Current Yield = (annual coupon) / market price.
 */
export function calculateCurrentYield(
  faceValue: number,
  annualCouponRate: number,
  marketPrice: number
): number {
  if (marketPrice <= 0) return 0;
  return annualCouponDollars(faceValue, annualCouponRate) / marketPrice;
}

/**
 * Bond price given per-period yield (for YTM solver).
 * P = sum_{t=1}^{n} (C/(1+y)^t) + F/(1+y)^n
 */
function bondPriceAtYield(
  couponPerPeriod: number,
  faceValue: number,
  periods: number,
  yieldPerPeriod: number
): number {
  if (yieldPerPeriod <= -1) return Infinity;
  let pv = 0;
  for (let t = 1; t <= periods; t++) {
    pv += couponPerPeriod / Math.pow(1 + yieldPerPeriod, t);
  }
  pv += faceValue / Math.pow(1 + yieldPerPeriod, periods);
  return pv;
}

/**
 * Derivative of bond price w.r.t. yield (for Newton-Raphson).
 * dP/dy = -sum_{t=1}^{n} t*C/(1+y)^{t+1} - n*F/(1+y)^{n+1}
 */
function bondPriceDerivativeAtYield(
  couponPerPeriod: number,
  faceValue: number,
  periods: number,
  yieldPerPeriod: number
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

/**
 * Yield to Maturity: solve P = bondPriceAtYield(y) for y, then annualize.
 * Uses Newton-Raphson. Annual: y is already annual. Semi-annual: annual YTM = (1+y)^2 - 1.
 */
export function calculateYTM(
  faceValue: number,
  annualCouponRate: number,
  marketPrice: number,
  yearsToMaturity: number,
  couponFrequency: CouponFrequency
): number {
  const periods = yearsToMaturity * couponFrequency;
  const couponPerPeriod = annualCouponDollars(faceValue, annualCouponRate) / couponFrequency;

  if (periods <= 0) return 0;

  let y = 0.05; // initial guess 5% per period
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

  if (couponFrequency === 1) {
    return y;
  }
  return Math.pow(1 + y, 2) - 1;
}

/**
 * Total interest (coupons only) over bond life. Bullet: no principal until maturity.
 */
export function totalInterestEarned(
  faceValue: number,
  annualCouponRate: number,
  yearsToMaturity: number,
  couponFrequency: CouponFrequency
): number {
  const periods = yearsToMaturity * couponFrequency;
  const couponPerPeriod = annualCouponDollars(faceValue, annualCouponRate) / couponFrequency;
  return periods * couponPerPeriod;
}

/**
 * Premium / Discount / Par from market price vs face value.
 */
export function getPriceStatus(marketPrice: number, faceValue: number): 'premium' | 'discount' | 'par' {
  if (marketPrice > faceValue) return 'premium';
  if (marketPrice < faceValue) return 'discount';
  return 'par';
}

/**
 * Generate cash flow schedule (bullet bond: principal only at final period).
 */
export function generateCashFlows(
  faceValue: number,
  annualCouponRate: number,
  yearsToMaturity: number,
  couponFrequency: CouponFrequency,
  settlementDate: Date = new Date()
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

/**
 * Run full bond calculation from form values.
 */
export function runBondCalculation(values: BondFormValues): {
  results: BondCalculationResults;
  cashFlows: CashFlowRow[];
} {
  const currentYield = calculateCurrentYield(
    values.faceValue,
    values.annualCouponRate,
    values.marketPrice
  );
  const ytm = calculateYTM(
    values.faceValue,
    values.annualCouponRate,
    values.marketPrice,
    values.yearsToMaturity,
    values.couponFrequency
  );
  const totalInterestEarned_val = totalInterestEarned(
    values.faceValue,
    values.annualCouponRate,
    values.yearsToMaturity,
    values.couponFrequency
  );
  const priceStatus = getPriceStatus(values.marketPrice, values.faceValue);
  const cashFlows = generateCashFlows(
    values.faceValue,
    values.annualCouponRate,
    values.yearsToMaturity,
    values.couponFrequency
  );

  return {
    results: {
      currentYield,
      ytm,
      totalInterestEarned: totalInterestEarned_val,
      priceStatus,
    },
    cashFlows,
  };
}

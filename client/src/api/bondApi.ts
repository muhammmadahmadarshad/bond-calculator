/**
 * Bond calculation API client.
 * Base URL from env: VITE_API_URL (default http://localhost:3000)
 */

export interface BondFormValues {
  faceValue: number
  annualCouponRate: number
  marketPrice: number
  yearsToMaturity: number
  couponFrequency: 1 | 2
}

export interface BondCalculationResults {
  currentYield: number
  ytm: number
  totalInterestEarned: number
  priceStatus: 'premium' | 'discount' | 'par'
}

export interface CashFlowRow {
  period: number
  paymentDate: string
  couponPayment: number
  cumulativeInterest: number
  remainingPrincipal: number
}

export interface BondCalculationResponse {
  results: BondCalculationResults
  cashFlows: CashFlowRow[]
}

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL
  if (url !== undefined && url !== '') return url
  return 'http://localhost:3000'
}

export async function calculateBond(
  body: BondFormValues
): Promise<BondCalculationResponse> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/bond/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    let message = `Request failed: ${res.status}`
    try {
      const json = JSON.parse(text)
      if (json.message) message = Array.isArray(json.message) ? json.message.join(', ') : json.message
    } catch {
      if (text) message = text
    }
    throw new Error(message)
  }
  return res.json() as Promise<BondCalculationResponse>
}

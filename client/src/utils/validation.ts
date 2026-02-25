import type { BondFormValues } from '../api/bondApi.ts'

export function validateBondForm(values: BondFormValues): boolean {
  return (
    values.faceValue > 0 &&
    values.annualCouponRate >= 0 &&
    values.marketPrice > 0 &&
    values.yearsToMaturity > 0
  )
}

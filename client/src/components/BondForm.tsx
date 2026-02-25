import { useCallback } from 'react'
import type { BondFormValues } from '../api/bondApi.ts'
import './BondForm.css'

type CouponFrequency = 1 | 2

type BondFormProps = {
  form: BondFormValues
  onUpdate: <K extends keyof BondFormValues>(key: K, value: BondFormValues[K]) => void
  onSubmit: (e: React.FormEvent) => void
  isValid: boolean
  loading?: boolean
}

export function BondForm({ form, onUpdate, onSubmit, isValid, loading = false }: BondFormProps) {
  const update = useCallback(
    <K extends keyof BondFormValues>(key: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const raw = e.target.value
      const value = key === 'couponFrequency' ? (Number(raw) as CouponFrequency) : Number(raw)
      onUpdate(key, value as BondFormValues[K])
    },
    [onUpdate]
  )

  return (
    <form onSubmit={onSubmit} className="bond-form">
      <div className="bond-form__field">
        <label htmlFor="faceValue">Face value ($)</label>
        <input
          id="faceValue"
          type="number"
          min="0"
          step="1"
          value={form.faceValue}
          onChange={update('faceValue')}
        />
      </div>
      <div className="bond-form__field">
        <label htmlFor="annualCouponRate">Annual coupon rate (%)</label>
        <input
          id="annualCouponRate"
          type="number"
          min="0"
          step="0.01"
          value={form.annualCouponRate}
          onChange={update('annualCouponRate')}
        />
      </div>
      <div className="bond-form__field">
        <label htmlFor="marketPrice">Market price ($)</label>
        <input
          id="marketPrice"
          type="number"
          min="0"
          step="0.01"
          value={form.marketPrice}
          onChange={update('marketPrice')}
        />
      </div>
      <div className="bond-form__field">
        <label htmlFor="yearsToMaturity">Years to maturity</label>
        <input
          id="yearsToMaturity"
          type="number"
          min="0"
          step="0.5"
          value={form.yearsToMaturity}
          onChange={update('yearsToMaturity')}
        />
      </div>
      <div className="bond-form__field">
        <label htmlFor="couponFrequency">Coupon frequency</label>
        <select
          id="couponFrequency"
          value={form.couponFrequency}
          onChange={update('couponFrequency')}
        >
          <option value={1}>Annual</option>
          <option value={2}>Semi-annual</option>
        </select>
      </div>
      <button type="submit" className="bond-form__submit" disabled={!isValid || loading}>
        {loading ? 'Calculating…' : 'Calculate'}
      </button>
    </form>
  )
}

import type { BondCalculationResults } from '../api/bondApi.ts'
import { formatPercent, formatCurrency } from '../utils/format.ts'
import './BondResults.css'

type BondResultsProps = {
  results: BondCalculationResults
}

const PREMIUM_DISCOUNT_LABELS: Record<string, string> = {
  premium: 'Trading above face value',
  discount: 'Trading below face value',
  par: 'Trading at par',
}

export function BondResults({ results }: BondResultsProps) {
  const indicatorLabel = PREMIUM_DISCOUNT_LABELS[results.priceStatus] ?? results.priceStatus

  return (
    <section className="bond-results">
      <h2 className="bond-results__title">Results</h2>
      <dl className="bond-results__grid">
        <dt>Current yield</dt>
        <dd>{formatPercent(results.currentYield)}</dd>
        <dt>Yield to Maturity (YTM)</dt>
        <dd>{formatPercent(results.ytm)}</dd>
        <dt>Total interest earned over the bond</dt>
        <dd>{formatCurrency(results.totalInterestEarned)}</dd>
        <dt>Premium or discount indicator</dt>
        <dd>
          <span className={`bond-results__status bond-results__status--${results.priceStatus}`}>
            {indicatorLabel}
          </span>
        </dd>
      </dl>
    </section>
  )
}

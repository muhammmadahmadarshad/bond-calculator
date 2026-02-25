import type { BondCalculationResults } from '../lib/bondCalculations.ts'
import { formatPercent, formatCurrency } from '../utils/format.ts'
import './BondResults.css'

type BondResultsProps = {
  results: BondCalculationResults
}

export function BondResults({ results }: BondResultsProps) {
  const statusLabel =
    results.priceStatus.charAt(0).toUpperCase() + results.priceStatus.slice(1)

  return (
    <section className="bond-results">
      <h2 className="bond-results__title">Results</h2>
      <dl className="bond-results__grid">
        <dt>Current yield</dt>
        <dd>{formatPercent(results.currentYield)}</dd>
        <dt>Yield to maturity (YTM)</dt>
        <dd>{formatPercent(results.ytm)}</dd>
        <dt>Total interest earned</dt>
        <dd>{formatCurrency(results.totalInterestEarned)}</dd>
        <dt>Price status</dt>
        <dd>
          <span className={`bond-results__status bond-results__status--${results.priceStatus}`}>
            {statusLabel}
          </span>
        </dd>
      </dl>
    </section>
  )
}

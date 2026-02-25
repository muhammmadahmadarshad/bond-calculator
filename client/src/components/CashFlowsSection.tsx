import { CashFlowTable } from './CashFlowTable.tsx'
import type { CashFlowRow } from '../lib/bondCalculations.ts'
import './CashFlowsSection.css'

type CashFlowsSectionProps = {
  rows: CashFlowRow[]
}

export function CashFlowsSection({ rows }: CashFlowsSectionProps) {
  return (
    <section className="cashflows-section">
      <h2 className="cashflows-section__title">Cash flow schedule</h2>
      <CashFlowTable rows={rows} />
    </section>
  )
}

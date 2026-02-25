import type { CashFlowRow } from '../api/bondApi.ts'
import { formatCurrency } from '../utils/format.ts'
import './CashFlowTable.css'

type CashFlowTableProps = {
  rows: CashFlowRow[]
}

export function CashFlowTable({ rows }: CashFlowTableProps) {
  return (
    <div className="cashflow-wrap">
      <table className="cashflow-table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Payment date</th>
            <th>Coupon payment</th>
            <th>Cumulative interest</th>
            <th>Remaining principal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.period}>
              <td>{row.period}</td>
              <td>{row.paymentDate}</td>
              <td>{formatCurrency(row.couponPayment)}</td>
              <td>{formatCurrency(row.cumulativeInterest)}</td>
              <td>{formatCurrency(row.remainingPrincipal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

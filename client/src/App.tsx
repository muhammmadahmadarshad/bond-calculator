import { useState, useCallback } from 'react'
import {
  type BondFormValues,
  type BondCalculationResponse,
  calculateBond,
} from './api/bondApi.ts'
import { validateBondForm } from './utils/validation.ts'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { Header } from './components/Header.tsx'
import { BondForm } from './components/BondForm.tsx'
import { BondResults } from './components/BondResults.tsx'
import { CashFlowsSection } from './components/CashFlowsSection.tsx'
import './App.css'

const INITIAL_FORM: BondFormValues = {
  faceValue: 1000,
  annualCouponRate: 5,
  marketPrice: 950,
  yearsToMaturity: 10,
  couponFrequency: 2,
}

export default function App() {
  const [form, setForm] = useState<BondFormValues>(INITIAL_FORM)
  const [calculation, setCalculation] = useState<BondCalculationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = validateBondForm(form)

  const updateForm = useCallback(<K extends keyof BondFormValues>(key: K, value: BondFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!isValid) return
      setLoading(true)
      setError(null)
      try {
        const data = await calculateBond(form)
        setCalculation(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Calculation failed')
      } finally {
        setLoading(false)
      }
    },
    [form, isValid]
  )

  return (
    <ThemeProvider>
      <div className="app">
        <div className="app__container">
          <Header />
          <BondForm
            form={form}
            onUpdate={updateForm}
            onSubmit={handleSubmit}
            isValid={isValid}
            loading={loading}
          />
          {error && <p className="app__error" role="alert">{error}</p>}
          {calculation && (
            <>
              <BondResults results={calculation.results} />
              <CashFlowsSection rows={calculation.cashFlows} />
            </>
          )}
        </div>
      </div>
    </ThemeProvider>
  )
}

import { useState, useCallback } from 'react'
import type { BondFormValues } from './lib/bondCalculations.ts'
import { runBondCalculation } from './lib/bondCalculations.ts'
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
  const [calculation, setCalculation] = useState<ReturnType<typeof runBondCalculation> | null>(null)

  const isValid = validateBondForm(form)

  const updateForm = useCallback(<K extends keyof BondFormValues>(key: K, value: BondFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!isValid) return
      setCalculation(runBondCalculation(form))
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
          />
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

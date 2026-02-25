import { useTheme } from '../contexts/ThemeContext.tsx'
import './Header.css'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="header">
      <h1 className="header__title">Bond Calculator</h1>
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <span className="theme-toggle__icon" aria-hidden>☀️</span>
        ) : (
          <span className="theme-toggle__icon" aria-hidden>🌙</span>
        )}
      </button>
    </header>
  )
}

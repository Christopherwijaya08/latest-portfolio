import { useState } from 'react'
import { flushSync } from 'react-dom'
import { reduceMotion } from '../hooks'

// The initial class is set by the inline script in index.html, before first paint.
export function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = !dark
    const apply = () => {
      flushSync(() => setDark(next))
      document.documentElement.classList.toggle('dark', next)
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light')
      } catch {
        // Private mode can block storage; the theme still applies for this visit.
      }
    }

    if (!document.startViewTransition || reduceMotion) return apply()
    // The new theme grows as a circle from the button.
    const r = e.currentTarget.getBoundingClientRect()
    document.documentElement.style.setProperty('--tx', `${r.left + r.width / 2}px`)
    document.documentElement.style.setProperty('--ty', `${r.top + r.height / 2}px`)
    document.startViewTransition(apply)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className="grid size-8 place-items-center rounded-full text-body ring-1 ring-hairline transition-colors hover:bg-canvas-soft-2 hover:text-ink"
    >
      {dark ? (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
      )}
    </button>
  )
}

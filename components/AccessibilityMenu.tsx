'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Preferences = {
  largeText: boolean
  highContrast: boolean
  underlineLinks: boolean
  reduceMotion: boolean
}

const defaults: Preferences = {
  largeText: false,
  highContrast: false,
  underlineLinks: false,
  reduceMotion: false,
}

export default function AccessibilityMenu() {
  const [open, setOpen] = useState(false)
  const [preferences, setPreferences] = useState<Preferences>(defaults)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('homeoffer-accessibility')
      if (saved) setPreferences({ ...defaults, ...JSON.parse(saved) })
    } catch {
      // Accessibility controls remain usable if storage is unavailable.
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('a11y-large-text', preferences.largeText)
    root.classList.toggle('a11y-high-contrast', preferences.highContrast)
    root.classList.toggle('a11y-underline-links', preferences.underlineLinks)
    root.classList.toggle('a11y-reduce-motion', preferences.reduceMotion)

    try {
      window.localStorage.setItem('homeoffer-accessibility', JSON.stringify(preferences))
    } catch {
      // Preferences still apply for the current visit.
    }
  }, [preferences])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  function toggle(key: keyof Preferences) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }))
  }

  return (
    <div className="accessibility-widget">
      {open && (
        <div
          ref={panelRef}
          id="accessibility-panel"
          className="accessibility-panel"
          role="region"
          aria-label="Accessibility options"
        >
          <div className="accessibility-panel-heading">
            <div>
              <p className="accessibility-eyebrow">Display options</p>
              <h2>Accessibility</h2>
            </div>
            <button className="accessibility-close" onClick={() => setOpen(false)} aria-label="Close accessibility options">
              ×
            </button>
          </div>

          <div className="accessibility-options">
            <button aria-pressed={preferences.largeText} onClick={() => toggle('largeText')}>
              <span aria-hidden="true">A+</span>
              Larger text
            </button>
            <button aria-pressed={preferences.highContrast} onClick={() => toggle('highContrast')}>
              <span aria-hidden="true">◐</span>
              High contrast
            </button>
            <button aria-pressed={preferences.underlineLinks} onClick={() => toggle('underlineLinks')}>
              <span aria-hidden="true">U</span>
              Underline links
            </button>
            <button aria-pressed={preferences.reduceMotion} onClick={() => toggle('reduceMotion')}>
              <span aria-hidden="true">▶</span>
              Reduce motion
            </button>
          </div>

          <button className="accessibility-reset" onClick={() => setPreferences(defaults)}>
            Reset options
          </button>
          <Link className="accessibility-statement-link" href="/accessibility">
            Accessibility statement
          </Link>
        </div>
      )}

      <button
        className="accessibility-trigger"
        type="button"
        aria-label="Open accessibility options"
        aria-expanded={open}
        aria-controls="accessibility-panel"
        onClick={() => setOpen((current) => !current)}
      >
        <svg viewBox="0 0 48 48" role="img" aria-hidden="true">
          <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="24" cy="12.5" r="3.5" fill="currentColor" />
          <path d="M13 19.5c7.2 2.3 14.8 2.3 22 0M24 20.5v18M24 26l-8.5 11M24 26l8.5 11" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Accessibility</span>
      </button>
    </div>
  )
}

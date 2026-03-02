'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './DestinationAutocomplete.module.css'

interface Suggestion {
  label: string
  countryCode: string
}

interface Props {
  value: string
  onChange: (value: string, countryCode: string) => void
  error?: string
}

export default function DestinationAutocomplete({ value, onChange, error }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch suggestions after debounce — clearing short values is handled in the input handler
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 2) return

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/destinations/autocomplete?q=${encodeURIComponent(value)}`)
        if (!res.ok) return
        const data: Suggestion[] = await res.json()
        const q = value.toLowerCase()
        const sorted = [...data].sort((a, b) => {
          const aMatch = a.label.toLowerCase().startsWith(q) ? 0 : 1
          const bMatch = b.label.toLowerCase().startsWith(q) ? 0 : 1
          return aMatch - bMatch
        })
        setSuggestions(sorted)
        setOpen(sorted.length > 0)
        setHighlighted(-1)
      } catch {
        // silently ignore network errors
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value])

  // Close on click outside
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  function select(s: Suggestion) {
    onChange(s.label, s.countryCode)
    setSuggestions([])
    setOpen(false)
    setHighlighted(-1)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val, '')
    if (val.length < 2) {
      setSuggestions([])
      setOpen(false)
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault()
      select(suggestions[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Tokyo, Japan"
          autoComplete="off"
          aria-autocomplete="list"
          className={`w-full rounded-lg border bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text-3)] outline-none focus:ring-2 focus:ring-[var(--accent-s)] ${loading ? 'pr-10' : ''} ${
            error
              ? 'border-[var(--error)] focus:border-[var(--error)]'
              : 'border-[var(--border)] focus:border-[var(--border-hi)]'
          }`}
        />
        {loading && <span className={styles.spinner} />}
      </div>
      {open && suggestions.length > 0 && (
        <ul role="listbox" className={styles.dropdown}>
          {suggestions.map((s, i) => (
            <li
              key={`${s.label}-${i}`}
              role="option"
              aria-selected={i === highlighted}
              className={`${styles.option} ${i === highlighted ? styles.optionHighlighted : ''}`}
              onMouseDown={() => select(s)}
              onMouseEnter={() => setHighlighted(i)}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'SGD', 'CHF']

// Local date string YYYY-MM-DD using the browser's timezone
function todayLocalStr() {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

interface FormErrors {
  destination?: string
  start_date?: string
  end_date?: string
  traveler_count?: string
  form?: string
}

export default function TripForm() {
  const router = useRouter()
  const [destination, setDestination] = useState('')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [travelerCount, setTravelerCount] = useState(1)
  const [budget, setBudget] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [visibility, setVisibility] = useState<'private' | 'unlisted' | 'public'>('private')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function validate(): FormErrors {
    const errs: FormErrors = {}
    const today = todayLocalStr()

    if (!destination.trim()) {
      errs.destination = 'Destination is required'
    }

    if (!startDate) {
      errs.start_date = 'Start date is required'
    } else if (startDate < today) {
      errs.start_date = 'Start date cannot be in the past'
    }

    if (!endDate) {
      errs.end_date = 'End date is required'
    } else if (startDate && endDate < startDate) {
      errs.end_date = 'End date must be on or after start date'
    } else if (startDate && endDate) {
      const diffDays = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
      if (diffDays > 13) errs.end_date = 'Trip must be 14 days or shorter'
    }

    if (travelerCount < 1) {
      errs.traveler_count = 'At least 1 traveler required'
    }

    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setErrors({})
    setSubmitting(true)

    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: destination.trim(),
        title:        title.trim() || null,
        start_date:   startDate,
        end_date:     endDate,
        traveler_count: travelerCount,
        budget_total: budget ? Number(budget) : null,
        currency,
        visibility,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setErrors({ form: data.error ?? 'Something went wrong. Please try again.' })
      setSubmitting(false)
      return
    }

    const { trip } = await res.json()
    router.push(`/trips/${trip.id}`)
  }

  const today = todayLocalStr()

  const inputClass =
    'mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text-3)] outline-none focus:border-[var(--border-hi)] focus:ring-2 focus:ring-[var(--accent-s)]'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Destination */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)]">
          Destination <span className="text-[var(--error)]">*</span>
        </label>
        <input
          type="text"
          value={destination}
          onChange={e => setDestination(e.target.value)}
          placeholder="e.g. Tokyo, Japan"
          className={inputClass}
        />
        {errors.destination && (
          <p className="mt-1.5 text-xs text-[var(--error)]">{errors.destination}</p>
        )}
      </div>

      {/* Trip name */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)]">
          Trip name{' '}
          <span className="font-normal text-[var(--text-3)]">— optional</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Anniversary trip"
          className={inputClass}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text)]">
            Start date <span className="text-[var(--error)]">*</span>
          </label>
          <input
            type="date"
            value={startDate}
            min={today}
            onChange={e => {
              setStartDate(e.target.value)
              // Reset end date if it's now before the new start
              if (endDate && endDate < e.target.value) setEndDate('')
            }}
            className={inputClass}
          />
          {errors.start_date && (
            <p className="mt-1.5 text-xs text-[var(--error)]">{errors.start_date}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text)]">
            End date <span className="text-[var(--error)]">*</span>
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate || today}
            onChange={e => setEndDate(e.target.value)}
            className={inputClass}
          />
          {errors.end_date && (
            <p className="mt-1.5 text-xs text-[var(--error)]">{errors.end_date}</p>
          )}
        </div>
      </div>

      {/* Travelers */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)]">
          Travelers <span className="text-[var(--error)]">*</span>
        </label>
        <input
          type="number"
          min={1}
          max={20}
          value={travelerCount}
          onChange={e => setTravelerCount(Math.max(1, Number(e.target.value)))}
          className="mt-1.5 w-28 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--border-hi)] focus:ring-2 focus:ring-[var(--accent-s)]"
        />
        {errors.traveler_count && (
          <p className="mt-1.5 text-xs text-[var(--error)]">{errors.traveler_count}</p>
        )}
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)]">
          Total budget{' '}
          <span className="font-normal text-[var(--text-3)]">— optional</span>
        </label>
        <div className="mt-1.5 flex gap-2">
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--border-hi)] focus:ring-2 focus:ring-[var(--accent-s)]"
          >
            {CURRENCIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            step="1"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            placeholder="e.g. 3000"
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text-3)] outline-none focus:border-[var(--border-hi)] focus:ring-2 focus:ring-[var(--accent-s)]"
          />
        </div>
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)]">
          Visibility
        </label>
        <select
          value={visibility}
          onChange={e => setVisibility(e.target.value as 'private' | 'unlisted' | 'public')}
          className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--border-hi)] focus:ring-2 focus:ring-[var(--accent-s)]"
        >
          <option value="private">Private (only you)</option>
          <option value="unlisted">Unlisted (share link only)</option>
          <option value="public">Public (discoverable in Explore)</option>
        </select>
      </div>

      {errors.form && (
        <p className="text-sm text-[var(--error)]">{errors.form}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-[var(--cta)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--cta-h)] disabled:opacity-50"
      >
        {submitting ? 'Creating trip…' : 'Create trip'}
      </button>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FieldError, FieldLabel, FormInput, FormSelect } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import DestinationAutocomplete from './DestinationAutocomplete'

function formatWithCommas(value: string | number): string {
  if (value === '' || value === undefined) return ''
  const n = typeof value === 'string' ? Number(value) : value
  return isNaN(n) ? String(value) : n.toLocaleString()
}

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
  const [countryCode, setCountryCode] = useState('')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [travelerCount, setTravelerCount] = useState(1)
  const [budget, setBudget] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'unlisted' | 'public'>('private')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function validate(): FormErrors {
    const errs: FormErrors = {}
    const today = todayLocalStr()

    if (!destination.trim()) errs.destination = 'Destination is required'

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

    if (travelerCount < 1) errs.traveler_count = 'At least 1 traveler required'

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
        country_code: countryCode || null,
        title: title.trim() || null,
        start_date: startDate,
        end_date: endDate,
        traveler_count: travelerCount,
        budget_total: budget ? Number(budget) : null,
        currency: 'USD',
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <FieldLabel optionalHint="optional">Trip name</FieldLabel>
        <FormInput
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Anniversary trip"
        />
      </div>

      <div>
        <FieldLabel required>Destination</FieldLabel>
        <DestinationAutocomplete
          value={destination}
          onChange={(val, cc) => { setDestination(val); setCountryCode(cc) }}
          error={errors.destination}
        />
        <FieldError message={errors.destination} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Start date</FieldLabel>
          <FormInput
            type="date"
            value={startDate}
            min={today}
            onChange={e => {
              setStartDate(e.target.value)
              if (endDate && endDate < e.target.value) setEndDate('')
            }}
          />
          <FieldError message={errors.start_date} />
        </div>
        <div>
          <FieldLabel required>End date</FieldLabel>
          <FormInput
            type="date"
            value={endDate}
            min={startDate || today}
            onChange={e => setEndDate(e.target.value)}
          />
          <FieldError message={errors.end_date} />
        </div>
      </div>

      <div>
        <FieldLabel required>Travelers</FieldLabel>
        <FormInput
          type="text"
          inputMode="numeric"
          value={formatWithCommas(travelerCount)}
          onChange={e => {
            const raw = parseInt(e.target.value.replace(/,/g, ''), 10)
            if (!isNaN(raw)) setTravelerCount(Math.max(1, Math.min(20, raw)))
          }}
          className="w-28"
        />
        <FieldError message={errors.traveler_count} />
      </div>

      <div>
        <FieldLabel optionalHint="optional">Total budget</FieldLabel>
        <div className="mt-1.5 flex rounded-lg border border-[var(--border)] bg-[var(--bg-card)] focus-within:border-[var(--border-hi)] focus-within:ring-2 focus-within:ring-[var(--accent-s)]">
          <span className="flex items-center pl-4 pr-2 text-sm text-[var(--text-3)] select-none">$</span>
          <input
            type="text"
            inputMode="numeric"
            value={budget ? formatWithCommas(budget) : ''}
            onChange={e => setBudget(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="e.g. 3,000"
            className="flex-1 rounded-r-lg bg-transparent py-2.5 pr-4 text-sm text-[var(--text)] placeholder-[var(--text-3)] outline-none"
          />
        </div>
      </div>

      <div>
        <FieldLabel>Visibility</FieldLabel>
        <FormSelect
          value={visibility}
          onChange={e => setVisibility(e.target.value as 'private' | 'unlisted' | 'public')}
        >
          <option value="private">Private (only you)</option>
          <option value="unlisted">Unlisted (share link only)</option>
          <option value="public">Public (discoverable in Explore)</option>
        </FormSelect>
      </div>

      {errors.form && (
        <p className="text-sm text-[var(--error)]">{errors.form}</p>
      )}

      <Button type="submit" disabled={submitting} size="lg" className="w-full">
        {submitting ? 'Creating trip...' : 'Create trip'}
      </Button>
    </form>
  )
}

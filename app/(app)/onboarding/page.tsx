'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { TravelStyle, TravelPreferences } from '@/lib/types'

const INTERESTS: { value: string; label: string }[] = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'art', label: 'Art & Museums' },
  { value: 'nature', label: 'Nature & Parks' },
  { value: 'history', label: 'History & Culture' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'adventure', label: 'Adventure & Sports' },
  { value: 'beaches', label: 'Beaches' },
]

const DIETARY: { value: string; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'gluten-free', label: 'Gluten-free' },
  { value: 'dairy-free', label: 'Dairy-free' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [pace, setPace] = useState<TravelStyle['pace']>('medium')
  const [budget, setBudget] = useState<TravelStyle['budget']>('mid')
  const [interests, setInterests] = useState<string[]>([])
  const [dietary, setDietary] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleItem(list: string[], item: string, setter: (v: string[]) => void) {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const travel_style: TravelStyle = { pace, budget, interests }
    const preferences: TravelPreferences = { dietary }

    // Only update — the profiles row was created by the auth callback.
    // Never upsert here; this only sets fields that onboarding owns. (Data Integrity Rule 1)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ travel_style, preferences, onboarded: true })
      .eq('id', user.id)

    if (updateError) {
      setError('Something went wrong. Please try again.')
      setSaving(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-12 px-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">ando</h1>
          <p className="mt-2 text-[var(--text-2)]">Tell us how you like to travel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Travel pace */}
          <fieldset>
            <legend className="text-sm font-medium text-[var(--text)]">Travel pace</legend>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {([
                { value: 'slow', label: 'Slow', sub: '2–3 things/day' },
                { value: 'medium', label: 'Balanced', sub: '3–4 things/day' },
                { value: 'fast', label: 'Packed', sub: '5+ things/day' },
              ] as const).map(opt => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer flex-col items-center rounded-lg border p-4 text-center transition-colors ${
                    pace === opt.value
                      ? 'border-[var(--cta)] bg-[var(--cta)] text-white'
                      : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] hover:border-[var(--border-hi)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="pace"
                    value={opt.value}
                    checked={pace === opt.value}
                    onChange={() => setPace(opt.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className={`mt-1 text-xs ${pace === opt.value ? 'text-[var(--text-3)]' : 'text-[var(--text-3)]'}`}>
                    {opt.sub}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Budget level */}
          <fieldset>
            <legend className="text-sm font-medium text-[var(--text)]">Budget level</legend>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {([
                { value: 'budget', label: 'Budget', sub: 'Hostels & street food' },
                { value: 'mid', label: 'Mid-range', sub: 'Hotels & restaurants' },
                { value: 'luxury', label: 'Luxury', sub: 'Five-star everything' },
              ] as const).map(opt => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer flex-col items-center rounded-lg border p-4 text-center transition-colors ${
                    budget === opt.value
                      ? 'border-[var(--cta)] bg-[var(--cta)] text-white'
                      : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] hover:border-[var(--border-hi)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="budget"
                    value={opt.value}
                    checked={budget === opt.value}
                    onChange={() => setBudget(opt.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className={`mt-1 text-xs ${budget === opt.value ? 'text-[var(--text-3)]' : 'text-[var(--text-3)]'}`}>
                    {opt.sub}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Interests */}
          <fieldset>
            <legend className="text-sm font-medium text-[var(--text)]">
              Interests{' '}
              <span className="font-normal text-[var(--text-3)]">— pick any</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {INTERESTS.map(opt => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                    interests.includes(opt.value)
                      ? 'border-[var(--cta)] bg-[var(--cta)] text-white'
                      : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] hover:border-[var(--border-hi)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={interests.includes(opt.value)}
                    onChange={() => toggleItem(interests, opt.value, setInterests)}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Dietary restrictions */}
          <fieldset>
            <legend className="text-sm font-medium text-[var(--text)]">
              Dietary restrictions{' '}
              <span className="font-normal text-[var(--text-3)]">— pick any that apply</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {DIETARY.map(opt => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                    dietary.includes(opt.value)
                      ? 'border-[var(--cta)] bg-[var(--cta)] text-white'
                      : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] hover:border-[var(--border-hi)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={dietary.includes(opt.value)}
                    onChange={() => toggleItem(dietary, opt.value, setDietary)}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <p className="text-sm text-[var(--error)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-[var(--cta)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--cta-h)] disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Start planning'}
          </button>
        </form>
      </div>
    </div>
  )
}

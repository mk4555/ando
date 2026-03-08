'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import FlightSection from './FlightSection'
import type { TripFlights } from '@/lib/types'

interface Props {
  tripId: string
  initialFlights: TripFlights
}

export default function FlightPageForm({ tripId, initialFlights }: Props) {
  const [flights, setFlights] = useState<TripFlights>(initialFlights)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  async function handleSave() {
    setSaving(true)
    setStatus('idle')

    const res = await fetch(`/api/trips/${tripId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: { flights } }),
    })

    setSaving(false)
    setStatus(res.ok ? 'saved' : 'error')
  }

  return (
    <div className="flex flex-col gap-6">
      <FlightSection value={flights} onChange={setFlights} disabled={saving} />

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save flights'}
        </Button>
        {status === 'saved' && (
          <span className="text-sm text-[var(--text-2)]">Saved.</span>
        )}
        {status === 'error' && (
          <span className="text-sm text-[var(--error)]">Failed to save. Please try again.</span>
        )}
      </div>
    </div>
  )
}

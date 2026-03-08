'use client'

import { FieldLabel, FormInput } from '@/components/ui/form'
import type { FlightLeg } from '@/lib/types'
import styles from './FlightLegFields.module.css'

interface Props {
  value: FlightLeg
  onChange: (leg: FlightLeg) => void
  disabled?: boolean
}

export default function FlightLegFields({ value, onChange, disabled }: Props) {
  function set<K extends keyof FlightLeg>(key: K, val: FlightLeg[K]) {
    onChange({ ...value, [key]: val })
  }

  return (
    <div className={styles.grid}>
      <div className={styles.row2}>
        <div>
          <FieldLabel optionalHint="optional">Airline</FieldLabel>
          <FormInput
            type="text"
            value={value.airline ?? ''}
            onChange={e => set('airline', e.target.value)}
            placeholder="e.g. Delta"
            disabled={disabled}
          />
        </div>
        <div>
          <FieldLabel optionalHint="optional">Flight number</FieldLabel>
          <FormInput
            type="text"
            value={value.flight_number ?? ''}
            onChange={e => set('flight_number', e.target.value)}
            placeholder="e.g. DL 401"
            disabled={disabled}
          />
        </div>
      </div>

      <div className={styles.row2}>
        <div>
          <FieldLabel optionalHint="optional">Departure airport</FieldLabel>
          <FormInput
            type="text"
            value={value.departure_airport ?? ''}
            onChange={e => set('departure_airport', e.target.value.toUpperCase())}
            placeholder="IATA, e.g. JFK"
            maxLength={3}
            disabled={disabled}
          />
        </div>
        <div>
          <FieldLabel optionalHint="optional">Departure date &amp; time</FieldLabel>
          <FormInput
            type="datetime-local"
            value={value.departure_datetime ?? ''}
            onChange={e => set('departure_datetime', e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className={styles.row2}>
        <div>
          <FieldLabel optionalHint="optional">Arrival airport</FieldLabel>
          <FormInput
            type="text"
            value={value.arrival_airport ?? ''}
            onChange={e => set('arrival_airport', e.target.value.toUpperCase())}
            placeholder="IATA, e.g. LAX"
            maxLength={3}
            disabled={disabled}
          />
        </div>
        <div>
          <FieldLabel optionalHint="optional">Arrival date &amp; time</FieldLabel>
          <FormInput
            type="datetime-local"
            value={value.arrival_datetime ?? ''}
            onChange={e => set('arrival_datetime', e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <FieldLabel optionalHint="optional">Booking reference</FieldLabel>
        <FormInput
          type="text"
          value={value.booking_reference ?? ''}
          onChange={e => set('booking_reference', e.target.value.toUpperCase())}
          placeholder="e.g. ABC123"
          disabled={disabled}
        />
      </div>
    </div>
  )
}

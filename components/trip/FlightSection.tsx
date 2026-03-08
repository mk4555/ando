'use client'

import FlightLegFields from './FlightLegFields'
import type { TripFlights, FlightLeg } from '@/lib/types'
import styles from './FlightSection.module.css'

const EMPTY_LEG: FlightLeg = {}

interface Props {
  value: TripFlights
  onChange: (flights: TripFlights) => void
  disabled?: boolean
}

export default function FlightSection({ value, onChange, disabled }: Props) {
  return (
    <div className={styles.root}>
      <div className={styles.leg}>
        <h3 className={styles.legTitle}>Outbound flight</h3>
        <FlightLegFields
          value={value.outbound ?? EMPTY_LEG}
          onChange={outbound => onChange({ ...value, outbound })}
          disabled={disabled}
        />
      </div>

      <div className={styles.divider} />

      <div className={styles.leg}>
        <h3 className={styles.legTitle}>Return flight</h3>
        <FlightLegFields
          value={value.return ?? EMPTY_LEG}
          onChange={ret => onChange({ ...value, return: ret })}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

export function formatTripDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTripDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const mo: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }

  if (s.getFullYear() !== e.getFullYear()) {
    return (
      s.toLocaleDateString('en-US', { ...mo, year: 'numeric' }) +
      ' - ' +
      e.toLocaleDateString('en-US', { ...mo, year: 'numeric' })
    )
  }
  if (s.getMonth() === e.getMonth()) {
    return `${s.toLocaleDateString('en-US', { month: 'short' })} ${s.getDate()}-${e.getDate()}, ${e.getFullYear()}`
  }
  return (
    s.toLocaleDateString('en-US', mo) +
    ' - ' +
    e.toLocaleDateString('en-US', mo) +
    `, ${e.getFullYear()}`
  )
}

const DESTINATION_IMAGES: Record<string, string> = {
  'tokyo':        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  'kyoto':        'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
  'osaka':        'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80',
  'paris':        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'london':       'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  'rome':         'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
  'barcelona':    'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80',
  'lisbon':       'https://images.unsplash.com/photo-1585208798174-6cedd4b79b23?w=800&q=80',
  'new york':     'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  'bangkok':      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80',
  'bali':         'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  'seoul':        'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80',
  'amsterdam':    'https://images.unsplash.com/photo-1508930175039-49e8dca9edaf?w=800&q=80',
  'prague':       'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80',
  'istanbul':     'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
  'dubai':        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  'singapore':    'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
  'sydney':       'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
  'mexico city':  'https://images.unsplash.com/photo-1575997341022-8bb07b18f51e?w=800&q=80',
  'cape town':    'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80',
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80'

export function getDestinationImage(destination: string): string {
  if (!destination.trim()) return FALLBACK_IMAGE
  const lower = destination.toLowerCase()
  for (const [key, url] of Object.entries(DESTINATION_IMAGES)) {
    if (lower.includes(key)) return url
  }
  return FALLBACK_IMAGE
}

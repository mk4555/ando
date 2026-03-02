import { NextResponse } from 'next/server'

interface GeoapifyResult {
  formatted: string
  country_code: string
}

interface GeoapifyResponse {
  results: GeoapifyResult[]
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()

  if (!q) {
    return NextResponse.json({ error: 'Missing q parameter' }, { status: 400 })
  }

  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Autocomplete not configured' }, { status: 500 })
  }

  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(q)}&type=city&limit=6&lang=en&format=json&apiKey=${apiKey}`

  let data: GeoapifyResponse
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Geoapify responded ${res.status}`)
    data = await res.json()
  } catch {
    return NextResponse.json({ error: 'Autocomplete service unavailable' }, { status: 502 })
  }

  const suggestions = (data.results ?? []).map((r) => ({
    label: r.formatted,
    countryCode: (r.country_code ?? '').toUpperCase(),
  }))

  return NextResponse.json(suggestions)
}

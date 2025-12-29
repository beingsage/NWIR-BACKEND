const PLACE_KEYWORDS: Record<string, string> = {
  muJ: 'Jaipur',
  muj: 'Jaipur',
  manipal: 'Jaipur',
  iit: 'Delhi',
  airport: 'Nearby Airport',
}

export function inferFromText(text?: string | null) {
  if (!text) return null
  text = text.toLowerCase()
  for (const key in PLACE_KEYWORDS) {
    if (text.includes(key)) {
      return { region: PLACE_KEYWORDS[key], confidence: 0.45 }
    }
  }
  return null
}

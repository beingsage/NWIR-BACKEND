// VERY simplified prefix map (hackathon-ready)
const PREFIX_MAP: Record<string, { region: string; confidence: number }> = {
  '+9198': { region: 'Rajasthan', confidence: 0.35 },
  '+9199': { region: 'Delhi NCR', confidence: 0.35 },
  '+9197': { region: 'Maharashtra', confidence: 0.35 },
}

export function inferFromNumber(phone: string | undefined) {
  if (!phone) return { region: 'Unknown', confidence: 0.1 }
  const prefix = phone.slice(0, 5)
  return PREFIX_MAP[prefix] || { region: 'Unknown', confidence: 0.1 }
}

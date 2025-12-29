import { inferFromNumber } from './numberMetadata'
import { inferFromText } from './contextInference'
import { inferFromHistory } from './historyInference'
import * as repo from '../repo/db'

export async function inferLocation({ phone, text }: { phone?: string; text?: string }) {
  const signals: Array<{ region: string; confidence: number; source: string }> = []

  // number
  const numberSignal = inferFromNumber(phone)
  signals.push({ region: numberSignal.region, confidence: numberSignal.confidence, source: 'number_metadata' })

  // context text
  if (text) {
    const contextSignal = inferFromText(text)
    if (contextSignal) signals.push({ region: contextSignal.region, confidence: contextSignal.confidence, source: 'user_context' })
  }

  // history
  const historySignal = await inferFromHistory(phone)
  if (historySignal) signals.push({ region: historySignal.region, confidence: historySignal.confidence, source: 'history' })

  // Fusion
  const scoreMap: Record<string, number> = {}
  let totalConfidence = 0

  signals.forEach((s) => {
    if (!scoreMap[s.region]) scoreMap[s.region] = 0
    scoreMap[s.region] += s.confidence
    totalConfidence += s.confidence
  })

  let bestRegion = 'Unknown'
  let bestScore = 0
  for (const region in scoreMap) {
    if (scoreMap[region] > bestScore) {
      bestRegion = region
      bestScore = scoreMap[region]
    }
  }

  const result = {
    estimated_location: bestRegion,
    confidence: Math.min(bestScore, 1),
    sources: signals.reduce((acc: any, s) => {
      acc[s.source] = s.confidence
      return acc
    }, {}),
    raw_signals: signals,
  }

  // Save history so system learns
  try {
    await repo.createCallHistory({ phone, inferredLocation: result.estimated_location, timestamp: new Date() })
  } catch (e) {
    // don't block inference if saving fails
    // eslint-disable-next-line no-console
    console.warn('Failed to save call history:', (e as Error).message)
  }

  return result
}

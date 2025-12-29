// AI Trust Scoring Engine for Worker Verification System
// This module calculates dynamic trust scores based on multiple factors

export interface TrustFactors {
  backgroundCheckStatus: "passed" | "pending" | "failed"
  policeVerification: "cleared" | "pending" | "flagged"
  biometricMatch: number // 0-100
  deviceIntegrity: "verified" | "warning" | "compromised"
  complaintHistory: number // number of complaints
  routeCompliance: number // percentage 0-100
  deliveryRating: number // 1-5
  contractStatus: "active" | "expired" | "suspended"
  incidentHistory: number // number of incidents
  verificationFrequency: number // verifications per month
  geofenceViolations: number // count
  deviceAttestationFailures: number // count
  employmentDuration: number // months
  trainingCompleted: boolean
}

export interface TrustScoreResult {
  score: number
  level: "GREEN" | "YELLOW" | "RED"
  factors: {
    name: string
    impact: "positive" | "negative" | "neutral"
    weight: number
    contribution: number
  }[]
  recommendations: string[]
  riskFlags: string[]
}

// Weight configuration for different trust factors
const FACTOR_WEIGHTS = {
  backgroundCheck: 20,
  policeVerification: 15,
  biometricMatch: 10,
  deviceIntegrity: 10,
  complaints: 10,
  routeCompliance: 8,
  deliveryRating: 7,
  contractStatus: 5,
  incidents: 8,
  verificationFrequency: 3,
  geofenceViolations: 5,
  deviceAttestations: 4,
  employmentDuration: 3,
  training: 2,
}

export function calculateTrustScore(factors: TrustFactors): TrustScoreResult {
  const factorResults: TrustScoreResult["factors"] = []
  let totalScore = 0
  const riskFlags: string[] = []
  const recommendations: string[] = []

  // Background Check (20 points)
  let bgScore = 0
  if (factors.backgroundCheckStatus === "passed") {
    bgScore = FACTOR_WEIGHTS.backgroundCheck
  } else if (factors.backgroundCheckStatus === "pending") {
    bgScore = FACTOR_WEIGHTS.backgroundCheck * 0.5
    recommendations.push("Complete background verification for full trust score")
  } else {
    bgScore = 0
    riskFlags.push("Background check failed - HIGH RISK")
  }
  factorResults.push({
    name: "Background Check",
    impact: bgScore > 10 ? "positive" : bgScore > 0 ? "neutral" : "negative",
    weight: FACTOR_WEIGHTS.backgroundCheck,
    contribution: bgScore,
  })
  totalScore += bgScore

  // Police Verification (15 points)
  let pvScore = 0
  if (factors.policeVerification === "cleared") {
    pvScore = FACTOR_WEIGHTS.policeVerification
  } else if (factors.policeVerification === "pending") {
    pvScore = FACTOR_WEIGHTS.policeVerification * 0.3
    recommendations.push("Expedite police verification process")
  } else {
    pvScore = 0
    riskFlags.push("Police verification flagged - ALERT")
  }
  factorResults.push({
    name: "Police Verification",
    impact: pvScore > 7 ? "positive" : pvScore > 0 ? "neutral" : "negative",
    weight: FACTOR_WEIGHTS.policeVerification,
    contribution: pvScore,
  })
  totalScore += pvScore

  // Biometric Match (10 points)
  const biometricScore = (factors.biometricMatch / 100) * FACTOR_WEIGHTS.biometricMatch
  if (factors.biometricMatch < 80) {
    riskFlags.push("Low biometric match confidence")
  }
  factorResults.push({
    name: "Biometric Verification",
    impact: biometricScore > 7 ? "positive" : biometricScore > 5 ? "neutral" : "negative",
    weight: FACTOR_WEIGHTS.biometricMatch,
    contribution: biometricScore,
  })
  totalScore += biometricScore

  // Device Integrity (10 points)
  let deviceScore = 0
  if (factors.deviceIntegrity === "verified") {
    deviceScore = FACTOR_WEIGHTS.deviceIntegrity
  } else if (factors.deviceIntegrity === "warning") {
    deviceScore = FACTOR_WEIGHTS.deviceIntegrity * 0.5
    recommendations.push("Update device security or re-register device")
  } else {
    deviceScore = 0
    riskFlags.push("Device integrity compromised - Possible spoofing")
  }
  factorResults.push({
    name: "Device Integrity",
    impact: deviceScore > 5 ? "positive" : deviceScore > 0 ? "neutral" : "negative",
    weight: FACTOR_WEIGHTS.deviceIntegrity,
    contribution: deviceScore,
  })
  totalScore += deviceScore

  // Complaint History (10 points) - inverse scoring
  const complaintScore = Math.max(0, FACTOR_WEIGHTS.complaints - factors.complaintHistory * 2)
  if (factors.complaintHistory > 3) {
    riskFlags.push(`${factors.complaintHistory} customer complaints on record`)
  }
  factorResults.push({
    name: "Complaint History",
    impact: complaintScore > 7 ? "positive" : complaintScore > 3 ? "neutral" : "negative",
    weight: FACTOR_WEIGHTS.complaints,
    contribution: complaintScore,
  })
  totalScore += complaintScore

  // Route Compliance (8 points)
  const routeScore = (factors.routeCompliance / 100) * FACTOR_WEIGHTS.routeCompliance
  if (factors.routeCompliance < 90) {
    recommendations.push("Improve route compliance to boost trust score")
  }
  factorResults.push({
    name: "Route Compliance",
    impact: routeScore > 6 ? "positive" : routeScore > 4 ? "neutral" : "negative",
    weight: FACTOR_WEIGHTS.routeCompliance,
    contribution: routeScore,
  })
  totalScore += routeScore

  // Delivery Rating (7 points)
  const ratingScore = (factors.deliveryRating / 5) * FACTOR_WEIGHTS.deliveryRating
  factorResults.push({
    name: "Delivery Rating",
    impact: ratingScore > 5 ? "positive" : ratingScore > 3 ? "neutral" : "negative",
    weight: FACTOR_WEIGHTS.deliveryRating,
    contribution: ratingScore,
  })
  totalScore += ratingScore

  // Contract Status (5 points)
  let contractScore = 0
  if (factors.contractStatus === "active") {
    contractScore = FACTOR_WEIGHTS.contractStatus
  } else if (factors.contractStatus === "expired") {
    contractScore = FACTOR_WEIGHTS.contractStatus * 0.2
    recommendations.push("Renew employment contract immediately")
  } else {
    contractScore = 0
    riskFlags.push("Contract suspended - Verify employment status")
  }
  factorResults.push({
    name: "Contract Status",
    impact: contractScore > 3 ? "positive" : contractScore > 0 ? "neutral" : "negative",
    weight: FACTOR_WEIGHTS.contractStatus,
    contribution: contractScore,
  })
  totalScore += contractScore

  // Incident History (8 points) - inverse scoring
  const incidentScore = Math.max(0, FACTOR_WEIGHTS.incidents - factors.incidentHistory * 4)
  if (factors.incidentHistory > 0) {
    riskFlags.push(`${factors.incidentHistory} incident(s) on record`)
  }
  factorResults.push({
    name: "Incident History",
    impact: incidentScore > 5 ? "positive" : incidentScore > 2 ? "neutral" : "negative",
    weight: FACTOR_WEIGHTS.incidents,
    contribution: incidentScore,
  })
  totalScore += incidentScore

  // Geofence Violations (5 points) - inverse scoring
  const geoScore = Math.max(0, FACTOR_WEIGHTS.geofenceViolations - factors.geofenceViolations)
  if (factors.geofenceViolations > 2) {
    riskFlags.push("Multiple geofence violations detected")
  }
  factorResults.push({
    name: "Geofence Compliance",
    impact: geoScore > 3 ? "positive" : geoScore > 1 ? "neutral" : "negative",
    weight: FACTOR_WEIGHTS.geofenceViolations,
    contribution: geoScore,
  })
  totalScore += geoScore

  // Employment Duration Bonus (3 points)
  const durationScore = Math.min(FACTOR_WEIGHTS.employmentDuration, factors.employmentDuration * 0.25)
  factorResults.push({
    name: "Employment Duration",
    impact: durationScore > 2 ? "positive" : "neutral",
    weight: FACTOR_WEIGHTS.employmentDuration,
    contribution: durationScore,
  })
  totalScore += durationScore

  // Training Completed (2 points)
  const trainingScore = factors.trainingCompleted ? FACTOR_WEIGHTS.training : 0
  if (!factors.trainingCompleted) {
    recommendations.push("Complete safety and compliance training")
  }
  factorResults.push({
    name: "Training Completion",
    impact: trainingScore > 0 ? "positive" : "neutral",
    weight: FACTOR_WEIGHTS.training,
    contribution: trainingScore,
  })
  totalScore += trainingScore

  // Determine trust level
  let level: "GREEN" | "YELLOW" | "RED"
  if (totalScore >= 80) {
    level = "GREEN"
  } else if (totalScore >= 50) {
    level = "YELLOW"
  } else {
    level = "RED"
  }

  return {
    score: Math.round(totalScore),
    level,
    factors: factorResults,
    recommendations,
    riskFlags,
  }
}

// Real-time risk assessment for immediate verification
export function assessImmediateRisk(
  trustScore: number,
  currentLocation: { lat: number; lng: number },
  expectedZone: { lat: number; lng: number; radius: number },
  activeTask: boolean,
): { canProceed: boolean; warning: string | null; requiresEscalation: boolean } {
  // Check if worker is within expected zone
  const distance = calculateDistance(currentLocation, expectedZone)
  const inZone = distance <= expectedZone.radius

  if (trustScore < 50) {
    return {
      canProceed: false,
      warning: "Trust score below threshold - manual verification required",
      requiresEscalation: true,
    }
  }

  if (!inZone && activeTask) {
    return {
      canProceed: true,
      warning: "Worker outside expected zone - monitoring enabled",
      requiresEscalation: false,
    }
  }

  if (trustScore < 80) {
    return {
      canProceed: true,
      warning: "Moderate trust level - enhanced monitoring active",
      requiresEscalation: false,
    }
  }

  return {
    canProceed: true,
    warning: null,
    requiresEscalation: false,
  }
}

// Helper function to calculate distance between two points
function calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Generate AI-based risk report
export function generateRiskReport(factors: TrustFactors): string {
  const result = calculateTrustScore(factors)

  let report = `## Trust Assessment Report\n\n`
  report += `**Overall Score:** ${result.score}/100 (${result.level})\n\n`

  report += `### Factor Analysis\n`
  result.factors.forEach((factor) => {
    const icon = factor.impact === "positive" ? "✓" : factor.impact === "negative" ? "✗" : "○"
    report += `- ${icon} ${factor.name}: ${factor.contribution.toFixed(1)}/${factor.weight}\n`
  })

  if (result.riskFlags.length > 0) {
    report += `\n### Risk Flags\n`
    result.riskFlags.forEach((flag) => {
      report += `- ⚠️ ${flag}\n`
    })
  }

  if (result.recommendations.length > 0) {
    report += `\n### Recommendations\n`
    result.recommendations.forEach((rec) => {
      report += `- ${rec}\n`
    })
  }

  return report
}

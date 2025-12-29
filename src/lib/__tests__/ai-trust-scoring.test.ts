import { calculateTrustScore, assessImmediateRisk, generateRiskReport, type TrustFactors } from '../ai-trust-scoring'

describe('AI Trust Scoring', () => {
  test('calculateTrustScore returns GREEN for ideal factors', () => {
    const ideal: TrustFactors = {
      backgroundCheckStatus: 'passed',
      policeVerification: 'cleared',
      biometricMatch: 98,
      deviceIntegrity: 'verified',
      complaintHistory: 0,
      routeCompliance: 100,
      deliveryRating: 5,
      contractStatus: 'active',
      incidentHistory: 0,
      verificationFrequency: 30,
      geofenceViolations: 0,
      deviceAttestationFailures: 0,
      employmentDuration: 24,
      trainingCompleted: true,
    }

    const r = calculateTrustScore(ideal)
    expect(r.level).toBe('GREEN')
    expect(r.score).toBeGreaterThanOrEqual(80)
    expect(r.riskFlags.length).toBe(0)
  })

  test('calculateTrustScore returns RED for many negative signals', () => {
    const bad: TrustFactors = {
      backgroundCheckStatus: 'failed',
      policeVerification: 'flagged',
      biometricMatch: 20,
      deviceIntegrity: 'compromised',
      complaintHistory: 10,
      routeCompliance: 50,
      deliveryRating: 2,
      contractStatus: 'suspended',
      incidentHistory: 3,
      verificationFrequency: 1,
      geofenceViolations: 5,
      deviceAttestationFailures: 2,
      employmentDuration: 0,
      trainingCompleted: false,
    }

    const r = calculateTrustScore(bad)
    expect(r.level).toBe('RED')
    expect(r.score).toBeLessThan(50)
    expect(r.riskFlags.length).toBeGreaterThan(0)
  })

  test('assessImmediateRisk enforces escalation for low score', () => {
    const res = assessImmediateRisk(30, { lat: 12.9, lng: 77.6 }, { lat: 12.9, lng: 77.6, radius: 1 }, true)
    expect(res.canProceed).toBe(false)
    expect(res.requiresEscalation).toBe(true)
  })

  test('generateRiskReport includes factors and flags', () => {
    const f: TrustFactors = {
      backgroundCheckStatus: 'pending',
      policeVerification: 'pending',
      biometricMatch: 85,
      deviceIntegrity: 'warning',
      complaintHistory: 1,
      routeCompliance: 95,
      deliveryRating: 4.2,
      contractStatus: 'active',
      incidentHistory: 0,
      verificationFrequency: 10,
      geofenceViolations: 0,
      deviceAttestationFailures: 0,
      employmentDuration: 6,
      trainingCompleted: false,
    }

    const report = generateRiskReport(f)
    expect(report).toContain('Overall Score')
    expect(report).toContain('Factor Analysis')
  })
})

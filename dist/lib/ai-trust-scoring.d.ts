export interface TrustFactors {
    backgroundCheckStatus: "passed" | "pending" | "failed";
    policeVerification: "cleared" | "pending" | "flagged";
    biometricMatch: number;
    deviceIntegrity: "verified" | "warning" | "compromised";
    complaintHistory: number;
    routeCompliance: number;
    deliveryRating: number;
    contractStatus: "active" | "expired" | "suspended";
    incidentHistory: number;
    verificationFrequency: number;
    geofenceViolations: number;
    deviceAttestationFailures: number;
    employmentDuration: number;
    trainingCompleted: boolean;
}
export interface TrustScoreResult {
    score: number;
    level: "GREEN" | "YELLOW" | "RED";
    factors: {
        name: string;
        impact: "positive" | "negative" | "neutral";
        weight: number;
        contribution: number;
    }[];
    recommendations: string[];
    riskFlags: string[];
}
export declare function calculateTrustScore(factors: TrustFactors): TrustScoreResult;
export declare function assessImmediateRisk(trustScore: number, currentLocation: {
    lat: number;
    lng: number;
}, expectedZone: {
    lat: number;
    lng: number;
    radius: number;
}, activeTask: boolean): {
    canProceed: boolean;
    warning: string | null;
    requiresEscalation: boolean;
};
export declare function generateRiskReport(factors: TrustFactors): string;

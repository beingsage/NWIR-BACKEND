type VerificationStatus = 'GREEN' | 'YELLOW' | 'RED';
type UserRole = 'admin' | 'employer' | 'law_enforcement' | 'worker';
type GeoLocation = {
    lat: number;
    lng: number;
};
export interface VerificationRequest {
    workerId?: string;
    qrCode?: string;
    method: 'qr_scan' | 'id_lookup' | 'biometric' | 'manual';
    verifierId: string;
    verifierRole: UserRole;
    verifierName?: string;
    verifierOrganization?: string;
    location?: GeoLocation;
    locationName?: string;
    deviceInfo?: string;
}
export interface VerificationResponse {
    requestId: string;
    workerId: string;
    result: VerificationStatus;
    workerName: string;
    workerPhoto: string;
    workerId_display: string;
    trustScore: number;
    trustLevel: 'GREEN' | 'YELLOW' | 'RED';
    operationalClearanceLevel: number;
    employmentStatus: {
        isEmployed: boolean;
        employers: {
            name: string;
            role: string;
            since: string;
            logo?: string;
        }[];
    };
    backgroundCheck: {
        status: string;
        policeVerification: string;
        lastChecked: string;
        policeStation?: string;
    };
    activeTask?: {
        taskId: string;
        employer: string;
        type: string;
        destination: string;
        timeWindow: string;
        orderId?: string;
    };
    deviceStatus: {
        verified: boolean;
        model?: string;
        lastSeen: string;
        location?: string;
        attestationStatus: string;
    };
    personalInfo: {
        phone: string;
        city: string;
        state: string;
    };
    statistics: {
        totalDeliveries: number;
        avgRating: number;
        totalComplaints: number;
        memberSince: string;
    };
    riskFlags: string[];
    recommendations: string[];
    responseTimeMs: number;
    timestamp: Date;
}
export declare function verifyWorker(request: VerificationRequest): Promise<VerificationResponse>;
export declare function quickVerify(workerId: string): Promise<{
    valid: boolean;
    status: VerificationStatus;
    name: string;
    employer: string;
    trustScore: number;
    photo: string;
}>;
export declare function batchVerify(workerIds: string[], verifierId: string, verifierRole: UserRole): Promise<Map<string, {
    status: VerificationStatus;
    name: string;
}>>;
export {};

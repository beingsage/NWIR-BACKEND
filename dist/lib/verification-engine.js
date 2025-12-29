"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWorker = verifyWorker;
exports.quickVerify = quickVerify;
exports.batchVerify = batchVerify;
const db_1 = require("../repo/db");
const ai_trust_scoring_1 = require("./ai-trust-scoring");
function generateVerificationId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `VER-${timestamp}-${random}`.toUpperCase();
}
async function verifyWorker(request) {
    var _a, _b, _c, _d, _e, _f;
    const startTime = Date.now();
    // Parse workerId from QR code if provided
    let workerId = request.workerId;
    if (request.qrCode && !workerId) {
        try {
            if (request.qrCode.startsWith('NWIR-')) {
                workerId = request.qrCode;
            }
            else {
                // try decode base64 JSON
                const decoded = JSON.parse(Buffer.from(request.qrCode, 'base64').toString('utf8'));
                workerId = decoded.workerId;
            }
        }
        catch {
            workerId = request.qrCode;
        }
    }
    if (!workerId) {
        return createErrorResponse('NO_WORKER_ID', startTime);
    }
    // Fetch worker data
    const worker = await (0, db_1.getWorkerById)(workerId);
    if (!worker) {
        // Log failed verification attempt
        await (0, db_1.createAuditLog)({
            actorId: request.verifierId,
            actorRole: request.verifierRole,
            action: 'VERIFICATION_FAILED',
            resource: 'verification',
            resourceId: generateVerificationId(),
            details: { workerId, reason: 'Worker not found in registry' },
        });
        return createErrorResponse('WORKER_NOT_FOUND', startTime, workerId);
    }
    // Fetch related data in parallel
    const [contracts, devices, tasks, incidents] = await Promise.all([
        (0, db_1.getAllContracts)({ workerId }),
        (0, db_1.getDevicesByWorkerId)(workerId),
        (0, db_1.getAllTasks)({ workerId }),
        (0, db_1.getAllIncidents)({ workerId }),
    ]);
    // Get active employer details
    const activeContracts = contracts.filter((c) => c.status === 'active');
    const employerDetails = await Promise.all(activeContracts.map(async (c) => {
        const employer = await (0, db_1.getEmployerById)(c.employerId);
        return {
            name: (employer === null || employer === void 0 ? void 0 : employer.companyName) || (employer === null || employer === void 0 ? void 0 : employer.tradeName) || 'Unknown',
            role: c.type || 'worker',
            since: new Date(c.startDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }),
            logo: employer === null || employer === void 0 ? void 0 : employer.logoUrl,
        };
    }));
    // Calculate trust score using AI engine
    const trustFactors = {
        backgroundCheckStatus: worker.backgroundCheckStatus === 'cleared'
            ? 'passed'
            : worker.backgroundCheckStatus === 'pending'
                ? 'pending'
                : 'failed',
        policeVerification: worker.policeVerificationStatus === 'cleared'
            ? 'cleared'
            : worker.policeVerificationStatus === 'pending'
                ? 'pending'
                : 'flagged',
        biometricMatch: worker.facialEmbeddingRef ? 95 : 0,
        deviceIntegrity: ((_a = devices[0]) === null || _a === void 0 ? void 0 : _a.attestationStatus) === 'verified'
            ? 'verified'
            : ((_b = devices[0]) === null || _b === void 0 ? void 0 : _b.attestationStatus) === 'warning'
                ? 'warning'
                : 'compromised',
        complaintHistory: worker.totalComplaints || 0,
        routeCompliance: 100 - (worker.geofenceViolations || 0) * 5,
        deliveryRating: worker.avgRating || 0,
        contractStatus: activeContracts.length > 0 ? 'active' : contracts.length > 0 ? 'expired' : 'suspended',
        incidentHistory: worker.totalIncidents || 0,
        verificationFrequency: 15,
        geofenceViolations: worker.geofenceViolations || 0,
        deviceAttestationFailures: devices.filter((d) => d.attestationStatus !== 'verified').length,
        employmentDuration: Math.floor((Date.now() - new Date(worker.createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000)),
        trainingCompleted: worker.trainingCompleted || false,
    };
    const trustResult = (0, ai_trust_scoring_1.calculateTrustScore)(trustFactors);
    // Determine verification result based on multiple factors
    let result;
    const riskFlags = [...trustResult.riskFlags];
    if (worker.status === 'suspended') {
        result = 'RED';
        riskFlags.push('Worker account is SUSPENDED');
    }
    else if (worker.status === 'terminated') {
        result = 'RED';
        riskFlags.push('Worker account is TERMINATED');
    }
    else if (worker.status === 'fraud_suspected') {
        result = 'RED';
        riskFlags.push('FRAUD SUSPECTED - Do not proceed');
    }
    else if (worker.backgroundCheckStatus === 'rejected') {
        result = 'RED';
        riskFlags.push('Background check REJECTED');
    }
    else if (worker.policeVerificationStatus === 'flagged') {
        result = 'RED';
        riskFlags.push('Police verification FLAGGED');
    }
    else if (trustResult.score < 40) {
        result = 'RED';
        riskFlags.push('Trust score critically low');
    }
    else if (worker.status === 'investigation_pending') {
        result = 'YELLOW';
        riskFlags.push('Investigation in progress');
    }
    else if (worker.backgroundCheckStatus === 'pending') {
        result = 'YELLOW';
        riskFlags.push('Background check pending');
    }
    else if (worker.backgroundCheckStatus === 'flagged') {
        result = 'YELLOW';
        riskFlags.push('Background check flagged for review');
    }
    else if (trustResult.score < 70) {
        result = 'YELLOW';
    }
    else if (activeContracts.length === 0) {
        result = 'YELLOW';
        riskFlags.push('No active employment contract');
    }
    else {
        result = 'GREEN';
    }
    // Find active task
    const activeTask = tasks.find((t) => t.status === 'in_progress' || t.status === 'assigned');
    let activeTaskDetails;
    if (activeTask) {
        activeTaskDetails = {
            taskId: activeTask.taskId,
            employer: activeTask.employerName || 'Unknown',
            type: activeTask.type || 'delivery',
            destination: activeTask.customerAddress || 'N/A',
            timeWindow: activeTask.timeWindow
                ? `${new Date(activeTask.timeWindow.start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(activeTask.timeWindow.end).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                : 'Flexible',
            orderId: activeTask.orderId,
        };
    }
    const responseTimeMs = Date.now() - startTime;
    // Build response
    const response = {
        requestId: generateVerificationId(),
        workerId: worker.workerId,
        result,
        workerName: worker.fullName,
        workerPhoto: worker.photoUrl || '/professional-portrait.png',
        workerId_display: worker.workerId,
        trustScore: trustResult.score,
        trustLevel: trustResult.level,
        operationalClearanceLevel: worker.operationalClearanceLevel,
        employmentStatus: {
            isEmployed: employerDetails.length > 0,
            employers: employerDetails,
        },
        backgroundCheck: {
            status: worker.backgroundCheckStatus.toUpperCase(),
            policeVerification: (worker.policeVerificationStatus || 'pending').toUpperCase(),
            lastChecked: worker.policeVerificationDate ? new Date(worker.policeVerificationDate).toLocaleDateString('en-IN') : 'Not verified',
            policeStation: worker.policeStation,
        },
        activeTask: activeTaskDetails,
        deviceStatus: {
            verified: devices.some((d) => d.attestationStatus === 'verified'),
            model: (_c = devices[0]) === null || _c === void 0 ? void 0 : _c.deviceModel,
            lastSeen: ((_d = devices[0]) === null || _d === void 0 ? void 0 : _d.lastSeen) ? new Date(devices[0].lastSeen).toLocaleString('en-IN') : 'No device registered',
            location: ((_e = devices[0]) === null || _e === void 0 ? void 0 : _e.lastSeenGeo) ? `${devices[0].lastSeenGeo.lat.toFixed(4)}, ${devices[0].lastSeenGeo.lng.toFixed(4)}` : undefined,
            attestationStatus: ((_f = devices[0]) === null || _f === void 0 ? void 0 : _f.attestationStatus) || 'unverified',
        },
        personalInfo: {
            phone: maskPhone(worker.phone),
            city: worker.city,
            state: worker.state,
        },
        statistics: {
            totalDeliveries: worker.totalDeliveries || 0,
            avgRating: Math.round((worker.avgRating || 0) * 10) / 10,
            totalComplaints: worker.totalComplaints || 0,
            memberSince: new Date(worker.createdAt).toLocaleDateString('en-IN', {
                month: 'short',
                year: 'numeric',
            }),
        },
        riskFlags,
        recommendations: trustResult.recommendations,
        responseTimeMs,
        timestamp: new Date(),
    };
    // Store verification record in database
    await (0, db_1.createVerification)({
        verifierId: request.verifierId,
        verifierName: request.verifierName,
        verifierRole: request.verifierRole,
        verifierOrganization: request.verifierOrganization,
        workerId: worker.workerId,
        workerName: worker.fullName,
        method: request.method,
        result,
        reason: `Trust Score: ${trustResult.score}%. ${riskFlags.length > 0 ? riskFlags.join('. ') : 'All checks passed.'}`,
        riskFlags,
        trustScoreAtTime: trustResult.score,
        location: request.location,
        locationName: request.locationName,
        deviceInfo: request.deviceInfo,
        responseTimeMs,
    });
    // Create audit log
    await (0, db_1.createAuditLog)({
        actorId: request.verifierId,
        actorName: request.verifierName,
        actorRole: request.verifierRole,
        action: 'VERIFICATION_REQUEST',
        resource: 'verification',
        resourceId: response.requestId,
        details: {
            workerId: worker.workerId,
            workerName: worker.fullName,
            result,
            trustScore: trustResult.score,
            method: request.method,
            responseTimeMs,
        },
    });
    return response;
}
// Quick verification for QR code scans (minimal data)
async function quickVerify(workerId) {
    const worker = await (0, db_1.getWorkerById)(workerId);
    if (!worker) {
        return {
            valid: false,
            status: 'RED',
            name: 'UNKNOWN - NOT IN REGISTRY',
            employer: 'N/A',
            trustScore: 0,
            photo: '',
        };
    }
    const contracts = await (0, db_1.getAllContracts)({ workerId });
    const activeContract = contracts.find((c) => c.status === 'active');
    let employerName = 'No active employment';
    if (activeContract) {
        const employer = await (0, db_1.getEmployerById)(activeContract.employerId);
        employerName = (employer === null || employer === void 0 ? void 0 : employer.tradeName) || (employer === null || employer === void 0 ? void 0 : employer.companyName) || 'Unknown';
    }
    let status = 'GREEN';
    if (worker.status === 'suspended' ||
        worker.status === 'terminated' ||
        worker.status === 'fraud_suspected' ||
        worker.trustScore < 40) {
        status = 'RED';
    }
    else if (worker.status === 'investigation_pending' || worker.trustScore < 70) {
        status = 'YELLOW';
    }
    return {
        valid: worker.status === 'active',
        status,
        name: worker.fullName,
        employer: employerName,
        trustScore: worker.trustScore,
        photo: worker.photoUrl || '',
    };
}
// Helper function to mask phone number for privacy
function maskPhone(phone) {
    if (!phone)
        return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
        return `+91-${cleaned.slice(-10, -4)}XXXX`;
    }
    return phone;
}
// Create error response for failed verifications
function createErrorResponse(errorType, startTime, workerId) {
    const messages = {
        NO_WORKER_ID: 'No Worker ID provided',
        WORKER_NOT_FOUND: 'Worker ID not found in National Worker Identity Registry',
    };
    return {
        requestId: generateVerificationId(),
        workerId: workerId || 'UNKNOWN',
        result: 'RED',
        workerName: 'UNVERIFIED IDENTITY',
        workerPhoto: '',
        workerId_display: workerId || 'N/A',
        trustScore: 0,
        trustLevel: 'RED',
        operationalClearanceLevel: 0,
        employmentStatus: { isEmployed: false, employers: [] },
        backgroundCheck: {
            status: 'NOT_FOUND',
            policeVerification: 'NOT_FOUND',
            lastChecked: 'N/A',
        },
        deviceStatus: {
            verified: false,
            lastSeen: 'N/A',
            attestationStatus: 'unverified',
        },
        personalInfo: {
            phone: 'N/A',
            city: 'Unknown',
            state: 'Unknown',
        },
        statistics: {
            totalDeliveries: 0,
            avgRating: 0,
            totalComplaints: 0,
            memberSince: 'N/A',
        },
        riskFlags: [messages[errorType], 'IDENTITY CANNOT BE VERIFIED', 'DO NOT ALLOW ENTRY'],
        recommendations: [
            'Request physical government ID',
            'Contact local law enforcement if suspicious',
            'Report incident',
        ],
        responseTimeMs: Date.now() - startTime,
        timestamp: new Date(),
    };
}
// Batch verification for checkpoints
async function batchVerify(workerIds, verifierId, verifierRole) {
    const results = new Map();
    await Promise.all(workerIds.map(async (workerId) => {
        const quick = await quickVerify(workerId);
        results.set(workerId, { status: quick.status, name: quick.name });
    }));
    return results;
}

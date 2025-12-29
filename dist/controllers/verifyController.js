"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWorker = verifyWorker;
const response_1 = require("../utils/response");
const verification_engine_1 = require("../lib/verification-engine");
async function verifyWorker(req, res) {
    try {
        const body = req.body;
        // Support both full verify and quick QR verify
        if (body.quick && body.workerId) {
            const q = await (0, verification_engine_1.quickVerify)(body.workerId);
            return (0, response_1.ok)(res, q);
        }
        const request = {
            workerId: body.workerId,
            qrCode: body.qrCode,
            method: body.method || 'qr_scan',
            verifierId: body.verifierId || 'system',
            verifierRole: body.verifierRole || 'employer',
            verifierName: body.verifierName,
            verifierOrganization: body.verifierOrganization,
            location: body.location,
            locationName: body.locationName,
            deviceInfo: body.deviceInfo,
        };
        const result = await (0, verification_engine_1.verifyWorker)(request);
        return (0, response_1.ok)(res, result);
    }
    catch (error) {
        console.error('Verification error:', error);
        return (0, response_1.err)(res, 500, 'Verification failed');
    }
}

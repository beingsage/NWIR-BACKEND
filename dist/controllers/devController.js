"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockCall = mockCall;
exports.mockSms = mockSms;
const locationEngine_1 = require("../services/locationEngine");
const repo = __importStar(require("../repo/db"));
const dev_1 = __importDefault(require("../config/dev"));
async function mockCall(req, res) {
    if (dev_1.default.TELECOM_MODE !== 'MOCK') {
        return res.status(403).json({ error: 'Mock telecom disabled' });
    }
    const from = req.body.from;
    const digits = req.body.digits;
    const text = req.body.text;
    // If digits present, optionally map to text or context
    const simulatedText = text || (digits ? `dtmf ${digits}` : undefined);
    const inference = await (0, locationEngine_1.inferLocation)({ phone: from, text: simulatedText });
    // Log the simulated call as a call log
    try {
        await repo.createCallLog({ phone: from, to: req.body.to || 'MOCK', callSid: req.body.callSid || 'MOCK', direction: 'mock-call', body: { digits, text } });
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to save mock call log:', e.message);
    }
    return res.json({ simulated: true, inference });
}
async function mockSms(req, res) {
    if (dev_1.default.TELECOM_MODE !== 'MOCK') {
        return res.status(403).json({ error: 'Mock telecom disabled' });
    }
    const from = req.body.from;
    const text = req.body.text;
    const inference = await (0, locationEngine_1.inferLocation)({ phone: from, text });
    try {
        await repo.createCallLog({ phone: from, to: req.body.to || 'MOCK', callSid: req.body.messageSid || 'MOCK', direction: 'mock-sms', body: { text } });
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to save mock sms log:', e.message);
    }
    return res.json({ simulated: true, inference });
}
